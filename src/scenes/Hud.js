class HUD extends Phaser.Scene {
	constructor() {
		super({ key: 'hudScene', active: false })
	}

	create() {
		this.mallScene = this.scene.get('mallScene')
		
		const cam = this.cameras.main
		const width = cam.width
		const height = cam.height
		
		const barWidth = 200
		const barHeight = 20
		const barX = width / 2
		const barY = 50
		
		const hasImages = this.textures.exists('energyBarBorder') && this.textures.exists('energyBar')
		
		if (hasImages) {
			this.energyBarFill = this.add.image(barX - barWidth / 2, barY, 'energyBar')
			this.energyBarFill.setOrigin(0, 0.5)
			this.energyBarFill.setDisplaySize(barWidth, barHeight)
			this.energyBarFill.setDepth(1001)
			
			this.energyBarBorder = this.add.image(barX, barY, 'energyBarBorder')
			this.energyBarBorder.setOrigin(0.5, 0.5)
			this.energyBarBorder.setDisplaySize(barWidth, barHeight)
			this.energyBarBorder.setDepth(1002)
			
			this.useImages = true
		} else {
			this.energyBarBg = this.add.graphics()
			this.energyBarBg.fillStyle(0x3d2817, 1)
			this.energyBarBg.fillRoundedRect(barX - barWidth / 2, barY - barHeight / 2, barWidth, barHeight, 5)
			this.energyBarBg.lineStyle(2, 0x8b6f47, 1)
			this.energyBarBg.strokeRoundedRect(barX - barWidth / 2, barY - barHeight / 2, barWidth, barHeight, 5)
			this.energyBarBg.setDepth(1000)
			
			this.energyBarFill = this.add.graphics()
			this.energyBarFill.setDepth(1001)
			
			this.useImages = false
		}
		
		this.barX = barX
		this.barY = barY
		this.barWidth = barWidth
		this.barHeight = barHeight
		
		this.energyIcon = this.add.text(barX - barWidth / 2 - 15, barY, '⚡', {
			fontSize: '24px',
			fontFamily: 'Arial, sans-serif',
			color: '#ffffff',
			stroke: '#000000',
			strokeThickness: 2
		})
		this.energyIcon.setOrigin(0.5, 0.5)
		this.energyIcon.setDepth(1003)
		
		this.energyText = this.add.text(barX, barY, '0/100', {
			fontSize: '16px',
			fontFamily: 'Arial, sans-serif',
			color: '#ffffff',
			stroke: '#000000',
			strokeThickness: 4,
			fontStyle: 'bold'
		})
		this.energyText.setOrigin(0.5, 0.5)
		this.energyText.setDepth(1003)

    this.scoreText = this.add.text(barX, barY + 30, 'Score: 0', {
			fontSize: '20px',
			fontFamily: 'Arial, sans-serif',
			color: '#ffffff',
			stroke: '#000000',
			strokeThickness: 4,
			fontStyle: 'bold'
		})
		this.scoreText.setOrigin(0.5, 0.5)
		this.scoreText.setDepth(1003)

		this.items = 0
    this.itemsText = this.add.text(barX, barY + 60, 'Items Collected: 0', {
			fontSize: '18px',
			fontFamily: 'Arial, sans-serif',
			color: '#ffffff',
			stroke: '#000000',
			strokeThickness: 4,
			fontStyle: 'bold'
		})
		this.itemsText.setOrigin(0.5, 0.5)
		this.itemsText.setDepth(1003)
		
		this.game.events.on('updateEnergy', this.updateEnergyBar, this)
		this.game.events.on('energyBoost', this.showEnergyBoost, this)
    this.game.events.on('updateScore', this.updateScore, this)
    this.game.events.on('massIncrease', this.showMassIncrease, this)
    this.game.events.on('updateItemCount', this.updateItemCount, this)
    this.game.events.on('npcHit', this.showNpcHit, this)
    this.game.events.on('gameEnd', this.gameEndScreen, this)
	
    if (this.mallScene) {
      // if (this.mallScene.score !== undefined) {
      //   this.updateScore(this.mallScene.score)
      // }
      if (this.mallScene.items) {
        // this.updateItemCount(this.items)
      }
      if (this.mallScene.energySystem) {
        this.updateEnergyBar(
          this.mallScene.energySystem.getCurrentEnergy(), 
          this.mallScene.energySystem.maxEnergy
        )
      }
    }

		this.endGroup = this.add.group();
		this.endbg = this.add.rectangle(400, 300, 800, 800, 0x000000)
    this.endbg.alpha = 1

		const endText = this.add.text(centerX, centerY - 20, 'GAME OVER\nYou have run out of energy :(', {
			fontSize: '28px',
			fontFamily: 'Arial, sans-serif',
			color: '#ff3333',
			stroke: '#ffffffff',
			strokeThickness: 5,
			fontStyle: 'bold',
			align: "center"
		})

		const endTextSub = this.add.text(centerX, centerY + 60, 'Press Space to play again', {
			fontSize: '40px',
			fontFamily: 'Arial, sans-serif',
			color: '#ff3333',
			stroke: '#ffffffff',
			strokeThickness: 5,
			fontStyle: 'bold',
			align: "center"
		})
		this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 2000,
      yoyo: true,
      onUpdate: (tween) => {
          const v = tween.getValue();
          endTextSub.setFontSize(40 + v * 5);
      },
      repeat: -1,
    });

		endTextSub.setOrigin(0.5, 0.5)
		endText.setOrigin(0.5, 0.5)
		this.endGroup.add(endText)
		this.endGroup.add(endTextSub)
		this.endGroup.add(this.endbg)
    this.endGroup.setVisible(false)
  }

	updateEnergyBar(currentEnergy, maxEnergy) {
		const percentage = currentEnergy / maxEnergy
		
		this.energyText.setText(`${Math.floor(currentEnergy)}/${maxEnergy}`)
		
		if (this.useImages && this.energyBarFill) {
			const fillWidth = this.barWidth * percentage
			const cropWidth = this.energyBarFill.texture.getSourceImage().width * percentage
			
			this.energyBarFill.setCrop(0, 0, cropWidth, this.energyBarFill.texture.getSourceImage().height)
			this.energyBarFill.setDisplaySize(fillWidth, this.barHeight)
		} else if (this.energyBarFill) {
			this.energyBarFill.clear()
			
			if (percentage > 0) {
				const fillWidth = this.barWidth * percentage
				
				this.energyBarFill.fillStyle(0xffeb3b, 1)
				this.energyBarFill.fillRoundedRect(
					this.barX - this.barWidth / 2,
					this.barY - this.barHeight / 2,
					fillWidth,
					this.barHeight,
					5
				)
			}
		}
		
		if (percentage < 0.2 && percentage > 0) {
			this.tweens.add({
				targets: this.energyIcon,
				scale: 1.2,
				duration: 300,
				yoyo: true,
				ease: 'Sine.easeInOut'
			})
		}
	}

	showEnergyBoost() {
		const centerX = this.cameras.main.width / 2
		const centerY = this.cameras.main.height / 2
		
		const popup = this.add.text(centerX, centerY, 'Speed ⬆️', {
			fontSize: '24px',
			fontFamily: 'Arial, sans-serif',
			color: '#ffeb3b',
			stroke: '#000000',
			strokeThickness: 4,
			fontStyle: 'bold'
		})
		popup.setOrigin(0.5, 0.5)
		popup.setDepth(2000)
		
		this.tweens.add({
			targets: popup,
			y: centerY - 100,
			alpha: 0,
			scale: 1.5,
			duration: 2000,
			ease: 'Power2',
			onComplete: () => {
				popup.destroy()
			}
		})
	}

  updateScore(score) {
		this.scoreText.setText(`Score: ${score}`)
		
		// Add a little bounce animation when score changes
		this.tweens.add({
			targets: this.scoreText,
			scale: 1.2,
			duration: 150,
			yoyo: true,
			ease: 'Back.easeOut'
		})
	}

  showMassIncrease() {
		const centerX = this.cameras.main.width / 2
		const centerY = this.cameras.main.height / 2

		const popup = this.add.text(centerX, centerY, 'Cart Load ⬆️', {
			fontSize: '24px',
			fontFamily: 'Arial, sans-serif',
			color: '#ff6b6b',
			stroke: '#000000',
			strokeThickness: 4,
			fontStyle: 'bold'
		})
		popup.setOrigin(0.5, 0.5)
		popup.setDepth(2000)
		
		this.tweens.add({
			targets: popup,
			y: centerY - 100,
			alpha: 0,
			scale: 1.5,
			duration: 2000,
			ease: 'Power2',
			onComplete: () => {
				popup.destroy()
			}
		})
	}

  updateItemCount() {
		this.items = this.items + 1
    this.itemsText.setText(`Items Collected: ${this.items}`)
	}

	loseItem(){
		if (this.items >= 1) {
			this.items = this.items - 1
    	this.itemsText.setText(`Items Collected: ${this.items}`)
		}
	}

	showNpcHit() {
		const centerX = this.cameras.main.width / 2
		const centerY = this.cameras.main.height / 2
		
		const popup = this.add.text(centerX, centerY, '💥 Hit!', {
			fontSize: '28px',
			fontFamily: 'Arial, sans-serif',
			color: '#ff3333',
			stroke: '#000000',
			strokeThickness: 5,
			fontStyle: 'bold'
		})
		popup.setOrigin(0.5, 0.5)
		popup.setDepth(2000)
		
		this.tweens.add({
			targets: popup,
			y: centerY - 80,
			alpha: 0,
			scale: 1.8,
			duration: 1500,
			ease: 'Power2',
			onComplete: () => {
				popup.destroy()
			}
		})
		this.loseItem()
	}

	gameEndScreen(){
    this.endGroup.setVisible(true)
	}

	shutdown() {
		this.game.events.off('updateEnergy', this.updateEnergyBar, this)
		this.game.events.off('energyBoost', this.showEnergyBoost, this)
    this.game.events.off('updateScore', this.updateScore, this)
    this.game.events.on('massIncrease', this.showMassIncrease, this)
    this.game.events.off('updateItemCount', this.updateItemCount, this)
    this.game.events.off('npcHit', this.showNpcHit, this)
    this.game.events.off('gameEnd', this.gameEndScreen, this)
	}
}