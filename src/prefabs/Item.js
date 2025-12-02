class Item extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = 'monitor') {
    // Item type configurations
    const itemConfig = {
      monitor: {
        texture: 'item_monitor',
        weight: 0.3,
        score: 15,
        multiplier: 1.05
      },
      printer: {
        texture: 'item_printer',
        weight: 0.9,
        score: 20,
        multiplier: 1.07
      },
      desklight: {
        texture: 'item_desklight',
        weight: 0.3,
        score: 5,
        multiplier: 1.01
      }
    }

    // Get config for this type (default to monitor if invalid)
    const config = itemConfig[type] || itemConfig.monitor

    // Create sprite with appropriate texture
    super(scene, x, y, config.texture)

    scene.add.existing(this)
    scene.physics.add.existing(this, true) // true = static body

    this.setOrigin(0.5, 0.5)
    
    // Fine-tuned collision boxes to perfectly align with visible sprites
    switch(type) {
      case 'monitor':
        this.body.setSize(16, 16) // Monitor screen
        this.body.setOffset(0, 0)
        break
      case 'printer':
        this.body.setSize(16, 16) // Printer body
        this.body.setOffset(0, 0)
        break
      case 'desklight':
        this.body.setSize(16, 16) // Lamp
        this.body.setOffset(0, 0) // Adjusted down slightly
        break
      default:
        this.body.setSize(16, 16)
        this.body.setOffset(0, 0)
    }

    // Store item properties
    this.itemType = type
    this.weight = config.weight
    this.score = config.score
    this.multiplier = config.multiplier

    // Set data (for compatibility with existing code)
    this.setData('type', type)
    this.setData('weight', config.weight)
    this.setData('score', config.score)
    this.setData('multiplier', config.multiplier)
  }

  // Get item properties
  getWeight() {
    return this.weight
  }

  getScore() {
    return this.score
  }

  getMultiplier() {
    return this.multiplier
  }

  getType() {
    return this.itemType
  }

  // Static method to get random item type
  static getRandomType() {
    const types = ['monitor', 'printer', 'desklight']
    return Phaser.Utils.Array.GetRandom(types)
  }
}

