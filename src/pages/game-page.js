import { scene } from '../scene/index'
import Cuboid from '../block/cuboid'
import Cylinder from '../block/cylinder'
import ground from '../objects/ground'
import bottle from '../objects/bottle'
import blockConf from '../../confs/block-conf'
import gameConf from '../../confs/game-conf'
import bottleConf from '../../confs/bottle-conf'
import { stopAllAnimation } from '../../libs/animation'
import utils from '../utils/index'
import ScoreText from '../view3d/score-text'
import tailSystem from '../objects/tail'
import audioManager from '../modules/audio-manager'

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
    this.score = 0
    this.combo = 0
    this.now = Date.now()
    this.lastFrameTime = Date.now()
  }
  init() {
    this.initRankListCanvas()
    this.scene = scene
    this.ground = ground
    this.bottle = bottle
    this.tailSystem = tailSystem
    this.scoreText = new ScoreText()
    this.scene.init()
    this.ground.init()
    this.bottle.init()
    this.tailSystem.init(this.scene.instance, this.bottle)
    this.addInitBlock()
    // 初始计分器
    this.scoreText.init({
      fillStyle: 0x666699
    })
    this.addGround()
    this.addBottle()
    this.addScore()
    // 启动页面不能开启跳一跳功能
    // this.bindTouchEvent()
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
    // 打开音乐
    audioManager.shrink.play()
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
    // 结束跳跃的音频以及结束的音频
    audioManager.shrink.stop()
    audioManager.shrink_end.stop()
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
    this.now = Date.now()
    const tickTime = this.now - this.lastFrameTime
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
    if (this.tailSystem) {
      // 传入上一帧与这一帧的时间间隔
      this.tailSystem.update(tickTime)
    }
    this.lastFrameTime = Date.now()
    requestAnimationFrame(this.render.bind(this))
  }

  addScore () {
    this.scene.addScore(this.scoreText.instance)
  }

  updateScore (score) {
    this.scoreText.updateScore(score)
    // this.scene.updateScore(this.scoreText.instance)
  }

  addInitBlock() {
    const cuboidBlock = this.currentBlock = new Cuboid(-15, 0, 0, 'color')
    const cylinderBlock = this.nextBlock = new Cylinder(23, 0, 0, 'color')
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
    let flyingTime = parseFloat(bottle.velocity.vy) / parseFloat(gameConf.gravity ) * 2.0
    initY = initY || bottle.obj.position.y.toFixed(2)
    const time = +((bottle.velocity.vy - Math.sqrt(Math.pow(bottle.velocity.vy, 2) - 2 * initY * gameConf.gravity)) / gameConf.gravity).toFixed(2)
    flyingTime -= time
    flyingTime = +flyingTime.toFixed(2)
    const destination = []
    const bottlePosition = new THREE.Vector2(bottle.obj.position.x, bottle.obj.position.z)
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
      const nextDiff = Math.pow(destination[0] - nextBlock.instance.position.x, 2) + Math.pow(destination[1] - nextBlock.instance.position.z, 2)
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

  updateNextBlock() {
    const seed = Math.round(Math.random())
    const type = seed ? 'cuboid' : 'cylinder'
    const direction = Math.round(Math.random()) // 0 --> x 轴，1 --> y 轴
    const width = Math.round(Math.random() * 12) + 8
    // 距离
    const distance = Math.round(Math.random() * 20) + 20
    this.currentBlock = this.nextBlock
    const targetPosition = this.targetPosition = {}
    // 沿着 x 轴跳
    if (direction === 0) {
      targetPosition.x = this.currentBlock.instance.position.x + distance
      targetPosition.y = this.currentBlock.instance.position.y
      targetPosition.z = this.currentBlock.instance.position.z
    } else if (direction === 1) {
      // 沿着 z 轴跳
      targetPosition.x = this.currentBlock.instance.position.x
      targetPosition.y = this.currentBlock.instance.position.y
      targetPosition.z = this.currentBlock.instance.position.z - distance
    }
    this.setDirection(direction)
    if (type === 'cuboid') {
      const cuboidSeed = Math.floor(Math.random() * 2)
      this.nextBlock = new Cuboid(targetPosition.x, targetPosition.y, targetPosition.z, cuboidSeed ? 'well' : 'color', width)
    } else {
      this.nextBlock = new Cylinder(targetPosition.x, targetPosition.y, targetPosition.z, 'color', width)
    }
    this.scene.instance.add(this.nextBlock.instance)
    // 修改相机的位置
    const cameraTargetPosition = {
      x: (this.currentBlock.instance.position.x + this.nextBlock.instance.position.x) / 2,
      y: (this.currentBlock.instance.position.y + this.nextBlock.instance.position.y) / 2,
      z: (this.currentBlock.instance.position.z + this.nextBlock.instance.position.z) / 2
    }
    this.scene.updateCameraPosition(cameraTargetPosition)
    // 阴影也要变换
    this.ground.updatePosition(cameraTargetPosition)
  }

  // 检测是否发生碰撞
  checkBottleHit() {
    if (this.bottle.obj.position.y <= blockConf.height / 2 && this.bottle.status === 'jump' && this.bottle.flyingTime > 0.3) {
      this.checkingHit = true
      if (this.hit == HIT_NEXT_BLOCK_CENTER || this.hit == HIT_NEXT_BLOCK_NORMAL || this.hit == HIT_CURRENT_BLOCK) {
        // 游戏继续
        this.bottle.stop()
        this.bottle.obj.position.y = blockConf.height / 2
        this.bottle.obj.position.x = this.bottle.destination[0]
        this.bottle.obj.position.z = this.bottle.destination[1]
        // 渲染下一个 block
        if (this.hit === HIT_NEXT_BLOCK_CENTER || this.hit === HIT_NEXT_BLOCK_NORMAL) {
          if(this.hit === HIT_NEXT_BLOCK_CENTER) {
            this.combo ++
            audioManager[`combo${(this.combo <= 8) ? this.combo : '8'}`].play()
            this.score +=2 * this.combo
            // bottle 上面的分数显示
            this.bottle.showAddScore(2 * this.combo)
            this.updateScore(this.score)
          } else if (this.hit === HIT_NEXT_BLOCK_NORMAL) {
            this.combo = 0
            audioManager.success.play()
            this.bottle.showAddScore(1)
            this.updateScore(++this.score)
          }
          // 直接生成 block，并改变相机的位置
          this.updateNextBlock()
        }
      } else {
        // game over
        this.combo = 0
        this.removeTouchEvent()
        // 结束动画
        if (this.hit === GAME_OVER_NEXT_BLOCK_BACK || this.hit === GAME_OVER_CURRENT_BLOCK_BACK) {
          // 1. 停止所有的动画
          stopAllAnimation()
          // 2. 停止 bottle 的位置更新
          this.bottle.stop()
          // 3. 执行 bottle 的掉落动画
          // 向前倾倒动画
          this.bottle.forerake()
          audioManager.fall_from_block.play()
          this.bottle.obj.position.y = blockConf.height / 2
          // 展示 gameover 页面
          setTimeout (() => {
            this.uploadScore()
            this.callbacks.showGameOverPage()
          }, 2000)
        } else if (this.hit === GAME_OVER_NEXT_BLOCK_FRONT) {
          // 1. 停止所有的动画
          stopAllAnimation()
          this.bottle.stop()
          this.bottle.hypsokinesis()
          audioManager.fall_from_block.play()
          this.bottle.obj.position.y = blockConf.height / 2
          // 展示 gameover 页面
          setTimeout (() => {
            this.uploadScore()
            this.callbacks.showGameOverPage()
          }, 2000)
        } else {
          stopAllAnimation()
          this.bottle.stop()
          this.bottle.straight()
          audioManager.fall.play()
          this.bottle.obj.position.y = blockConf.height / 2
          setTimeout (() => {
            this.uploadScore()
            this.callbacks.showGameOverPage()
          }, 2000)
        }
        this.checkingHit = false
      }
      // 开启粒子散开动画
      this.bottle.scatterParticles()
    }
  }

  uploadScore () {
    // 通过 postMessage 将分数传到开放数据域中
    const openDataContext = wx.getOpenDataContext()
    openDataContext.postMessage({
      type: 'updateMaxScore',
      score: this.score
    })
    this.score = 0
  }

  initRankListCanvas () {
    const openDataContext = wx.getOpenDataContext()
    openDataContext.postMessage({
      type: 'initCanvas',
      width: window.innerWidth,
      height: window.innerHeight
    })
    this.score = 0
  }

  show() {
    this.visible = true
  }

  hide() {
    this.visible = false
  }

  restart() {
    // 场景中元素的删除
    this.deleteObjectsFromScene()
    // 清空状态
    this.scene.reset()
    this.bottle.reset()
    this.ground.reset()
    // 清空分数
    this.updateScore('0')
    this.addInitBlock()
    this.addGround()
    this.addBottle()
    this.bindTouchEvent()
  }

  deleteObjectsFromScene() {
    // 返回第一个被找到的对象
    let obj = this.scene.instance.getObjectByName('block')
    while(obj) {
      this.scene.instance.remove(obj)
      if (obj.geometry) {
        obj.geometry.dispose()
      }
      if (obj.meterial) {
        obj.meterial.dispose()
      }
      obj = this.scene.instance.getObjectByName('block')
    }
    this.scene.instance.remove(this.bottle.obj)
    this.scene.instance.remove(this.ground.instance)
  }
}

export default GamePage