
class Mall extends Phaser.Scene {
	constructor() {
		super('mallScene')

	}
	init() {
		this.VEL = 100
		this.coffeeActive = false
		this.coffeeTimer = 0
		this.coffeeMassBonus = 0
		this.energySystem = null
	}

	preload() {
		this.load.path = './assets/'

		this.load.spritesheet('chara', 'chara.png', {
			frameWidth: 16,
			frameHeight: 24
		})

		this.load.spritesheet('cart', 'cart.png', {
			frameWidth: 32,
			frameHeight: 32
		})
		this.load.image('image_npc', 'image_npc.png')
		this.load.image('image_coffee', 'coffee.png')
		this.load.image('item_monitor', 'monitor.png')
		this.load.image('item_printer', 'printer.png')
		this.load.image('item_desklight', 'desklight.png')

		this.load.image('energyBarBorder', 'valuebar.png')
		this.load.image('energyBar', 'valuefull.png')

    this.load.audio('bgm', 'audio/bgm.mp3')
    this.load.audio('pickup', 'audio/pickup.wav')
    this.load.audio('powerup', 'audio/coffee.wav')
    this.load.audio('hit', 'audio/hit.wav')

		this.load.image('tilesetImage', 'MarketSet_Tileset.png')
		this.load.tilemapTiledJSON('tilemapJSON', 'grocerystore.json')
	}

