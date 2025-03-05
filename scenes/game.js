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
    this.load.spritesheet('skeleton', 'assets/skeleton.png', { frameWidth: 900, frameHeight: 900 })
    this.load.spritesheet('spell', 'assets/spell.png', { frameWidth: 1800, frameHeight: 1200 }) // Load spell
    this.load.image('bgF', 'assets/backgroundIG.png')
    this.load.image('ground', 'assets/ground.png')

    this.load.image('menuButton', 'assets/menu.png')
    this.load.image('firstWave', 'assets/firstWave.png')

    let mistGfx = this.make.graphics({ x: 0, y: 0, add: false })
    mistGfx.fillStyle(0xffffff, 0.2)
    mistGfx.fillCircle(3, 3, 3)
    mistGfx.generateTexture('mistParticle', 5, 5)
    mistGfx.destroy()
  }

  create() {
    this.cameras.main.fadeIn(225, 0, 0, 0)
    this.add.image(widthGame / 2, heightGame / 2, 'bgF')

    this.add.image(widthGame - 75, 75, 'menuButton').setScale(0.35)
    // Add image with delay and fade in/out
    this.time.delayedCall(2000, () => {
      let image = this.add.image(widthGame / 2, 75, 'firstWave').setAlpha(0);
      this.tweens.add({
      targets: image,
      alpha: 1,
      duration: 1000,
      onComplete: () => {
        this.time.delayedCall(3000, () => {
        this.tweens.add({
          targets: image,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
          image.destroy();
          }
        });
        });
      }
      });
    });

    this.player = this.physics.add.sprite(100, heightGame - 200, 'player').setScale(0.2)
    this.player.body.setSize(340, 600)
    this.player.setCollideWorldBounds(true)

    this.ground = this.physics.add.staticGroup()
    let groundTile = this.ground.create(widthGame / 2, heightGame - 50, 'ground')
    groundTile.refreshBody()

    this.physics.add.collider(this.player, this.ground)
    this.cursors = this.input.keyboard.createCursorKeys()
    this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K) // Add shoot key

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 17 }),
      frameRate: 18,
      repeat: -1
    })

    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', { start: 20, end: 31 }),
      frameRate: 14,
      repeat: -1
    })

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player', { start: 50, end: 55 }),
      frameRate: 6,
      repeat: -1
    })

    this.anims.create({
      key: 'shoot',
      frames: this.anims.generateFrameNumbers('player', { start: 35, end: 46 }),
      frameRate: 24,
      repeat: 0
    })

    this.anims.create({
      key: 'skeleton_run',
      frames: this.anims.generateFrameNumbers('skeleton', { start: 0, end: 11 }),
      frameRate: 12,
      repeat: -1
    })

    this.anims.create({
      key: 'spell_fly',
      frames: this.anims.generateFrameNumbers('spell', { start: 0, end: 3 }), // Assuming 4 frames for the spell
      frameRate: 10,
      repeat: -1
    })

    this.mistParticles = this.add.particles(0, 0, 'mistParticle', {
      x: { min: 0, max: widthGame },
      y: { min: 0, max: heightGame - 110 },
      lifespan: 3000,
      speedX: { min: -10, max: 10 },
      speedY: { min: -3, max: -8 },
      alpha: { start: 0.5, end: 0 },
      scale: { start: 1, end: 2 },
      blendMode: 'ADD'
    })

    this.enemies = this.physics.add.group()
    this.physics.add.collider(this.enemies, this.ground)
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerOverlap, null, this)

    this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    })

    // 🔥 Spell group
    this.spells = this.physics.add.group()

    // Collision: Spell hits enemy
    this.physics.add.overlap(this.spells, this.enemies, this.spellHitEnemy, null, this)
  }

  spawnEnemy() {
    let spawnX = Phaser.Math.Between(50, widthGame - 50)
    let spawnY = heightGame - 165

    let enemy = this.enemies.create(spawnX, spawnY, 'skeleton').setScale(0.2)
    enemy.body.setSize(340, 600)
    enemy.setCollideWorldBounds(true)
    enemy.anims.play('skeleton_run', true)

    this.setEnemyMovement(enemy)
  }

  setEnemyMovement(enemy) {
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!enemy.active) return

        let directionX = this.player.x - enemy.x
        let speed = 100

        if (directionX > 0) {
          enemy.setVelocityX(speed)
          enemy.setFlipX(false)
        } else {
          enemy.setVelocityX(-speed)
          enemy.setFlipX(true)
        }
      },
      loop: true
    })
  }

  spellHitEnemy(spell, enemy) {
    spell.destroy()
    enemy.destroy()
  }

  shootSpell() {
    let spell = this.spells.create(this.player.x, this.player.y - 10, 'spell').setScale(0.10)
    
    spell.anims.play('spell_fly', true)
  
    let direction = this.player.flipX ? -1 : 1
    spell.setVelocityX(400 * direction)
    spell.setFlipX(this.player.flipX)
    
    spell.body.allowGravity = false // ✅ Disable gravity so it moves straight
    
    // Destroy spell after leaving screen
    this.time.delayedCall(2000, () => spell.destroy())
  
    // 🔥 Play shoot animation **without stopping movement**
    this.player.anims.play('shoot', true)
  
    // ✅ Set a flag so update() knows the shoot animation is playing
    this.isShooting = true 
  
    // ⏳ Once the animation ends, reset the flag
    this.player.once('animationcomplete-shoot', () => {
      this.isShooting = false
    })
  }
  

  handlePlayerOverlap(player, enemy) {
    console.log('⚠ Player touched an enemy!')
    enemy.destroy()
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
  
      // 🔥 Only play jump animation if not shooting
      if (!this.isShooting) {
        this.player.anims.play('jump', true)
      }
  
      this.lastGroundedTime = 0
      this.lastJumpPressTime = 0
    }
  
    // ✅ Allow movement while shooting, but don't override the shoot animation
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-220)
      if (!this.isShooting && this.player.body.blocked.down) {
        this.player.anims.play('run', true)
      }
      this.player.setFlipX(true)
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(220)
      if (!this.isShooting && this.player.body.blocked.down) {
        this.player.anims.play('run', true)
      }
      this.player.setFlipX(false)
    } else {
      this.player.setVelocityX(0)
      if (!this.isShooting && this.player.body.blocked.down) {
        this.player.anims.play('idle', true)
      }
    }
  
    if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
      this.shootSpell()
    }
  }  
}
