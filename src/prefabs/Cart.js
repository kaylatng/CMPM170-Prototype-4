class Cart extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'cart', 0)

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)
    
    this.cartMass = 2
    this.baseMass = 1
    
    this.updatePhysicsProperties()
    
    this.setOrigin(0.5, 0.5)
    this.setScale(1)
    this.setRotation(-Math.PI / 2) // Start facing down
    
    this.player = null
    this.previousVelocity = new Phaser.Math.Vector2(0, 0)
    this.targetRotation = -Math.PI / 2 // Start facing down
    this.currentFacing = 'down' // Track which direction cart is facing
  }

  updatePhysicsProperties() {
    // Physics scale with mass
    const totalMass = this.baseMass + this.cartMass
    
    // Heavier cart = slower max speed
    this.maxSpeed = 200 - (this.cartMass * 30)
    
    // Heavier cart = slower acceleration  
    this.acceleration = 600 - (this.cartMass * 100)
    
    // Heavier cart = more momentum
    this.dragAmount = 600 - (this.cartMass * 150)
    

    this.body.setMaxVelocity(this.maxSpeed, this.maxSpeed)
    this.body.setDrag(this.dragAmount, this.dragAmount)
  }

  setMass(mass) {
    this.cartMass = Math.max(0, mass)
    this.updatePhysicsProperties()
  }

  adjustMass(delta) {
    this.cartMass = Math.max(0, this.cartMass + delta)
    this.updatePhysicsProperties()
  }

  attachPlayer(player) {
    this.player = player
    this.updatePlayerPosition()
  }

  updatePlayerPosition() {
    if (!this.player) return
    
    // Position player behind the cart based on cart's rotation
    // Player should always be behind the cart relative to its facing direction
    //right now dont have top/bottom facing cart sprites yet, so going top/bottom looks weird
    const distance = 12
    
    // Calculate offset based on cart's current facing direction
    let offsetX = 0
    let offsetY = 0
    
    switch(this.currentFacing) {
      case 'down':
        offsetY = distance
        break
      case 'up':
        offsetY = -distance
        break
      case 'left':
        offsetX = -distance
        break
      case 'right':
        offsetX = distance
        break
    }
    
    this.player.x = this.x - offsetX
    this.player.y = this.y - offsetY
  }

  push(dir) {
    if (!this.player) return


    const hasInput = dir.length() > 0
    
    if (hasInput) {
      this.previousVelocity.copy(this.body.velocity)

      const currentVelNormalized = this.body.velocity.clone().normalize()
      const inputDir = dir.clone()
      let turnResistance = 1.0
      if (this.body.velocity.length() > 20) {
        const dot = currentVelNormalized.dot(inputDir)
        if (dot < 0.5) {
          // Apply resistance based on how sharp the turn is
          turnResistance = Phaser.Math.Linear(0.3, 1.0, (dot + 1) / 1.5)
        }
      }
      // Apply acceleration with turn resistance
      const effectiveAccel = this.acceleration * turnResistance
      
      this.body.setAcceleration(
        dir.x * effectiveAccel, 
        dir.y * effectiveAccel
      )

      // Update player facing direction based on input
      if (dir.x > 0) this.player.facing = 'right'
      else if (dir.x < 0) this.player.facing = 'left'
      else if (dir.y < 0) this.player.facing = 'up'
      else if (dir.y > 0) this.player.facing = 'down'
    } else {
      //set acceleration to 0 so drag takes over
      this.body.setAcceleration(0, 0)
    }

    // Animate player based on cart velocity
    if (this.body.velocity.length() < 10) {
      this.player.play(`idle-${this.player.facing}`, true)
    } else {
      this.player.play(`run-${this.player.facing}`, true)
    }

    // Keep player positioned with cart
    this.updatePlayerPosition()
  }

  update() {
    // Keep player synced with cart
    if (this.player) {
      this.updatePlayerPosition()
      
      // Rotate cart to match player facing after character has turned
      // Only rotate when moving slowly or when direction has stabilized
      const speed = this.body.velocity.length()
      
      if (this.player.facing !== this.currentFacing) {
        // Character has changed facing direction
        // Update cart rotation to match after a brief moment
        this.currentFacing = this.player.facing
        
        // Set target rotation and flip based on facing direction
        // Cart sprite naturally faces left (0°), adjust rotations accordingly
        switch(this.player.facing) {
          case 'left':
            this.targetRotation = 0 // 0 degrees - natural orientation
            this.setFlipX(false) // No flip
            break
          case 'down':
            this.targetRotation = -Math.PI / 2 // -90 degrees (or 270°)
            this.setFlipX(false) // No flip
            break
          case 'right':
            this.targetRotation = 0 // Same as left, but flipped on Y axis (horizontally)
            this.setFlipX(true) // Flip horizontally to face right
            break
          case 'up':
            this.targetRotation = Math.PI / 2 // 90 degrees
            this.setFlipX(false) // No flip
            break
        }
      }
      
      // Smoothly interpolate to target rotation
      const rotationDiff = this.targetRotation - this.rotation
      
      // Handle rotation wrapping (choose shortest path)
      let adjustedDiff = rotationDiff
      if (Math.abs(rotationDiff) > Math.PI) {
        adjustedDiff = rotationDiff - Math.sign(rotationDiff) * Math.PI * 2
      }
      
      // Smooth rotation transition
      this.rotation += adjustedDiff * 0.15 // Adjust speed of rotation here
    }
  }

  getMass() {
    return this.cartMass
  }

  getPhysicsInfo() {
    return {
      mass: this.cartMass,
      maxSpeed: this.maxSpeed,
      acceleration: this.acceleration,
      drag: this.dragAmount
    }
  }
}

