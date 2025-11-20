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

		this.load.spritesheet('cart', 'cart.png', {
			frameWidth: 32,
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

		// CART and PLAYER
		this.cart = new Cart(this, spawn.x, spawn.y)
		this.player = new Character(this, spawn.x, spawn.y, 'chara')
		
		// Attach player to cart
		this.cart.attachPlayer(this.player)

		// Cart collides with terrain and walls
		this.physics.add.collider(this.cart, terrainLayer)
		this.physics.add.collider(this.cart, wallLayer)

		// CAMERA
		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
		this.cameras.main.startFollow(this.cart, true, 0.25, 0.25)
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

		// Mass adjustment buttons
		this.createMassUI()
	}

	createMassUI() {
		const div = document.createElement('div')
		div.style.cssText = `
			position: fixed;
			bottom: 20px;
			left: 50%;
			transform: translateX(-50%);
			background: rgba(0, 0, 0, 0.7);
			padding: 10px;
			border-radius: 5px;
			color: white;
		`
		
		const btnStyle = 'padding: 8px 16px; margin: 5px; cursor: pointer;'
		div.innerHTML = `
			<button id="decMass" style="${btnStyle}">- Mass</button>
			<span id="massText">Mass: 2.0</span>
			<button id="incMass" style="${btnStyle}">+ Mass</button>
		`
		
		document.body.appendChild(div)
		
		document.getElementById('decMass').onclick = () => {
			this.cart.adjustMass(-0.1)
			document.getElementById('massText').innerText = `Mass: ${this.cart.getMass().toFixed(1)}`
		}
		
		document.getElementById('incMass').onclick = () => {
			this.cart.adjustMass(0.1)
			document.getElementById('massText').innerText = `Mass: ${this.cart.getMass().toFixed(1)}`
		}
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

		// Push the cart instead of moving player directly
		this.cart.push(dir)
		this.cart.update()
	}
}
