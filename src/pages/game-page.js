import { scene } from '../scene/index'
import Cuboid from '../block/cuboid'
import Cylinder from '../block/cylinder'
import ground from '../objects/ground'
import bottle from '../objects/bottle'
import blockConf from '../../confs/block-conf'
import gameConf from '../../confs/game-conf'
import bottleConf from '../../confs/bottle-conf'
// import { stopAllAnimation } from '../../libs/animation'
// import audioManager from '../modules/audio-manager'
import utils from '../utils/index'

const HIT_NEXT_BLOCK_CENTER = 1
const HIT_CURRENT_BLOCK = 2
const GAME_OVER_NEXT_BLOCK_BACK = 3
const GAME_OVER_CURRENT_BLOCK_BACK = 4
const GAME_OVER_NEXT_BLOCK_FRONT = 5
const GAME_OVER_BOTH = 6
const HIT_NEXT_BLOCK_NORMAL = 7

class GamePage {
  constructor(callbacks) {
    this.callbacks = callbacks
    this.targetPosition = {}
    this.checkingHit = false
  }
  init() {
    this.scene = scene
    this.ground = ground
    this.bottle = bottle
    this.scene.init()
    this.ground.init()
    this.bottle.init()
    this.addInitBlock()
    this.addGround()
    this.addBottle()
    this.bindTouchEvent()
    this.render()
  }
  
  bindTouchEvent() {
    this.touchStartCallback = this.touchStartCallback.bind(this)
    this.touchEndCallback = this.touchEndCallback.bind(this)
    canvas.addEventListener('touchstart', this.touchStartCallback)
    canvas.addEventListener('touchend', this.touchEndCallback)
  }

  removeTouchEvent() {
    canvas.removeEventListener('touchstart', this.touchStartCallback)
    canvas.removeEventListener('touchend', this.touchEndCallback)
  }

  touchStartCallback() {
    this.touchStartTime = Date.now()
    this.bottle.shrink()
    this.currentBlock.shrink()
  }

  touchEndCallback() { 
    this.touchEndTime = Date.now()
    const duration = this.touchEndTime - this.touchStartTime
    this.bottle.velocity.vx = Math.min(duration / 6, 400)
    this.bottle.velocity.vx = +this.bottle.velocity.vx.toFixed(2)
    this.bottle.velocity.vy = Math.min(150 + duration / 20, 400)
    this.bottle.velocity.vy = +this.bottle.velocity.vy.toFixed(2)
    this.bottle.stop()
    // 获取碰撞的状态
    // 下压的距离 this.currentBlock.instance.scale.y 是当前块的变化量
    const initY = (1 - this.currentBlock.instance.scale.y) * blockConf.height
    this.hit = this.getHitStatus(this.bottle, this.currentBlock, this.nextBlock, initY)
    this.checkingHit = true
    this.currentBlock.rebound()
    // 设置瓶子的初速度
    this.bottle.rotate()
    this.bottle.jump()
  }

  setDirection(direction) {
    // 去当前 bottle 的位置
    const currentPosision = {
      x: this.bottle.obj.position.x,
      z: this.bottle.obj.position.z
    }

    this.axis = new THREE.Vector3(this.targetPosition.x - currentPosision.x, 0, this.targetPosition.z - currentPosision.z)
    // 归一化
    this.axis.normalize()
    this.bottle.setDirection(direction, this.axis)
  }

  render() {
    if (this.currentBlock) {
      this.currentBlock.update()
    }
    this.scene.render()
    if (this.bottle) {
      this.bottle.update()
    }
    // 等到用户按压结束，进行碰撞检测-出发后续动画
    if (this.checkingHit) {
      this.checkBottleHit()
    }
    requestAnimationFrame(this.render.bind(this))
  }

  addInitBlock() {
    const cuboidBlock = this.currentBlock = new Cuboid(-15, 0, 0)
    const cylinderBlock = this.nextBlock = new Cylinder(23, 0, 0)
    this.targetPosition = {
      x: 23,
      y: 0,
      z: 0
    }
    const initPosition = 0
    this.scene.instance.add(cuboidBlock.instance)
    this.scene.instance.add(cylinderBlock.instance)
    this.setDirection(initPosition)
  }

  addGround() {
    this.scene.instance.add(this.ground.instance)
    // 调用物体动画
    this.bottle.showup()
  }

  addBottle() {
    this.scene.instance.add(this.bottle.obj)
  }

