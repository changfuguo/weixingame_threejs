import { customAnimation, TweenAnimation } from '../../libs/animation'
import bottleConf from '../../confs/bottle-conf'
import blockConf from '../../confs/block-conf'
import gameConf from '../../confs/game-conf'
import ScoreText from '../view3d/score-text'
import audioManager from '../modules/audio-manager'

class Bottle {
  constructor() {
    this.direction = 1
    // 跳跃的轴
    this.axis = null
    // 物体的状态
    this.status = 'stop'
    this.scale = 1
    this.flyingTime = 0
    this.velocity = {
      vx: 0,
      vy: 0
    }
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

    // 粒子数组
    this.particles = []

    // 定义两种粒子纹理
    const whiteParticleMaterial = new THREE.MeshBasicMaterial({map: this.loader.load('/game/res/images/white.png'), alphaTest: 0.5})
    const greenParticleMaterial = new THREE.MeshBasicMaterial({map: this.loader.load('/game/res/images/green.png'), alphaTest: 0.5})
    // 一个平面
    const particleGeometry = new THREE.PlaneGeometry(2, 2);

    // 创建 15 个白色粒子
    for (let i = 0; i < 15; i++) {
      const particle = new THREE.Mesh(particleGeometry, whiteParticleMaterial)
      particle.rotation.x = -Math.PI / 4
      particle.rotation.y = -Math.PI / 5
      particle.rotation.z = -Math.PI / 5
      this.particles.push(particle)
      this.obj.add(particle)
    }

    // 创建 5 个绿色粒子
    for (let i = 0; i < 5; i++) {
      const particle = new THREE.Mesh(particleGeometry, greenParticleMaterial)
      particle.rotation.x = -Math.PI / 4
      particle.rotation.y = -Math.PI / 5
      particle.rotation.z = -Math.PI / 5
      this.particles.push(particle)
      this.obj.add(particle)
    }
    // 跳跃显示分数实例
    this.scoreText = new ScoreText()
    this.scoreText.init({
      fillStyle: 0x252525
    })
    this.scoreText.instance.visible = false
    // 物体的局部旋转，以弧度来表示。
    this.scoreText.instance.rotation.y = -Math.PI / 4
    this.scoreText.instance.scale.set(0.5, 0.5, 0.5)
    this.obj.add(this.scoreText.instance)
  }

  showAddScore(score) {
    // 分数动画-向上且透明度逐渐减小
    const value = '+' + score
    this.scoreText.updateScore(value)
    this.scoreText.instance.visible = true
    this.scoreText.instance.position.y = 3
    this.scoreText.instance.material.opacity = 1

    // 位置向上移动
    customAnimation.to(0.7, this.scoreText.instance.position, {
      y: blockConf.height + 6
    })
    // 改变透明度
    TweenAnimation(this.scoreText.instance.material.opacity, 0, 0.7, 'Linear', (value, complete) => {
      this.scoreText.instance.material.opacity = value
      if (complete) {
        this.scoreText.instance.visible = false
      }
    })
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
    const deltaY = blockConf.height * DELTA_SCALE / 2
    this.obj.position.y -= bottleDeltaY + deltaY * 2
  }

  _jump(tickTime) {
    const t = tickTime / 1000
    // 水平方向的距离
    const translateH = this.velocity.vx * t
    const translateY = this.velocity.vy * t - 0.5 * gameConf.gravity * t * t - gameConf.gravity * this.flyingTime * t

    this.translateH += translateH
    this.translateY += translateY
    this.obj.translateY(translateY)
    this.obj.translateOnAxis(this.axis, translateH)
    // 整个运动的时间
    this.flyingTime = this.flyingTime + t
  }

  update() {
    if (this.status === 'shrink') {
      this._shrink()
    } else if (this.status === 'jump') {
      // 计算两次跳跃的时间间隔
      const tickTime = Date.now() - this.lastFrameTime
      this._jump(tickTime)
    }
    this.head.rotation.y += 0.06
    // 记录两次跳跃的时间间隔，用于计算跳跃的距离
    this.lastFrameTime = Date.now()
  }

  showup() {
    audioManager.init.play()
    customAnimation.to(0.6, this.obj.position, {
      x: bottleConf.initPosition.x,
      y: bottleConf.initPosition.y + blockConf.height / 2,
      z: bottleConf.initPosition.z
    }, 'Bounce.easeOut')
  }

  shrink() {
    this.status = 'shrink'
    // 执行粒子聚集动画
    this.gatherParticles()
  }

  stop() {
    this.scale = 1
    this.flyingTime = 0
    this.status = 'stop'
  }

