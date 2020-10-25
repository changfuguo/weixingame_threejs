import { scene } from '../scene/index'
import Cuboid from '../block/cuboid'
import Cylinder from '../block/cylinder'
import ground from '../objects/ground'
import bottle from '../objects/bottle'

class GamePage {
  constructor(callbacks) {
    this.callbacks = callbacks
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
    this.render()
  }
  
  render() {
    this.scene.render()

    if (this.bottle) {
      this.bottle.update()
    }
    requestAnimationFrame(this.render.bind(this))
  }

  addInitBlock() {
    const cuboidBlock = new Cuboid(-15, 0, 0)
    const cylinderBlock = new Cylinder(23, 0, 0)
    this.scene.instance.add(cuboidBlock.instance)
    this.scene.instance.add(cylinderBlock.instance)
  }

  addGround() {
    this.scene.instance.add(this.ground.instance)
    // 调用物体动画
    this.bottle.showup()
  }

  addBottle() {
    this.scene.instance.add(this.bottle.obj)
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