  getHitStatus(bottle, currentBlock, nextBlock, initY) {
    // 竖直上抛运动飞行时间
    let flyingTime = parseFloat(bottle.velocity.vy) / parseFloat(gameConf.gravity) * 2.0
    initY = initY || bottle.obj.position.y.toFixed(2)
    const time = +((bottle.velocity.vy - Math.sqrt(Math.pow(bottle.velocity.vy, 2) - 2 * initY * gameConf.gravity)) / gameConf.gravity).toFixed(2)
    flyingTime -= time
    flyingTime = +flyingTime.toFixed(2)
    const destination = []
    const bottlePosition = new THREE.Vector2(bottle.obj.position.x, bottle.obj.position.y)
    // 水平方向上跳跃的距离，根据跳转的方向计算
    const translate = new THREE.Vector2(this.axis.x, this.axis.z).setLength(bottle.velocity.vx * flyingTime)
    // bottle 下一次跳跃的位置
    bottlePosition.add(translate)
    bottle.destination = [+bottlePosition.x.toFixed(2), +bottlePosition.y.toFixed(2)]
    destination.push(+bottlePosition.x.toFixed(2), +bottlePosition.y.toFixed(2))
    // 碰撞检测逻辑
    // 跳跃的结果有两种，一种是跳到了当前块（用户按下力度小），另一种是跳到下一个 block 上。
    let result1, result2
    if (nextBlock) {
      // 计算下一个 block 与当前位置的欧氏距离
      const nextDiff = Math.pow(destination[0] - nextBlock.instance.position.x, 2) + Math.pow(destination[1] - nextBlock.instance.position.y, 2)
      // 获取每个 block 在坐标系中的顶点
      const nextPolygon = nextBlock.getVertices()
      
      // 判断 destination 是不是在下一个 block 的范围内，destination 是跳跃后的位置
      // 射线法计算是否在多边形内
      if (utils.pointInPolygon(destination, nextPolygon)) {
        // 跳跃的位置比较靠近 nextBlock 的中心
        if (Math.abs(nextDiff) < 5) {
          result1 = HIT_NEXT_BLOCK_CENTER
        } else {
          result1 = HIT_NEXT_BLOCK_NORMAL
        }
      } else if (utils.pointInPolygon([destination[0] - bottleConf.bodyWidth / 2, destination[1]], nextPolygon) || utils.pointInPolygon([destination[0], destination[1] + bottleConf.bodyWidth / 2], nextPolygon)) {
        result1 = GAME_OVER_NEXT_BLOCK_BACK
      } else if (utils.pointInPolygon([destination[0] + bottleConf.bodyWidth / 2, destination[1]], nextPolygon) || utils.pointInPolygon([destination[0], destination[1] - bottleConf.bodyWidth / 2], nextPolygon)) {
        result1 = GAME_OVER_NEXT_BLOCK_FRONT
      }
    }

    // currentBlock 的碰撞检测
    if (currentBlock) {
      const currentPolygon = currentBlock.getVertices()
      if (utils.pointInPolygon(destination, currentPolygon)) {
        result2 = HIT_CURRENT_BLOCK
      } else if (utils.pointInPolygon([destination[0] - bottleConf.bodyWidth / 2, destination[1]], currentPolygon) || utils.pointInPolygon([destination[0], destination[1] + bottleConf.bodyWidth / 2], currentPolygon)) {
        if (result1) {
          result2 = GAME_OVER_BOTH
        }
        result2 = GAME_OVER_CURRENT_BLOCK_BACK
      }
    }
    return result1 || result2 || 0
  }

  checkBottleHit() {
    if (this.bottle.obj.position.y <= blockConf.height / 2 && this.bottle.status === 'jump' && this.bottle.flyingTime > 0.3) {
      this.checkingHit = true
      if (this.hit == HIT_NEXT_BLOCK_CENTER || this.hit == HIT_NEXT_BLOCK_NORMAL || this.hit == HIT_CURRENT_BLOCK) {
        // 游戏继续
        this.bottle.stop()
        this.bottle.obj.position.y = blockConf.height / 2
        this.bottle.obj.position.x = this.bottle.destination[0]
        this.bottle.obj.position.z = this.bottle.destination[1]
      } else {
        // game over
        this.removeTouchEvent()
        this.callbacks.showGameOverPage()
      }
    }
  }

  uploadScore () {
    const openDataContext = wx.getOpenDataContext()
    openDataContext.postMessage({
      type: 'updateMaxScore',
      score: this.score
    })
    this.score = 0
  }
  show() {
    this.mesh.visible = true
  }

  hide() {
    this.mesh.visible = false
  }

  restart() {
    console.log('game page restart')
  }
}

export default GamePage