class GameOverPage {
  constructor(callbacks) {
    this.callbacks = callbacks
  }
  init(options) {
    this.initGameoverCanvas(options)
  }

  initGameoverCanvas(options) {
    const aspect = window.innerHeight / window.innerWidth
    this.scene = options.scene.instance
    this.canvas = document.createElement('canvas')
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    // 纹理
    this.texture = new THREE.Texture(this.canvas)
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide // 绘制两面
    })
    // 创建矩形平面
    this.geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight)
    this.obj = new THREE.Mesh(this.geometry, this.material)
    this.obj.position.z = 1
    // 旋转图形
    this.obj.rotation.y = Math.PI
    // 绘制图形
    this.context = this.canvas.getContext('2d')
    this.context.fillStyle = '#333'
    // 绘制矩形，位置以及长宽
    this.context.fillRect((window.innerWidth - 200) / 2, (window.innerHeight - 100) / 2, 200, 100)
    this.context.fillStyle = '#eee'
    this.context.font = '20px Georgia'
    this.context.fillText('Game Over', (window.innerWidth - 200) / 2 + 50, (window.innerHeight - 100) / 2 + 55)
    this.texture.needsUpdate = true
    this.obj.visible = false
    this.scene.add(this.obj)
  }

  show() {
    this.obj.visible = true
  }

  hide() {
    this.obj.visible = false
  }
}

export default GameOverPage