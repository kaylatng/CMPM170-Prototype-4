class Mall extends Phaser.Scene {
    constructor() {
        super('mallScene')
    }

    init() {
        this.VEL = 100  // slime velocity constant
    }

    preload() {
        this.load.path = './assets/'
        this.load.spritesheet('slime', 'slime.png', {
            frameWidth: 16,
            frameHeight: 16
        })

        this.load.image('tilesetImageInterior', 'interior.png')
        this.load.image('tilesetImageRoom', 'room.png')
        this.load.tilemapTiledJSON('tilemapJSON', 'mall.json')
    }

    create() {
        // tilemap stuff
        const map = this.add.tilemap('tilemapJSON')
        const tileset = map.addTilesetImage('interior', 'tilesetImageInterior')
        const tilesetRoom = map.addTilesetImage('room', 'tilesetImageRoom')
        const outsideLayer = map.createLayer('Outside', tileset, 0, 0)
        const floorLayer = map.createLayer('Floor', tileset, 0, 0)
        const floorLayer2 = map.createLayer('Floor Decor', tileset, 0, 0)
        const wallLayer = map.createLayer('Walls', tilesetRoom, 0, 0)
        const wallLayer2 = map.createLayer('Wall Decor', tileset, 0, 0)
        const terrainLayer = map.createLayer('Terrain', tileset, 0, 0)
        const terrainLayer2 = map.createLayer('Terrain2', tileset, 0, 0)

        terrainLayer.setCollisionByProperty({ collides: true })
        wallLayer.setCollisionByProperty({ collides: true })

        const slimeSpawn = map.findObject('Spawns', (obj) => obj.name === 'slimeSpawn')
        console.log(slimeSpawn)

        // add slime
        this.slime = this.physics.add.sprite(slimeSpawn.x, slimeSpawn.y, 'slime', 0)
        this.slime.body.setCollideWorldBounds(true)

        // slime animation
        this.anims.create({
          key: 'jiggle',
          frameRate: 8,
          repeat: -1,
          frames: this.anims.generateFrameNumbers('slime', {
            start: 0,
            end: 1,
          })
        })
        this.slime.play('jiggle')

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.cameras.main.startFollow(this.slime, true, 0.25, 0.25)
        this.cameras.main.setZoom(2)

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

        this.physics.add.collider(this.slime, terrainLayer)
        this.physics.add.collider(this.slime, wallLayer)

        // input
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    update() {
        // slime movement
        this.direction = new Phaser.Math.Vector2(0)
        if(this.cursors.left.isDown) {
            this.direction.x = -1
        } else if(this.cursors.right.isDown) {
            this.direction.x = 1
        }

        if(this.cursors.up.isDown) {
            this.direction.y = -1
        } else if(this.cursors.down.isDown) {
            this.direction.y = 1
        }

        this.direction.normalize()
        this.slime.setVelocity(this.VEL * this.direction.x, this.VEL * this.direction.y)
    }
}
