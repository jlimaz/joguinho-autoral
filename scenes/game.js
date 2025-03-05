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
  }

  update(time, delta) {

    const isGrounded = this.player.body.blocked.down

    // Track when the player was last grounded
    if (isGrounded) {
      this.lastGroundedTime = time
    }

    // Track when the player last tried to jump
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.lastJumpPressTime = time
    }

    // Allow jumping if within coyote time or jump buffer window
    const withinCoyoteTime = time - this.lastGroundedTime < this.coyoteTime
    const withinJumpBuffer = time - this.lastJumpPressTime < this.jumpBufferTime

    if (withinCoyoteTime && withinJumpBuffer) {
      this.player.setVelocityY(-350)
      this.player.anims.play('jump', true)

      // Reset the timers to prevent double jumping
      this.lastGroundedTime = 0
      this.lastJumpPressTime = 0
    }

    // Movement controls
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
