import font from './font'

export default class ScoreText {
  constructor () {

  }

  init (options) {
    this.material = new THREE.MeshBasicMaterial({color: (options && options.fillStyle) ? options.fillStyle : 0xffffff, transparent: true})
    if (options && options.opacity) {
      this.material.opacity = options.opacity
    }
    this.options = options || {}
    // 文字类型
    const geometry = new THREE.TextGeometry('0', {'font': font, 'size': 6.0, 'height': 0.1})
    this.instance = new THREE.Mesh(geometry, this.material)
    this.instance.name = 'scoreText'
  }

  updateScore (score) {
    const scoreStr = score.toString()
    // 可以直接修改 geometry
    this.instance.geometry = new THREE.TextGeometry(scoreStr, {'font': font, 'size': 6.0, 'height': 0.1})
  }
}