	create() {
		this.bgm = this.sound.add('bgm', {
      volume: 0.1,
      loop: true,
    });
		this.bgm.setRate(1)
		// COMMENT THIS TO MUTE MUSIC
    this.bgm.play()

		this.pickup = this.sound.add('pickup', {
      volume: 0.2,
      loop: false,
    });

		this.hit = this.sound.add('hit', {
      volume: 0.2,
      loop: false,
    });

		this.powerup = this.sound.add('powerup', {
      volume: 0.2,
      loop: false,
    });

		// TILEMAP
		const map = this.add.tilemap('tilemapJSON')
		const tileset = map.addTilesetImage('MarketSet_Tileset', 'tilesetImage')

		const floorLayer = map.createLayer('Floor', tileset, 0, 0)
		const wallLayer = map.createLayer('Walls', tileset, 0, 0)
		const terrainLayer = map.createLayer('Terrain', tileset, 0, 0)

		terrainLayer.setCollisionByProperty({ collides: true })
		wallLayer.setCollisionByProperty({ collides: true })

		const spawn = map.findObject('Spawns', obj => obj.name === 'slimeSpawn')

		this.items = []
		this.createItemsFromMap(map)
		this.coffees = this.physics.add.staticGroup()
		this.createCoffeeFromMap(map)

		this.energySystem = new Energy(this, 100)
		this.scene.launch('hudScene')

		const npcSpawns = map.filterObjects('Spawns', obj => obj.name === 'npcSpawn')
		this.npcs = this.physics.add.group({ runChildUpdate: true, defaults: {} })
		npcSpawns.forEach(spawnPoint => {
			const x = spawnPoint.x
			const y = spawnPoint.y
			const npc = new Character(this, x, y, 'chara', 'enemy')
			this.npcs.add(npc)
		})

		// CART and PLAYER
		this.cart = new Cart(this, spawn.x, spawn.y)
		this.player = new Character(this, spawn.x, spawn.y, 'chara')

		// record mass for coffee
		this.baseCartMass = this.cart.getMass()

		// Attach player to cart
		this.cart.attachPlayer(this.player)

		// Cart collides with terrain and walls
		this.physics.add.collider(this.cart, terrainLayer)
		this.physics.add.collider(this.cart, wallLayer)

		// Cart detect with the item
		this.items.forEach(item => {
			this.physics.add.overlap(this.cart, item, this.handleItemPickup, null, this)
		  this.physics.add.collider(this.npcs, item, this.handleNpcItemPickup, null, this)
		})

		// Player gets hit by npcs (not cart)
		this.physics.add.collider(this.player, this.npcs, this.handleNpcHit, null, this)
		// Cart collides with NPCs but doesn't trigger item loss
		this.physics.add.collider(this.cart, this.npcs)
		this.physics.add.collider(this.npcs, terrainLayer)
		this.physics.add.collider(this.npcs, wallLayer)

		// Coffee collider
		this.physics.add.overlap(this.cart, this.coffees, this.handleCoffeePickup, null, this)

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
		this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
		this.spaceKey.on('down', () => {
			this.scene.start('mallScene');
			this.bgm.stop()
		});

		// Mass adjustment buttons
		// this.createMassUI()
		// Score UI
		this.score = 0
		this.gameEnd = false
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
			<span id="massText">Mass: ${this.cart.getMass().toFixed(1)}</span>
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
	// createScoreUI() {
	// 	const canvas = this.game.canvas

	// 	const scoreDiv = document.createElement('div')
	// 	scoreDiv.id = 'scoreUI'
	// 	scoreDiv.style.cssText = `
	// 		margin: 8px auto 0;
	// 		text-align: center;
	// 		font-family: sans-serif;
	// 		font-size: 18px;
	// 		color: white;
	// 	`
	// 	const container = document.createElement('div')
	// 	container.style.cssText = `
	// 		width: ${canvas.width}px;
	// 		margin: 0 auto;
	// 		background: rgba(0, 0, 0, 0.7);
	// 		padding: 6px 0;
	// 		box-sizing: border-box;
	// 	`
	// 	container.innerHTML = `Score: <span id="scoreValue">0</span>`

	// 	scoreDiv.appendChild(container)

	// 	canvas.parentNode.insertBefore(scoreDiv, canvas.nextSibling)
	// }
	createItemsFromMap(map) {
		const itemObjects = map.getObjectLayer('Items')?.objects || []

		itemObjects.forEach(obj => {
			// Random item type
			const type = Item.getRandomType()

			// Center the item
			const x = obj.x + (obj.width || 0) / 2
			const y = obj.y - (obj.height || 0) / 2

			// Create Item prefab
			const item = new Item(this, x, y, type)
			this.items.push(item)
		})
		this.game.events.emit('updateItemCount', this.items.length)
	}
	createCoffeeFromMap(map) {
		const coffeeObjects = map.getObjectLayer('Coffee')?.objects || []

		coffeeObjects.forEach(obj => {
			const x = obj.x + (obj.width || 0) / 2
			const y = obj.y - (obj.height || 0) / 2

			const coffee = this.coffees.create(x, y, 'image_coffee')

			// coffee mass reduce value
			coffee.setData('massBoost', 0.5)
		})
	}

	handleItemPickup(cart, item) {
		// Use Item prefab methods instead of getData
		const weight = item.getWeight()
		const score = item.getScore()
		const multiplier = item.getMultiplier()
		const type = item.getType()

		// Track cart inventory
		if (!this.cart.inventory) this.cart.inventory = []
		this.cart.inventory.push({
			type,
			score,
			multiplier,
			weight
		})

		// Total multiplier from all items in cart
		const totalMultiplier = this.cart.inventory.reduce(
			(acc, it) => acc * it.multiplier, 1
		)

		// Add score
		this.score += Math.floor(score * totalMultiplier)

		// this.updateScoreUI() if you re-enable it later
		this.game.events.emit('updateScore', this.score)
		this.game.events.emit('massIncrease')
		this.game.events.emit('updateItemCount')

		// Adjust cart mass
		cart.adjustMass(weight)

		// update mass UI
		const massText = document.getElementById('massText')
		if (massText) {
			massText.innerText = `Mass: ${this.cart.getMass().toFixed(1)}`
		}

		this.pickup.play()
		item.collect()
	}
	handleNpcItemPickup(item, _npc) {
		item.collect()
	}

	handleNpcHit(player, npc) {
		// if no items
		if (!this.cart.inventory || this.cart.inventory.length === 0) {
			return
		}

		// Emit hit event for popup
		this.game.events.emit('npcHit')

		// find the highest-score item
		let maxIndex = 0
		let maxScore = this.cart.inventory[0].score

		for (let i = 1; i < this.cart.inventory.length; i++) {
			if (this.cart.inventory[i].score > maxScore) {
				maxScore = this.cart.inventory[i].score
				maxIndex = i
			}
		}

		// Remove
		const [lostItem] = this.cart.inventory.splice(maxIndex, 1)
		this.dropItemOnGround(lostItem, this.player.x, this.player.y)
		// lost that items score
		this.score = Math.max(0, this.score - lostItem.score)

		// adjust cart mass
		this.cart.adjustMass(-lostItem.weight)

		// lose the multiplie
		this.cart.inventory.forEach(it => {
			it.multiplier = 1
		})
		this.game.events.emit('updateScore', this.score)

		const massText = document.getElementById('massText')
		if (massText) {
			massText.innerText = `Mass: ${this.cart.getMass().toFixed(1)}`
		}
	}
	dropItemOnGround(itemData, x, y) {
		const dropped = new Item(this, x, y, itemData.type)
		dropped.setVisible(true)
    dropped.enableBody(true, x, y, true, true)
		this.items.push(dropped)

		this.tweens.add({
			targets: dropped,
			alpha: 0,
			scale: 0.8,
			duration: 900,
			onComplete: () => {
				dropped.destroy()
			}
    })
		this.hit.play()
	}
	handleCoffeePickup(cart, coffee) {
		this.powerup.play()
		const massBoost = coffee.getData('massBoost') || 0.5

		const energyBoost = 50
		this.energySystem.addEnergy(energyBoost)

		// timer reset when already have coffee
		if (this.coffeeActive) {
			this.coffeeTimer = 10
			coffee.destroy()
			return
		}

		this.coffeeActive = true
		this.coffeeTimer = 10

		const currentMass = cart.getMass()

		// maximum value for reduce mass
		const maxReduce = Math.max(0, currentMass - this.baseCartMass)

		// reduce mass
		const actualBoost = Math.min(massBoost, maxReduce)

		// remember mass
		this.coffeeMassBonus = actualBoost

		// apply reduction
		cart.adjustMass(-actualBoost)

		// update mass UI
		const massText = document.getElementById('massText')
		if (massText) {
			massText.innerText = `Mass: ${this.cart.getMass().toFixed(1)}`
		}
		coffee.destroy()
	}
	update() {
		if (this.energySystem.currentEnergy == 0) {
			this.gameEnd = true
			this.bgm.stop()
			this.game.events.emit('gameEnd')
		}
		if (!this.gameEnd) {
			if(this.energySystem.currentEnergy <= 60) {
				this.bgm.setRate(1.2)
			}
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

			// NPC follow
			/*if (this.npcs) {
				this.npcs.children.iterate(npc => {
					if (!npc) return
					const speed = 60
					this.physics.moveToObject(npc, this.cart, speed)
				})
			}*/

			if (this.energySystem) {
				this.energySystem.update(this.game.loop.delta)
			}

			// Coffee buff countdown
			if (this.coffeeActive) {
				this.coffeeTimer -= this.game.loop.delta / 1000  // ms → seconds

				if (this.coffeeTimer <= 0) {
					this.coffeeActive = false
					this.coffeeTimer = 0

					// restore the mass we removed
					if (this.coffeeMassBonus > 0) {
						this.cart.adjustMass(this.coffeeMassBonus)
						this.coffeeMassBonus = 0
					}

					// update UI
					const massText = document.getElementById('massText')
					if (massText) {
						massText.innerText = `Mass: ${this.cart.getMass().toFixed(1)}`
					}
				}
			}

			const speedMultiplier = this.energySystem ? this.energySystem.getSpeedMultiplier() : 1

			// Push the cart instead of moving player directly
			this.cart.push(dir, speedMultiplier)
			this.cart.update()
		}
	}
}
