class Mall extends Phaser.Scene {
	constructor() {
		super('mallScene')
	}

	init() {
		this.VEL = 100
	}

	preload() {
		this.load.path = './assets/'

		this.load.spritesheet('chara', 'chara.png', {
			frameWidth: 16,
			frameHeight: 32
		})

		this.load.image('tilesetImageInterior', 'interior.png')
		this.load.image('tilesetImageRoom', 'room.png')
		this.load.tilemapTiledJSON('tilemapJSON', 'mall.json')
	}

	create() {
		// TILEMAP
		const map = this.add.tilemap('tilemapJSON')
		const tileset = map.addTilesetImage('interior', 'tilesetImageInterior')
		const tilesetRoom = map.addTilesetImage('room', 'tilesetImageRoom')

		map.createLayer('Outside', tileset, 0, 0)
		const floorLayer = map.createLayer('Floor', tileset, 0, 0)
		const floorLayer2 = map.createLayer('Floor Decor', tileset, 0, 0)
		const wallLayer = map.createLayer('Walls', tilesetRoom, 0, 0)
		const wallLayer2 = map.createLayer('Wall Decor', tileset, 0, 0)
		const terrainLayer = map.createLayer('Terrain', tileset, 0, 0)
		const terrainLayer2 = map.createLayer('Terrain2', tileset, 0, 0)

		terrainLayer.setCollisionByProperty({ collides: true })
		wallLayer.setCollisionByProperty({ collides: true })

		const spawn = map.findObject('Spawns', obj => obj.name === 'slimeSpawn')

		// PLAYER
		this.player = new Character(this, spawn.x, spawn.y, 'character')

		this.physics.add.collider(this.player, terrainLayer)
		this.physics.add.collider(this.player, wallLayer)

		// CAMERA
		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
		this.cameras.main.startFollow(this.player, true, 0.25, 0.25)
		this.cameras.main.setZoom(2)

		this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

		// INPUT
		this.cursors = this.input.keyboard.createCursorKeys()
		this.wasd = this.input.keyboard.addKeys({
			up: Phaser.Input.Keyboard.KeyCodes.W,
			down: Phaser.Input.Keyboard.KeyCodes.S,
			left: Phaser.Input.Keyboard.KeyCodes.A,
			right: Phaser.Input.Keyboard.KeyCodes.D
		})
	}

	update() {
		const dir = new Phaser.Math.Vector2(0)

		if (this.cursors.left.isDown || this.wasd.left.isDown) {
    	dir.x = -1
		} else if (this.cursors.right.isDown || this.wasd.right.isDown) {
			dir.x = 1
		}

		if (this.cursors.up.isDown || this.wasd.up.isDown) {
    	dir.y = -1
		} else if (this.cursors.down.isDown || this.wasd.down.isDown) {
    	dir.y = 1
		}

		dir.normalize()

		this.player.move(dir)
	}
}
