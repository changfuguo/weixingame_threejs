import GamePage from '../pages/game-page'
import GameOverPage from '../pages/game-over-page'

class GameView {
  constructor() {

  }
  showGamePage() {
    this.gameOverPage.hide()
    this.gamePage.restart()
    this.gamePage.show()
  }

  showGameOverPage() {
    // this.gamePage.hide()
    this.gameOverPage.show()
  }

  restartGame() {
    this.gamePage.restart()
  }

  initGameOverPage(callbacks) {
    this.gameOverPage = new GameOverPage(callbacks)
    this.gameOverPage.init({
      camera: this.gamePage.scene.camera.instance
    })
  }

  initGamePage (callbacks) {
    this.gamePage = new GamePage(callbacks)
    this.gamePage.init()
  }

}

export default new GameView()