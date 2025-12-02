class Cart extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'cart', 0)

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)
    
    this.cartMass = 1.0
    this.baseMass = 1

    this.filled = false

    
    this.updatePhysicsProperties()
    
    this.setOrigin(0.5, 0.5)
    this.setScale(1)
    this.setFrame(1) // Start with top-down view for facing down
    this.setRotation(0) // Start facing down
    
    this.player = null
    this.previousVelocity = new Phaser.Math.Vector2(0, 0)
    this.targetRotation = 0 // Start facing down
    this.currentFacing = 'down' // Track which direction cart is facing
  }

  updateCartUI() {
    let frame = this.filled ? 2 : 0;
    if (this.currentFacing === 'up' || this.currentFacing === 'down')
    {
      frame += 1;
    }

    this.setFrame(frame);
    
  }

  updatePhysicsProperties() {
    // Physics scale with mass
    const totalMass = this.baseMass + this.cartMass
    
    // Heavier cart = slower max speed
    this.maxSpeed = 250 - (this.cartMass * 30)
    
    // Heavier cart = slower acceleration  
    this.acceleration = 400 - (this.cartMass * 80)
    
    // Heavier cart = more momentum (less drag = less deceleration)
    this.dragAmount = 400 - (this.cartMass * 100)
    

    this.body.setMaxVelocity(this.maxSpeed, this.maxSpeed)
    this.body.setDrag(this.dragAmount, this.dragAmount)
    this.updateCartUI();
  }

  setMass(mass) {
    this.cartMass = Math.max(0, mass)
    // Update filled state based on whether cart has items (mass above base)
    this.filled = this.cartMass > this.baseMass
    this.updatePhysicsProperties()
    this.updateCartUI();
  }

  adjustMass(delta) {
    this.cartMass = Math.max(0, this.cartMass + delta)
    // Update filled state based on whether cart has items (mass above base)
    this.filled = this.cartMass > this.baseMass
    this.updatePhysicsProperties()
    this.updateCartUI();
  }

  attachPlayer(player) {
    this.player = player
    this.updatePlayerPosition()
  }

  updatePlayerPosition() {
    if (!this.player) return
    
    // During movement, player follows cart with physics
    // When stationary and changing direction, cart repositions relative to player
    const speed = this.body.velocity.length()
    
    // Calculate offset based on cart's current facing direction
    let offsetX = 0
    let offsetY = 0
    
    switch(this.currentFacing) {
      case 'down':
        offsetY = 12 // Cart in front when pushing down
        break
      case 'up':
        offsetY = -12 // Cart in front when pushing up
        break
      case 'left':
        offsetX = -12 // Cart in front when pushing left
        break
      case 'right':
        offsetX = 12 // Cart in front when pushing right
        break
    }
    
    if (speed > 10) {
      // Moving: player smoothly follows cart
      const targetX = this.x - offsetX
      const targetY = this.y - offsetY
      this.player.x += (targetX - this.player.x) * 0.3
      this.player.y += (targetY - this.player.y) * 0.3
    } else {
      // Stationary: cart repositions relative to player (player stays still)
      this.x = this.player.x + offsetX
      this.y = this.player.y + offsetY
    }
  }

  push(dir, speedMultiplier = 1) {
    if (!this.player) return

    // Energy reduces the "added mass" from items
    // speedMultiplier: 1 = no reduction, 2 = 100% reduction of added mass
    // At full energy (multiplier=2), cart feels like base mass only
    const addedMass = this.cartMass - this.baseMass
    const reductionPercent = Math.min(1, speedMultiplier - 1) // 0 to 1
    const effectiveMass = this.baseMass + addedMass * (1 - reductionPercent)
    
    // Recalculate physics with effective mass (same formulas as updatePhysicsProperties)
    const effectiveMaxSpeed = 250 - (effectiveMass * 30)
    const effectiveAcceleration = 400 - (effectiveMass * 80)
    const effectiveDrag = 400 - (effectiveMass * 100)
    
    // Apply the boosted physics
    this.body.setMaxVelocity(effectiveMaxSpeed, effectiveMaxSpeed)
    this.body.setDrag(effectiveDrag, effectiveDrag)

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
      // Apply acceleration with turn resistance (using effective acceleration)
      const finalAccel = effectiveAcceleration * turnResistance
      
      this.body.setAcceleration(
        dir.x * finalAccel, 
        dir.y * finalAccel
      )
    } else {
      //set acceleration to 0 so drag takes over
      this.body.setAcceleration(0, 0)
    }
  }

  update() {
    // Normalize diagonal movement speed
    const vel = this.body.velocity
    const speed = vel.length()
    
    // If moving diagonally faster than max speed, normalize it
    if (speed > this.maxSpeed) {
      this.body.velocity.normalize().scale(this.maxSpeed)
    }
    
    // Keep player synced with cart
    if (this.player) {
      // Determine cart and player facing based on velocity direction
      
      if (speed > 10) { // Only update facing when actually moving
        let velocityFacing = this.currentFacing
        
        // Determine direction based on velocity
        if (Math.abs(vel.x) > Math.abs(vel.y)) {
          // Moving more horizontally
          velocityFacing = vel.x > 0 ? 'right' : 'left'
        } else {
          // Moving more vertically
          velocityFacing = vel.y > 0 ? 'down' : 'up'
        }
        
        // Update player facing to match velocity
        this.player.facing = velocityFacing
        
        // Only update cart sprite if direction changed
        if (velocityFacing !== this.currentFacing) {
          this.currentFacing = velocityFacing
          
          // Switch between frames based on velocity direction
          // Frame 0: Side view (for left/right)
          // Frame 1: Top-down view (for up/down)
          switch(this.currentFacing) {
            case 'left':

              this.targetRotation = 0
              this.setFlipX(false)
              this.setFlipY(false)
              break
            case 'right':
              this.targetRotation = 0
              this.setFlipX(true) // Flip horizontally
              this.setFlipY(false)
              break
            case 'down':

              this.targetRotation = 0
              this.setFlipX(false)
              this.setFlipY(true) // Flip vertically so handle faces up (toward player)
              break
            case 'up':

              this.targetRotation = 0
              this.setFlipX(false)
              this.setFlipY(false) // No flip - handle faces down (toward player)
              break
          }
        }
        this.updateCartUI();
      }
      
      // Animate player based on cart velocity
      if (speed < 10) {
        this.player.play(`default-idle-${this.player.facing}`, true)
      } else {
        this.player.play(`default-run-${this.player.facing}`, true)
      }
      
      // Update player position relative to cart
      this.updatePlayerPosition()
      
      // Smoothly interpolate to target rotation
      const rotationDiff = this.targetRotation - this.rotation
      
      // Handle rotation wrapping (choose shortest path)
      let adjustedDiff = rotationDiff
      if (Math.abs(rotationDiff) > Math.PI) {
        adjustedDiff = rotationDiff - Math.sign(rotationDiff) * Math.PI * 2
      }
      
      // Smooth rotation transition
      this.rotation += adjustedDiff * 0.15
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

