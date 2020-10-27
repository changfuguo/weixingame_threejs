import BaseBlock from './base'
import utils from '../utils/index'
import blockConf from '../../confs/block-conf'
// 长方体

export default class Cuboid extends BaseBlock {
  constructor(x, y, z, name, width) {
    super('cuboid')
    this.loader = new THREE.TextureLoader()
    const size = width || this.width
    // 有光照模型的材质-- 没有光照会为黑色
    // const material = new THREE.MeshPhongMaterial({
    //   color: 0xffffff
    // })
    if (name === 'color') {
      let currentColor
      const send = Math.floor(Math.random() * 6)
      switch(send) {
        case 0:
          currentColor = blockConf.colors.orange
          break
        case 1:
          currentColor = blockConf.colors.orangeDark
          break
        case 2:
          currentColor = blockConf.colors.green
          break
        case 3:
          currentColor = blockConf.colors.blue
          break
        case 4:
          currentColor = blockConf.colors.yellow
          break
        case 5:
          currentColor = blockConf.colors.purple
          break
        default:
      }
      // 中间层
      const innerMaterial = new THREE.MeshLambertMaterial({ color: blockConf.colors.white })
      const outerMaterial = new THREE.MeshLambertMaterial({ color: currentColor })

      const innerHeight = 3
      const outerHeight = (blockConf.height - innerHeight) / 2
      const outerGeometry = new THREE.BoxGeometry(size, outerHeight, size)
      const innerGeometry = new THREE.BoxGeometry(size, innerHeight, size)

      const totalMesh = new THREE.Object3D()

      const topMesh = new THREE.Mesh(outerGeometry, outerMaterial)
      topMesh.position.y = (innerHeight + outerHeight) / 2
      topMesh.receiveShadow = true
      topMesh.castShadow = true

      const middleMesh = new THREE.Mesh(innerGeometry, innerMaterial)
      middleMesh.receiveShadow = true
      middleMesh.castShadow = true

      const bottomMesh = new THREE.Mesh(outerGeometry, outerMaterial)
      bottomMesh.position.y = -(innerHeight + outerHeight) / 2
      // shadow 设置，接收 shadow
      bottomMesh.receiveShadow = true
      bottomMesh.castShadow = true

      totalMesh.add(topMesh)
      totalMesh.add(middleMesh)
      totalMesh.add(bottomMesh)
      this.instance = totalMesh
    } else if(name === 'well') {
      const geometry = new THREE.BoxGeometry(size, this.height, size)
      const material = new THREE.MeshLambertMaterial({
        map: this.loader.load('res/images/well.png')
      })
      utils.mapUv(280, 428, geometry, 1, 0, 0, 280, 148) // front
      utils.mapUv(280, 428, geometry, 2, 0, 148, 280, 428) // top
      utils.mapUv(280, 428, geometry, 4, 0, 0, 280, 148, true) // right
      this.instance = new THREE.Mesh(geometry, material)
      // shadow 设置，接收 shadow
      this.instance.receiveShadow = true
      this.instance.castShadow = true
    }
    this.instance.name = 'block'
    this.x = x
    this.y = y
    this.z = z
    this.instance.position.x = this.x
    this.instance.position.y = this.y
    this.instance.position.z = this.z
  }
}