import blockConf from '../../confs/block-conf'

export default class BaseBlock {
  constructor(type) {
    this.type = type // cuboid | cylinder 长方体或者圆柱体
    this.height = blockConf.height
    this.width = blockConf.width
  }
}