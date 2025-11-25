class Energy extends Phaser.GameObjects.Container {
	constructor(scene, maxEnergy = 100) {
		super(scene, 0, 0)
		
		scene.add.existing(this)
		
		this.maxEnergy = maxEnergy
		this.currentEnergy = 0
		this.energyDecayRate = 5 // energy lost per second
		this.speedBoostPerEnergy = 0.01 // speed multiplier per energy point
		
		this.createEnergyUI()
	}

	createEnergyUI() {
		const canvas = this.scene.game.canvas

		const energyDiv = document.createElement('div')
		energyDiv.id = 'energyUI'
		energyDiv.style.cssText = `
			margin: 8px auto 0;
			text-align: center;
			font-family: sans-serif;
			font-size: 18px;
			color: white;
		`
		
		const container = document.createElement('div')
		container.style.cssText = `
			width: ${canvas.width}px;
			margin: 0 auto;
			background: rgba(0, 0, 0, 0.7);
			padding: 6px 0;
			box-sizing: border-box;
		`
		
		container.innerHTML = `
			<div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
				<span>☕ Energy:</span>
				<div style="width: 200px; height: 20px; background: rgba(255,255,255,0.2); border-radius: 10px; overflow: hidden; position: relative;">
					<div id="energyBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #ffeb3b, #ff9800); transition: width 0.3s;"></div>
				</div>
				<span id="energyValue">0/100</span>
			</div>
		`

		energyDiv.appendChild(container)

		const scoreUI = document.getElementById('scoreUI')
		if (scoreUI) {
			scoreUI.parentNode.insertBefore(energyDiv, scoreUI.nextSibling)
		} else {
			canvas.parentNode.insertBefore(energyDiv, canvas.nextSibling)
		}
	}

	addEnergy(amount) {
		this.currentEnergy = Math.min(this.maxEnergy, this.currentEnergy + amount)
		this.updateUI()
		this.showStaminaPopup()
	}

	showStaminaPopup() {
		const cam = this.scene.cameras.main
		const centerX = cam.scrollX + cam.width / 2
		const centerY = cam.scrollY + cam.height / 2

		const popup = this.scene.add.text(centerX, centerY, 'Speed ⬆️', {
			fontSize: '18px',
			fontFamily: 'Arial, sans-serif',
			color: '#ffeb3b',
			stroke: '#000000',
			strokeThickness: 4,
			fontStyle: 'bold'
		})
		popup.setOrigin(0.5, 0.5)
		popup.setDepth(1000)

		this.scene.tweens.add({
			targets: popup,
			y: centerY - 100,
			alpha: 0,
			duration: 2000,
			ease: 'Power2',
			onComplete: () => {
				popup.destroy()
			}
		})
	}

	update(delta) {
		// deplete energy over time
		if (this.currentEnergy > 0) {
			const decay = (this.energyDecayRate * delta) / 1000
			this.currentEnergy = Math.max(0, this.currentEnergy - decay)
			this.updateUI()
		}
	}

	updateUI() {
		const energyBar = document.getElementById('energyBar')
		const energyValue = document.getElementById('energyValue')
		
		if (energyBar) {
			const percentage = (this.currentEnergy / this.maxEnergy) * 100
			energyBar.style.width = `${percentage}%`
		}
		
		if (energyValue) {
			energyValue.textContent = `${Math.floor(this.currentEnergy)}/${this.maxEnergy}`
		}
	}

	getSpeedMultiplier() {
		// 0 energy = 1x speed, 100 energy = 2x speed
		return 1 + (this.currentEnergy * this.speedBoostPerEnergy)
	}

	hasEnergy() {
		return this.currentEnergy > 0
	}

	getCurrentEnergy() {
		return this.currentEnergy
	}
}