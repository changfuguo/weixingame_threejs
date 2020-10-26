import audioConf from '../../confs/audio-conf'
import gameView from '../game/view'
// 控制音视频的播放
class AudioManager {
  constructor () {
    this.init()
  }

  init () {
    for (let key in audioConf.audioSources) {
      // 新建实例管理音频
      this[key] = wx.createInnerAudioContext()
      this[key].src = audioConf.audioSources[key]
    }
    this.shrink_end.loop = true
    this.shrink.onEnded(() => {
      if (gameView.gamePage.bottle.status == 'shrink') {
        this.shrink_end.play()
      }
    })
  }
}

export default new AudioManager()