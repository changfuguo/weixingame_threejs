import BaseBlock from './base'

// 长方体

export default class Cuboid extends BaseBlock {
  constructor(x, y, z, width) {
    super('cuboid')
    const size = width || this.width
    const geometry = new THREE.BoxGeometry(size, this.height, size)
    // 有光照模型的材质-- 没有光照会为黑色
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff
    })
    this.instance = new THREE.Mesh(geometry, material)
    // shadow 设置，接收 shadow
    this.instance.receiveShadow = true
    this.instance.name = 'block'
    this.x = x
    this.y = y
    this.z = z
    this.instance.castShadow = true
    this.instance.position.x = this.x
    this.instance.position.y = this.y
    this.instance.position.z = this.z
  }
}