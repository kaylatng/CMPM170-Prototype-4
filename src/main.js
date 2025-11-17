let config = {
  type: Phaser.AUTO,
  render: {
    pixelArt: true
  },
  width: 800,
  height: 640,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true
    },
  },
  zoom: 4,
  scene: [ Mall ],
}

const game = new Phaser.Game(config)

// globals
const centerX = game.config.width / 2
const centerY = game.config.height / 2

let cursors, keySKIP
