import gameView from './view'
import gameModel from './model'

class GameController {
  constructor() {
    this.gameView = gameView
    this.gameModel = gameModel
    // push event 事件
    this.gameModel.stageChanged.attach((sender, args) => {
      const stageName = args.stage
      switch(stageName) {
        case 'game-over':
          this.gameView.showGameOverPage()
          break
        case 'game':
          this.gameView.showGamePage()
          break
        default:
      }
    })
  }

  initPages() {
    const gamePageCallbacks = {
      showGameOverPage: () => {
        this.gameModel.setStage('game-over')
      }
    }
    const gameOverPageCallbacks = {
      gameRestart: () => {
        this.gameModel.setStage('game')
      }
    }
    // 传入回调函数-在 game page 中调用
    this.gameView.initGamePage(gamePageCallbacks)
    this.gameView.initGameOverPage(gameOverPageCallbacks)
  }
}

export default new GameController()