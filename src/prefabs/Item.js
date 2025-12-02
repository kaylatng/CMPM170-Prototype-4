class Item extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = 'monitor') {
    const itemConfig = {
      monitor: {
        texture: 'item_monitor',
        weight: 0.15,
        score: 15,
        multiplier: 1.05
      },
      printer: {
        texture: 'item_printer',
        weight: 0.45,
        score: 20,
        multiplier: 1.07
      },
      desklight: {
        texture: 'item_desklight',
        weight: 0.15,
        score: 5,
        multiplier: 1.01
      }
    }

    const config = itemConfig[type] || itemConfig.monitor

    super(scene, x, y, config.texture)

    scene.add.existing(this)
    scene.physics.add.existing(this, true) // static body

    this.setOrigin(0.5, 0.5)

    switch(type) {
      case 'monitor':
        this.body.setSize(16, 16)
        this.body.setOffset(0, 0)
        break
      case 'printer':
        this.body.setSize(16, 16)
        this.body.setOffset(0, 0)
        break
      case 'desklight':
        this.body.setSize(16, 16)
        this.body.setOffset(0, 0)
        break
      default:
        this.body.setSize(16, 16)
        this.body.setOffset(0, 0)
    }

    this.itemType = type
    this.weight = config.weight
    this.score = config.score
    this.multiplier = config.multiplier
    this.collected = false // prevent double pickup

    // for respawn
    this.respawnTime = 3000 // 3 seconds
    this.startX = x
    this.startY = y

    this.setData('type', type)
    this.setData('weight', config.weight)
    this.setData('score', config.score)
    this.setData('multiplier', config.multiplier)
  }

  getWeight() { return this.weight }
  getScore() { return this.score }
  getMultiplier() { return this.multiplier }
  getType() { return this.itemType }

  collect() {
    if (this.collected) return false // already collected
    this.collected = true
    
    // hide + disable physics
    this.setVisible(false)
    this.disableBody(true, true)

    // respawn after 3 sec
    this.scene.time.delayedCall(this.respawnTime, () => {
      this.respawn()
    })
    return true
  }

  respawn() {
    // re-enable at original position
    this.collected = false
    this.enableBody(true, this.startX, this.startY, true, true)
    this.setVisible(true)
  }

  static getRandomType() {
    const types = ['monitor', 'printer', 'desklight']
    return Phaser.Utils.Array.GetRandom(types)
  }
}