  jump() {
    this.status = 'jump'
    this.translateH = 0
    this.translateY = 0
    // 跳跃时，初始化粒子状态
    this.resetParticles()
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
  straight () {
    this.status = 'straight'
    setTimeout( () => {
      customAnimation.to(0.4, this.obj.position, {
        y: -blockConf.height / 2 + 1.2
      }, 'Linear')
    })
  }

  // 初始化粒子状态
  resetParticles() {
    if (this.gatherTimer) {
      clearTimeout(this.gatherTimer)
    }
    this.gatherTimer = null
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].gathering = false
      this.particles[i].scattering = false
      this.particles[i].visible = false
    }
  }

  // 碰撞检测完成，进行粒子散开动画
  scatterParticles() {
    for (let i = 0; i < 10; i++) {
      this.particles[i].scattering = true
      this.particles[i].gathering = false
      this._scatterParticle(this.particles[i])
    }
  }

  // 粒子散开动画
  _scatterParticle(particle) {
    // 散开范围
    const minDistance = bottleConf.bodyWidth / 2
    const maxDistance = 2
    // 生成粒子位置
    const x = (minDistance + Math.random() * (maxDistance - minDistance)) * (1 - 2 * Math.random())
    const z = (minDistance + Math.random() * (maxDistance - minDistance)) * (1 - 2 * Math.random())
    // 物体的局部缩放
    particle.scale.set(1, 1, 1)
    particle.visible = false
    particle.position.x = x
    particle.position.y = -0.5
    particle.position.z = z

    setTimeout(((particle) => {
      return () => {
        if (!particle.scattering) return
        particle.visible = true
        const duration = 0.3 + Math.random() * 0.2
        customAnimation.to(duration, particle.scale, {
          x: 0.2,
          y: 0.2,
          z: 0.2
        })
        customAnimation.to(duration, particle.position, {
          x: 2 * x,
          y: 2.5 * Math.random() + 2,
          z: 2 * z,
        }, undefined, undefined, () => {
          particle.scattering = false
          particle.visible = false
        })
      }
    })(particle), Math.random() * 500)
  }

  // 粒子聚集动画
  gatherParticles () {
    // 取 5 个绿色，5 个白色粒子
    for (let i = 10; i < 20; i++) {
      // 聚集
      this.particles[i].gathering = true
      // 散开
      this.particles[i].scattering = false
      // 循环例子
      this._gatherParticle(this.particles[i])
    }
    this.gatherTimer = setTimeout(() => {
      // 一直加载白色粒子-一直按压就是白色粒子
      for (let i = 0; i < 10; i++) {
        this.particles[i].gathering = true
        this.particles[i].scattering = false
        this._gatherParticle(this.particles[i])
      }
    }, 500 + 1000 * Math.random())
  }

  // 粒子聚集动画
  _gatherParticle (particle) {
    // 粒子出现的距离
    const minDistance = 1
    const maxDistance = 8
    particle.scale.set(1, 1, 1)
    particle.visible = false
    // 生成位置信息
    const x = Math.random() > 0.5 ? 1 : -1
    const z = Math.random() > 0.5 ? 1 : -1
    particle.position.x = (minDistance + (maxDistance - minDistance) * Math.random()) * x
    particle.position.y = minDistance + (maxDistance - minDistance) * Math.random()
    particle.position.z = (minDistance + (maxDistance - minDistance) * Math.random()) * z

    // 闭包-保存 particle 变量
    setTimeout(((particle) => {
      return () => {
        if (!particle.gathering) return
        particle.visible = true
        const duration = 0.5 + Math.random() * 0.4
        customAnimation.to(duration, particle.scale, {
          x: 0.8 + Math.random(),
          y: 0.8 + Math.random(),
          z: 0.8 + Math.random()
        })
        customAnimation.to(duration, particle.position, {
          x: Math.random() * x,
          y: Math.random() * 2.5,
          z: Math.random() * z,
        }, undefined, undefined, () => {
          if (particle.gathering) {
            this._gatherParticle(particle)
          }
        })
      }
    })(particle), Math.random() * 500)
  }

  reset () {
    // 状态初始化
    this.stop()
    // 位置初始化
    this.obj.rotation.x = 0
    this.obj.rotation.z = 0
    this.obj.position.set(bottleConf.initPosition.x, bottleConf.initPosition.y + 30, bottleConf.initPosition.z)
  }

  forerake() {
    this.status = 'forerake'
    // 旋转动画
    setTimeout(() => {
      if (this.direction === 0) {
        // 绕 z 轴旋转
        customAnimation.to(1, this.obj.rotation, {
          z: -Math.PI / 2
        })
      } else {
        // 绕 x 轴旋转
        customAnimation.to(1, this.obj.rotation, {
          x: -Math.PI / 2
        })
      }
      // 位置下移
      setTimeout ( () => {
        customAnimation.to(0.4, this.obj.position, {
          y: -blockConf.height / 2 + 1.2
        })
      }, 350)
    }, 200)
  }

  hypsokinesis() {
    this.status = 'hypsokinesis'
    setTimeout(() => {
      if (this.direction == 0) {
        customAnimation.to(0.8, this.obj.rotation, {
          z: Math.PI / 2
        })
      } else {
        customAnimation.to(0.8, this.obj.rotation, {
          x: Math.PI / 2
        })
      }
      setTimeout ( () => {
        customAnimation.to(0.4, this.obj.position, {
          y: -blockConf.height / 2 + 1.2
        })
        customAnimation.to(0.2, this.head.position, {
          x: 1.125
        })
        customAnimation.to(0.2, this.head.position, {
          x: 0
        }, 'Linear', 0.2)
      }, 350)
    }, 200)
  }

}

export default new Bottle()