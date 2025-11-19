class Character extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture)

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)

    this.speed = 200
    this.acceleration = 600
    this.body.setMaxVelocity(this.speed, this.speed);
    this.body.setDrag(600, 600);

    this.facing = 'down'
    this.body.setSize(16, 24)
    this.body.setOffset(0, 7)

    this.createAnimations(scene)
  }

  createAnimations(scene) {
    if (scene.anims.exists('idle-down')) return;

    // IDLE anims
    scene.anims.create({
      key: 'idle-down',
      frames: scene.anims.generateFrameNumbers('chara', { start: 43, end: 47 }),
      frameRate: 6,
      repeat: -1
    })

    scene.anims.create({
      key: 'idle-left',
      frames: scene.anims.generateFrameNumbers('chara', { start: 36, end: 41 }),
      frameRate: 6,
      repeat: -1
    })

    scene.anims.create({
      key: 'idle-right',
      frames: scene.anims.generateFrameNumbers('chara', { start: 24, end: 29 }),
      frameRate: 6,
      repeat: -1
    })

    scene.anims.create({
      key: 'idle-up',
      frames: scene.anims.generateFrameNumbers('chara', { start: 30, end: 35 }),
      frameRate: 6,
      repeat: -1
    })

    // RUN anims
    scene.anims.create({
      key: 'run-down',
      frames: scene.anims.generateFrameNumbers('chara', { start: 66, end: 71 }),
      frameRate: 10,
      repeat: -1
    })

    scene.anims.create({
      key: 'run-left',
      frames: scene.anims.generateFrameNumbers('chara', { start: 60, end: 65 }),
      frameRate: 10,
      repeat: -1
    })

    scene.anims.create({
      key: 'run-right',
      frames: scene.anims.generateFrameNumbers('chara', { start: 48, end: 53 }),
      frameRate: 10,
      repeat: -1
    })

    scene.anims.create({
      key: 'run-up',
      frames: scene.anims.generateFrameNumbers('chara', { start: 54, end: 59 }),
      frameRate: 10,
      repeat: -1
    })
  }

  move(dir) {
    this.body.setAcceleration(dir.x * this.acceleration, dir.y * this.acceleration)

    if (dir.x > 0) this.facing = 'right'
    else if (dir.x < 0) this.facing = 'left'
    else if (dir.y < 0) this.facing = 'up'
    else if (dir.y > 0) this.facing = 'down'

    if (this.body.velocity.length() < 10) {
        this.play(`idle-${this.facing}`, true)
    } else {
        this.play(`run-${this.facing}`, true)
    }
  }
}
