import camera from './camera'
import light from './light'
import background from '../objects/background'

class Scene {
  constructor() {
    this.instance = null
  }

  reset() {
    this.camera.reset()
    this.light.reset()
  }

  init() {
    this.instance = new THREE.Scene()
    const renderer = this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true, // 打开抗锯齿
      preserveDrawingBuffer: true // 保留上次的缓冲区
    })
    // 开启阴影
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    
    this.camera = camera
    this.light = light
    this.camera.init()

    this.light.init()
    this.axesHelper = new THREE.AxesHelper(100)
    this.instance.add(this.axesHelper)
    this.instance.add(this.camera.instance)

    for (let lightType in this.light.instances) {
      this.instance.add(this.light.instances[lightType])
    }

    this.background = background
    this.background.init()
    this.background.instance.position.z = -84
    // 相机添加背景
    this.camera.instance.add(this.background.instance)
  }

  render() {
    this.renderer.render(this.instance, this.camera.instance)
  }

  updateCameraPosition(targetPosition) {
    this.camera.updatePosition(targetPosition)
    this.light.updatePosition(targetPosition)
  }
}

export default new Scene()