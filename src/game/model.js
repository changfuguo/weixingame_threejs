import Event from '../utils/event'

class GameModel {
  constructor() {
    // 当前显示的页面的场景
    this.stage = ''
    this.stageChanged = new Event(this)
  }

  getStage() {
    return this.stage
  }

  setStage(stage) {
    this.stage = stage
    // 动态出发 view 变化
    this.stageChanged.notify({
      stage
    })
  }
}

export default new GameModel()