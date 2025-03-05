class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })

    this.coyoteTime = 100 // milliseconds
    this.jumpBufferTime = 150 // milliseconds
    this.lastGroundedTime = 0
    this.lastJumpPressTime = 0
  }

  preload() {
    this.load.spritesheet('player', 'assets/playerSheet.png', { frameWidth: 900, frameHeight: 900 })
    this.load.image('bgF', 'assets/backgroundIG.png')
    this.load.image('ground', 'assets/ground.png')

    let mistGfx = this.make.graphics({ x: 0, y: 0, add: false })
    mistGfx.fillStyle(0xffffff, 0.2)
    mistGfx.fillCircle(3, 3, 3)
    mistGfx.generateTexture('mistParticle', 5, 5)
    mistGfx.destroy()
  }

  create() {
    this.cameras.main.fadeIn(225, 0, 0, 0)

    this.add.image(widthGame / 2, heightGame / 2, 'bgF')
    this.player = this.physics.add.sprite(100, 500, 'player').setScale(0.2)
    this.player.body.setSize(340, 600)
    this.player.setCollideWorldBounds(true)

    this.ground = this.physics.add.staticGroup()
    this.ground.create(widthGame / 2, heightGame - 50, 'ground').refreshBody()
    this.physics.add.collider(this.player, this.ground)

    this.cursors = this.input.keyboard.createCursorKeys()

    // Define animations
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 17 }),
      frameRate: 18,
      repeat: -1
    })

    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', { start: 20, end: 31 }),
      frameRate: 12,
      repeat: -1
    })

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player', { start: 50, end: 55 }),
      frameRate: 6,
      repeat: -1
    })

    this.mistParticles = this.add.particles(0, 0, 'mistParticle', {
      x: { min: 0, max: widthGame },
      y: { min: 0, max: heightGame - 110},
      lifespan: 3000,
      speedX: { min: -10, max: 10 },
      speedY: { min: -3, max: -8 },
      alpha: { start: 0.5, end: 0 },
      scale: { start: 1, end: 2 },
      blendMode: 'ADD'
    })

    // 🔴 Enemy Group
    this.enemies = this.physics.add.group()

    // Enemies collide with the ground
    this.physics.add.collider(this.enemies, this.ground)

    // Overlap instead of collision (triggers event when touching)
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerOverlap, null, this)

    // Enemy Spawning
    this.time.addEvent({
      delay: 2000, // Spawn every 2 seconds
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    })
  }

  spawnEnemy() {
    let x = Phaser.Math.Between(50, widthGame - 50) // Random X position
    let y = Phaser.Math.Between(50, heightGame / 2) // Random Y position (above ground)

    let enemy = this.enemies.create(x, y, 'player').setScale(0.2) // Reusing player sprite for now
    enemy.body.setSize(340, 600)
    enemy.setCollideWorldBounds(true)
    enemy.setTint(0xff0000) // Make it visually distinct

    // Give it an initial velocity toward the player
    this.setEnemyMovement(enemy)
  }

  setEnemyMovement(enemy) {
    this.time.addEvent({
      delay: 100, // Update movement every 100ms
      callback: () => {
        if (!enemy.active) return

        let directionX = this.player.x - enemy.x
        let directionY = this.player.y - enemy.y

        let speed = 100 // Adjust speed as needed

        let angle = Math.atan2(directionY, directionX)
        enemy.setVelocityX(Math.cos(angle) * speed)
        enemy.setVelocityY(Math.sin(angle) * speed)
      },
      loop: true
    })
  }

  handlePlayerOverlap(player, enemy) {
    console.log('⚠ Player touched an enemy!') // Replace with damage or game over logic
    enemy.destroy() // Remove enemy on contact (optional)
  }

  update(time, delta) {
    const isGrounded = this.player.body.blocked.down

    if (isGrounded) {
      this.lastGroundedTime = time
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.lastJumpPressTime = time
    }

    const withinCoyoteTime = time - this.lastGroundedTime < this.coyoteTime
    const withinJumpBuffer = time - this.lastJumpPressTime < this.jumpBufferTime

    if (withinCoyoteTime && withinJumpBuffer) {
      this.player.setVelocityY(-350)
      this.player.anims.play('jump', true)
      this.lastGroundedTime = 0
      this.lastJumpPressTime = 0
    }

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-220)
      this.player.anims.play('run', true)
      this.player.setFlipX(true)
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(220)
      this.player.anims.play('run', true)
      this.player.setFlipX(false)
    } else {
      this.player.setVelocityX(0)
      this.player.anims.play('idle', true)
    }
  }
}
