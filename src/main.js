import * as THREE from '../libs/three'
import game from './game/game.js'
window.THREE = THREE
/**
 * 游戏主函数
 */
class Main {
  constructor() {

  }
  static init() {
    game.init()
  }
}
export default Main()