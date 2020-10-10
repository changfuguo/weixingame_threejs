import GamePage from '../pages/game-page'
import GameOverPage from '../pages/game-over-page'

class GameView {
  constructor() {

  }

  showGameOverPage() {
    this.gameOverPage.show()
  }

  restartGame() {
    this.gamePages.restart()
  }

  initGameOverPage(callbacks) {
    this.gameOverPage = new GameOverPage(callbacks)
    this.gameOverPage.init()
  }

  initGamePage (callbacks) {
    this.gamePages = new GamePage(callbacks)
    this.gamePages.init()
  }

}

export default new GameView()