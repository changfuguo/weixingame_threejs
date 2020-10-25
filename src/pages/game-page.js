import { scene } from '../scene/index'
import Cuboid from '../block/cuboid'
import Cylinder from '../block/cylinder'
import ground from '../objects/ground'
import bottle from '../objects/bottle'
import blockConf from '../../confs/block-conf'
import gameConf from '../../confs/game-conf'
import bottleConf from '../../confs/bottle-conf'
import { stopAllAnimation } from '../../libs/animation'
import audioManager from '../modules/audio-manager'
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
    if (this.bottle) {
      this.bottle.update()
    }
    if (this.currentBlock) {
      this.currentBlock.update()
    }
    this.scene.render()
    requestAnimationFrame(this.render.bind(this))
  }

  addInitBlock() {
    const cuboidBlock = this.currentBlock = new Cuboid(-15, 0, 0)
    const cylinderBlock = new Cylinder(23, 0, 0)
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