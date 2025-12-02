class Energy {
	constructor(scene, maxEnergy = 100) {
		this.scene = scene
		this.maxEnergy = maxEnergy
		this.currentEnergy = 100
		this.energyDecayRate = 5 // energy lost per second
		this.speedBoostPerEnergy = 0.01 // speed multiplier per energy point
		
		// Emit initial energy state
		this.emitEnergyUpdate()
	}

	addEnergy(amount) {
		this.currentEnergy = Math.min(this.maxEnergy, this.currentEnergy + amount)
		this.emitEnergyUpdate()
		this.emitEnergyBoost()
	}

	update(delta) {
		// Deplete energy over time
		if (this.currentEnergy > 0) {
			const decay = (this.energyDecayRate * delta) / 1000
			this.currentEnergy = Math.max(0, this.currentEnergy - decay)
			this.emitEnergyUpdate()
		}
	}

	emitEnergyUpdate() {
		// Emit event for HUD to listen to
		this.scene.game.events.emit('updateEnergy', this.currentEnergy, this.maxEnergy)
	}

	emitEnergyBoost() {
		// Emit event for energy boost animation
		this.scene.game.events.emit('energyBoost')
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