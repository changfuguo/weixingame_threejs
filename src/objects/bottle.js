import { customAnimation, TweenAnimation } from '../../libs/animation'
import bottleConf from '../../confs/bottle-conf'
import blockConf from '../../confs/block-conf'

class Bottle {
  constructor() {
    this.direction = 0
    // 跳跃的轴
    this.axis = null
    // 物体的状态
    this.status = 'stop'
    this.scale = 1
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
    // 用于动画
    this.human = new THREE.Object3D()
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

    this.human.add(this.head)
    this.human.add(this.body)

    this.bottle.add(this.human)
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

  _shrink() {
    // 收缩-一直按下
    const MIN_SCALE = 0.55
    const HORIZON_DELTA_SCALE = 0.007
    const DELTA_SCALE = 0.005
    const HEAD_DELTA = 0.03

    this.scale -= DELTA_SCALE
    this.scale = Math.max(MIN_SCALE, this.scale)

    if(this.scale <= MIN_SCALE) {
      return
    }

    this.body.scale.y = this.scale
    this.body.scale.x += HORIZON_DELTA_SCALE
    this.body.scale.z += HORIZON_DELTA_SCALE
    
    this.head.position.y -= HEAD_DELTA
    const bottleDeltaY = HEAD_DELTA / 2
    this.obj.position.y -= bottleDeltaY
  }

  update() {
    if (this.status === 'shrink') {
      this._shrink()
    }
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

  shrink() {
    this.status = 'shrink'
  }

  stop() {
    this.scale = 1
    this.status = 'stop'
  }

  rotate() {
    const scale = 1.4
    this.human.rotation.x = this.human.rotation.z = 0
    // 沿着 x 轴跳
    if (this.direction === 0) {
      customAnimation.to(0.14, this.human.rotation, { z: this.human.rotation.z - Math.PI })
      customAnimation.to(0.18, this.human.rotation, { z: this.human.rotation.z - 2 * Math.PI}, 'Linear', 0.14)
      customAnimation.to(0.1, this.head.position, { y: this.head.position.y + 0.9 * scale, x: this.head.position.x + 0.45 * scale })
      customAnimation.to(0.1, this.head.position, { y: this.head.position.y - 0.9 * scale, x: this.head.position.x - 0.45 * scale}, 'Linear', 0.1)
      customAnimation.to(0.15, this.head.position, { y: 7.56, x: 0}, 'Linear', 0.25)
      customAnimation.to(0.1, this.body.scale, { y: Math.max(scale, 1), x: Math.max(Math.min(1 / scale, 1), 0.7), z: Math.max(Math.min(1 / scale, 1), 0.7) })
      customAnimation.to(0.1, this.body.scale, { y: Math.min(0.9 / scale, 0.7), x: Math.max(scale, 1.2), z: Math.max(scale, 1.2)}, 'Linear', 0.1)
      customAnimation.to(0.3, this.body.scale, { y: 1, x: 1, z: 1}, 'Linear', 0.2)
    } else if (this.direction === 1){
      // 沿着 y 轴跳动
      customAnimation.to(0.14, this.human.rotation, { x: this.human.rotation.x - Math.PI })
      customAnimation.to(0.18, this.human.rotation, { x: this.human.rotation.x - 2 * Math.PI }, 'Linear', 0.14 )
      customAnimation.to(0.1, this.head.position, { y: this.head.position.y + 0.9 * scale, z: this.head.position.z - 0.45 * scale })
      customAnimation.to(0.1, this.head.position, { z: this.head.position.z + 0.45 * scale, y: this.head.position.y - 0.9 * scale }, 'Linear', 0.1 )
      customAnimation.to(0.15, this.head.position, { y: 7.56, z: 0 }, 'Linear', 0.25 )
      customAnimation.to(0.05, this.body.scale, { y: Math.max(scale, 1), x: Math.max(Math.min(1 / scale, 1), 0.7), z: Math.max(Math.min(1 / scale, 1), 0.7) })
      customAnimation.to(0.05, this.body.scale, { y: Math.min(0.9 / scale, 0.7), x: Math.max(scale, 1.2), z: Math.max(scale, 1.2) }, 'Linear', 0.1 )
      customAnimation.to(0.2, this.body.scale, { y: 1, x: 1, z: 1 }, 'Linear', 0.2 )
    }
  }

  setDirection(direction, axis) {
    this.direction = direction
    this.axis = axis
  }
}

export default new Bottle()