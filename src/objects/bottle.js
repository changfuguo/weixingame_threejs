import { customAnimation, TweenAnimation } from '../../libs/animation'
import bottleConf from '../../confs/bottle-conf'
import blockConf from '../../confs/block-conf'

class Bottle {
  constructor() {
    
  }

  init() {
    // threejs 中所有的 object 可以通过 Object3D 来维护，比如瓶子是由四部分组成，我们将所有的组成放在 Object3D 中然后进行拼装；作为整体来操作

    // 用于加载纹理
    this.loader = new THREE.TextureLoader()
    this.obj = new THREE.Object3D()
    
    this.obj.name = 'bottle'
    this.obj.position.set(bottleConf.initPosition.x, bottleConf.initPosition.y + 30, bottleConf.initPosition.z)
    
    // 加载纹理
    const { specularMaterial, bottomMaterial, middleMaterial } = this.loadTexture()
    // geoemetry 的集合
    this.bottle = new THREE.Object3D()
    // head
    const headRadius = bottleConf.headRadius
    this.head = new THREE.Mesh(
      // 菱形
      new THREE.OctahedronGeometry(headRadius),
      bottomMaterial
    )
    this.head.castShadow = true

    const bottom = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.62857 * headRadius, // 上半平面的半径
        0.907143 * headRadius, // 下半平面的半径
        1.91423 * headRadius, // 高度
        20 // 边数
      ),
      bottomMaterial
    )
    bottom.castShadow = true

    const middle = new THREE.Mesh(
      new THREE.CylinderGeometry(
        headRadius / 1.4, headRadius / 1.44 * 0.88, headRadius * 1.2, 20
      ),
      middleMaterial
    )
    middle.castShadow = true
    middle.position.y = 1.3857 * headRadius
    middle.position.x = 0
    middle.position.z = 0

    const topGeometry = new THREE.SphereGeometry(headRadius / 1.4, 20, 20)
    topGeometry.scale(1, 0.54, 1)
    const top = new THREE.Mesh(
      topGeometry,
      specularMaterial
    )
    top.castShadow = true
    top.position.y = 1.813 * headRadius
    top.position.x = 0
    top.position.z = 0

    this.body = new THREE.Object3D()
    this.body.add(bottom)
    this.body.add(middle)
    this.body.add(top)

    this.head.position.y = 3.57143 * headRadius
    this.head.position.x = 0
    this.head.position.z = 0
    this.bottle.add(this.head)
    this.bottle.add(this.body)
    this.bottle.position.y = 2.2
    this.bottle.position.z = 0
    this.bottle.position.x = 0
    this.obj.add(this.bottle)
  }
  loadTexture() {
    // 小游戏加载资源是以 /game 开头，后面跟上资源的地址
    const specularTexture = this.loader.load('/game/res/images/head.png')
    const specularMaterial = new THREE.MeshBasicMaterial({
      map: specularTexture
    })
    const bottomTexture = this.loader.load('/game/res/images/bottom.png')
    const bottomMaterial = new THREE.MeshBasicMaterial({
      map: bottomTexture
    })
    const middleTexture = this.loader.load('/game/res/images/middle.png')
    const middleMaterial = new THREE.MeshBasicMaterial({
      map: middleTexture
    })
    return {
      specularMaterial,
      bottomMaterial,
      middleMaterial
    }
  }

  update() {
    this.head.rotation.y += 0.06
  }

  showup() {
    // audioManager.init.play()
    customAnimation.to(0.6, this.obj.position, {
      x: bottleConf.initPosition.x,
      y: bottleConf.initPosition.y + blockConf.height / 2,
      z: bottleConf.initPosition.z
    }, 'Bounce.easeOut')
  }
}

export default new Bottle()