class Character extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture)

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)

    this.speed = 100
    this.acceleration = 800
    this.body.setMaxVelocity(this.speed, this.speed)
    this.body.setDrag(600, 600)

    this.facing = 'down'
    this.body.setSize(16, 24)
    this.body.setOffset(0, 0)

    this.createAnimations(scene)
    this.waypoint = null
    this.destination = null
  }

  createAnimations(scene) {
    if (scene.anims.exists('idle-down')) return;

    const idleFrames = {
      'down': 52,
      'down-left': 53,
      'left': 54,
      'up-left': 55,
      'up': 48,
      'up-right': 49,
      'right': 50,
      'down-right': 51
    }

    Object.entries(idleFrames).forEach(([dir, frame]) => {
      scene.anims.create({
        key: `idle-${dir}`,
        frames: scene.anims.generateFrameNumbers('chara', { frames: [frame] }),
        frameRate: 6,
        repeat: -1
      })
    })

    const runFrames = {
      'down': [44, 60],
      'down-left': [45, 61],
      'left': [46, 62],
      'up-left': [47, 63],
      'up': [40, 56],
      'up-right': [41, 57],
      'right': [42, 58],
      'down-right': [43, 59]
    }

    Object.entries(runFrames).forEach(([dir, frames]) => {
      scene.anims.create({
        key: `run-${dir}`,
        frames: scene.anims.generateFrameNumbers('chara', { frames }),
        frameRate: 8,
        repeat: -1
      })
    })
  }

  move(dir) {
    if (dir.lengthSq() > 1) dir.normalize()
    this.body.setAcceleration(dir.x * this.acceleration, dir.y * this.acceleration)

    if (dir.y < 0 && dir.x > 0) {
      this.facing = 'up-right'
    } else if (dir.y < 0 && dir.x < 0) {
      this.facing = 'up-left'
    } else if (dir.y > 0 && dir.x > 0) {
      this.facing = 'down-right'
    } else if (dir.y > 0 && dir.x < 0) {
      this.facing = 'down-left'
    } else if (dir.x > 0) {
      this.facing = 'right'
    } else if (dir.x < 0) {
      this.facing = 'left'
    } else if (dir.y < 0) {
      this.facing = 'up'
    } else if (dir.y > 0) {
      this.facing = 'down'
    }

    // console.log('Direction:', dir, 'Facing:', this.facing, 'Velocity:', this.body.velocity.length())

    if (dir.x === 0 && dir.y === 0) {
      this.play(`idle-${this.facing}`, true)
    } else {
      this.play(`run-${this.facing}`, true)
    }
  }

  update() {
    if (!this.destination && Math.random() < 1 / 60 / 3) {
      let item = Phaser.Utils.Array.GetRandom(this.scene.items.filter(i => i.body))
      if (item) this.destination = new Phaser.Math.Vector2(item.body)
    }
    if (!this.waypoint && this.destination) {
      let delta = this.destination.clone().subtract(this.body)
      if (delta.lengthSq() < 16 * 16) {
        this.destination = null
      } else if (Math.abs(delta.x) < 16) {
        this.waypoint = this.destination
      } else if ([256, 576, 896].some(y => Math.abs(this.body.y - y) < 48)) {
        this.waypoint = new Phaser.Math.Vector2(this.destination.x, this.body.y)
      } else {
        this.waypoint = new Phaser.Math.Vector2(this.body.x, [256, 576, 896].sort((a, b) => Math.abs(this.body.y - a) - Math.abs(this.body.y - b))[0])
      }
    }
    if (this.waypoint) {
      let delta = this.waypoint.clone().subtract(this.body)
      if (delta.lengthSq() < 16 * 16) {
        this.waypoint = null
      } else {
        this.move(delta)
      }
    } else {
      this.move(new Phaser.Math.Vector2())
    }
    this.body.velocity.scale(0.95);
  }
}
