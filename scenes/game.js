class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })

    // Coyote time and jump buffer for smoother jumping mechanics
    this.coyoteTime = 100 // Time after leaving the ground where you can still jump
    this.jumpBufferTime = 150 // Time before landing where a jump input is still valid
    this.lastGroundedTime = 0 // Tracks the last time the player was on the ground
    this.lastJumpPressTime = 0 // Tracks the last time the jump key was pressed

    // Player stats
    this.maxHealth = 100
    this.health = this.maxHealth

    this.maxMana = 200
    this.mana = this.maxMana
    this.manaRegenRate = 10 // Mana regenerated per second
    this.manaCost = 20 // Mana cost to cast a spell

    this.score = 0 // Player's score
  }

  preload() {
    // Load all assets (spritesheets, images, etc.)
    this.load.spritesheet('player', 'assets/playerSheet.png', { frameWidth: 900, frameHeight: 900 })
    this.load.spritesheet('skeleton', 'assets/skeleton.png', { frameWidth: 900, frameHeight: 900 })
    this.load.spritesheet('spell', 'assets/spell.png', { frameWidth: 1800, frameHeight: 1200 })
    this.load.image('backgroundIG', 'assets/backgroundIG.png')
    this.load.image('background2', 'assets/backgroundMenu2.png')
    this.load.image('ground', 'assets/ground.png')
    this.load.image('skull', 'assets/skull.png')

    // Load UI elements
    this.load.image('menuButton', 'assets/menu.png')
    this.load.image('helpButton', 'assets/help.png')
    this.load.image('infiniteMode', 'assets/infiniteMode.png')
    this.load.image('moveWith', 'assets/moveWith.png')
    this.load.image('castSpell', 'assets/castSpell.png')
    this.load.image('hudTopLeft', 'assets/hudTopLeft.png')
    this.load.spritesheet('headSprite', 'assets/headSprite.png', { frameWidth: 500, frameHeight: 500 })

    // Create a mist particle effect
    let mistGfx = this.make.graphics({ x: 0, y: 0, add: false })
    mistGfx.fillStyle(0xffffff, 0.2)
    mistGfx.fillCircle(3, 3, 3)
    mistGfx.generateTexture('mistParticle', 5, 5)
    mistGfx.destroy()
  }

  create() {
    // Initialize player stats
    this.health = this.maxHealth
    this.updateHealthBar()

    this.mana = this.maxMana
    this.updateManaBar()

    // Fade in the scene
    this.cameras.main.fadeIn(225, 0, 0, 0)

    // Add background images
    this.background2 = this.add.tileSprite(0, 0, widthGame, heightGame, 'background2').setOrigin(0, 0)
    this.add.image(widthGame / 2, heightGame / 2, 'backgroundIG')

    // Add UI elements
    this.add.image(310, 110, 'hudTopLeft').setScale(0.2)
    this.headSprite = this.add.sprite(110, 110, 'headSprite').setScale(0.2)

    const menuButton = this.add.image(widthGame - 75, 75, 'menuButton').setScale(0.3)
    const helpButton = this.add.image(widthGame - 150, 75, 'helpButton').setScale(0.3)

    this.add.image(80, 260, 'skull').setScale(0.275)

    // Make the menu button interactive
    menuButton.setInteractive()
    menuButton.on('pointerdown', () => {
      this.scene.launch('PauseScene')
      this.scene.pause()
    })

    // Pause the game when ESC key is pressed
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.launch('PauseScene')
      this.scene.pause()
    })

    // Add hover effects to the menu button
    menuButton.on('pointerover', () => {
      this.tweens.add({
        targets: menuButton,
        scale: 0.33,
        duration: 250,
        ease: 'Power2'
      })
      menuButton.setTint(0xC0C0C0)
    })

    menuButton.on('pointerout', () => {
      this.tweens.add({
        targets: menuButton,
        scale: 0.3,
        duration: 250,
        ease: 'Power2'
      })
      menuButton.clearTint()
    })

    // Make the help button interactive
    helpButton.setInteractive()

    // Add hover effects to the help button
    helpButton.on('pointerover', () => {
      this.tweens.add({
        targets: helpButton,
        scale: 0.33,
        duration: 250,
        ease: 'Power2'
      })
      helpButton.setTint(0xC0C0C0)
    })

    helpButton.on('pointerout', () => {
      this.tweens.add({
        targets: helpButton,
        scale: 0.3,
        duration: 250,
        ease: 'Power2'
      })
      helpButton.clearTint()
    })

    // Create health and mana bars
    this.healthBar = this.add.rectangle(388, 72.5, 356, 40, 0xD84040)
    this.manaBar = this.add.rectangle(388, 148.5, 356, 40, 0x578FCA)

    // Regenerate mana and health over time
    this.time.addEvent({
      delay: 1000,
      callback: this.regenerateMana,
      callbackScope: this,
      loop: true
    })

    this.time.addEvent({
      delay: 1000,
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true
    })

    // Show tutorial messages with fade-in and fade-out effects
    this.time.delayedCall(2000, () => {
      let image = this.add.image(widthGame / 2, 75, 'infiniteMode').setAlpha(0)
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
                image.destroy()
              }
            })
          })
        }
      })
    })

    this.time.delayedCall(2000, () => {
      let image = this.add.image(widthGame - 325, heightGame - 230, 'moveWith').setAlpha(0)
      this.tweens.add({
        targets: image,
        alpha: 1,
        duration: 1000,
        onComplete: () => {
          this.time.delayedCall(6000, () => {
            this.tweens.add({
              targets: image,
              alpha: 0,
              duration: 1000,
              onComplete: () => {
                image.destroy()
              }
            })
          })
        }
      })
    })
    
    this.time.delayedCall(2000, () => {
      let image = this.add.image(widthGame - 325, heightGame - 150, 'castSpell').setAlpha(0)
      this.tweens.add({
        targets: image,
        alpha: 1,
        duration: 1000,
        onComplete: () => {
          this.time.delayedCall(6000, () => {
            this.tweens.add({
              targets: image,
              alpha: 0,
              duration: 1000,
              onComplete: () => {
                image.destroy()
              }
            })
          })
        }
      })
    })

    // Help button interaction
    helpButton.on('pointerdown', () => {
      let moveWithImage = this.add.image(widthGame - 325, heightGame - 230, 'moveWith').setAlpha(0)
      this.tweens.add({
        targets: moveWithImage,
        alpha: 1,
        duration: 1000,
        onComplete: () => {
          this.time.delayedCall(6000, () => {
            this.tweens.add({
              targets: moveWithImage,
              alpha: 0,
              duration: 1000,
              onComplete: () => {
                moveWithImage.destroy()
              }
            })
          })
        }
      })
    
      let castSpellImage = this.add.image(widthGame - 325, heightGame - 150, 'castSpell').setAlpha(0)
      this.tweens.add({
        targets: castSpellImage,
        alpha: 1,
        duration: 1000,
        onComplete: () => {
          this.time.delayedCall(6000, () => {
            this.tweens.add({
              targets: castSpellImage,
              alpha: 0,
              duration: 1000,
              onComplete: () => {
                castSpellImage.destroy()
              }
            })
          })
        }
      })
    })

    // Add player and ground physics
    this.player = this.physics.add.sprite(100, heightGame - 200, 'player').setScale(0.2)
    this.player.body.setSize(340, 600)
    this.player.setCollideWorldBounds(true)

    this.ground = this.physics.add.staticGroup()
    let groundTile = this.ground.create(widthGame / 2, heightGame - 50, 'ground')
    groundTile.refreshBody()

    this.physics.add.collider(this.player, this.ground)

    // Set up keyboard input
    this.cursors = this.input.keyboard.createCursorKeys()
    this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K)

    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    // Display the score
    this.scoreText = this.add.text(160, 260, '0', {
      fontSize: '48px',
      fill: '#fff',
      fontFamily: 'Jersey25'
    }).setOrigin(0.5, 0.5)

    // Create animations for the player, enemies, and spells
    this.anims.create({
      key: 'blink',
      frames: this.anims.generateFrameNumbers('headSprite', { start: 0, end: 1 }),
      frameRate: 2,
      repeat: 0
    })

    this.anims.create({
      key: 'idleHead',
      frames: this.anims.generateFrameNumbers('headSprite', { start: 0, end: 0 }),
      frameRate: 1,
      repeat: 0
    })

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
      frames: this.anims.generateFrameNumbers('spell', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    })

    // Add mist particles for atmosphere
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

    // Create enemy group and set up collisions
    this.enemies = this.physics.add.group()
    this.physics.add.collider(this.enemies, this.ground)
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerOverlap, null, this)

    // Spawn enemies periodically
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    })

    // Make the head sprite blink periodically
    this.time.addEvent({
      delay: 3500,
      callback: () => {
        this.headSprite.anims.play('blink', true)
        this.headSprite.once('animationcomplete', () => {
          this.headSprite.anims.play('idleHead', true)
        })
      },
      callbackScope: this,
      loop: true
    })

    // Create spell group and set up overlaps
    this.spells = this.physics.add.group()
    this.physics.add.overlap(this.spells, this.enemies, this.spellHitEnemy, null, this)
  }

  // Spawn an enemy at a safe distance from the player
  spawnEnemy() {
    let spawnX
    let safeDistance = 150

    do {
      spawnX = Phaser.Math.Between(50, widthGame - 50)
    } while (Math.abs(spawnX - this.player.x) < safeDistance)

    let spawnY = heightGame - 165
    let enemy = this.enemies.create(spawnX, spawnY, 'skeleton').setScale(0.2)
    enemy.body.setSize(340, 600)
    enemy.setCollideWorldBounds(true)
    enemy.anims.play('skeleton_run', true)

    this.setEnemyMovement(enemy)
  }

  // Make the enemy move towards the player
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

  // Handle spell hitting an enemy
  spellHitEnemy(spell, enemy) {
    spell.destroy()
    enemy.destroy()
    this.score++
    this.updateScoreText()
  }

  // Update the score display
  updateScoreText() {
    this.scoreText.setText(this.score)
  }

  // Regenerate mana over time
  regenerateMana() {
    this.mana = Math.min(this.mana + this.manaRegenRate, this.maxMana)
    this.updateManaBar()
  }

  // Regenerate health over time
  regenerateHealth() {
    this.health = Math.min(this.health + 1, this.maxHealth)
    this.updateHealthBar()
  }

  // Shoot a spell if the player has enough mana
  shootSpell() {
    if (this.mana < this.manaCost) {
      console.log('not enough mana!')
      return
    }

    let spell = this.spells.create(this.player.x, this.player.y - 10, 'spell').setScale(0.10)
    spell.anims.play('spell_fly', true)

    this.mana -= this.manaCost
    this.updateManaBar()

    let direction = this.player.flipX ? -1 : 1
    spell.body.setSize(815, 415)
    spell.setVelocityX(400 * direction)
    spell.setFlipX(this.player.flipX)
    spell.body.allowGravity = false

    // Destroy the spell after 2 seconds
    this.time.delayedCall(2000, () => spell.destroy())

    this.player.anims.play('shoot', true)
    this.isShooting = true

    this.player.once('animationcomplete-shoot', () => {
      this.isShooting = false
    })
  }

  // Update the mana bar display
  updateManaBar() {
    let newWidth = (this.mana / this.maxMana) * 356

    this.tweens.add({
      targets: this.manaBar,
      width: Math.max(newWidth, 0),
      duration: 250,
      ease: 'Linear'
    })
  }

  // Update the health bar display
  updateHealthBar() {
    let newWidth = (this.health / this.maxHealth) * 356

    this.tweens.add({
      targets: this.healthBar,
      width: Math.max(newWidth, 0),
      duration: 250,
      ease: 'Linear'
    })
  }

  // Handle game over
  gameOver() {
    this.scene.stop()
    this.scene.start('OverScene')
  }

  // Handle player taking damage from an enemy
  handlePlayerOverlap(player, enemy) {
    console.log('⚠ Player took damage!')
    enemy.destroy()

    this.health -= 20
    this.updateHealthBar()

    if (this.health <= 0) {
      this.gameOver()
    }
  }

  // Update the game state every frame
  update(time, delta) {
    const isGrounded = this.player.body.blocked.down

    if (isGrounded) {
      this.lastGroundedTime = time
    }

    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      this.lastJumpPressTime = time
    }

    // Check if the player is within coyote time and jump buffer
    const withinCoyoteTime = time - this.lastGroundedTime < this.coyoteTime
    const withinJumpBuffer = time - this.lastJumpPressTime < this.jumpBufferTime

    if (withinCoyoteTime && withinJumpBuffer) {
      this.player.setVelocityY(-350)

      if (!this.isShooting) {
        this.player.anims.play('jump', true)
      }

      this.lastGroundedTime = 0
      this.lastJumpPressTime = 0
    }

    // Handle player movement
    if (this.keyA.isDown) {
      this.player.setVelocityX(-220)
      if (!this.isShooting && this.player.body.blocked.down) {
        this.player.anims.play('run', true)
      }
      this.player.setFlipX(true)
    } else if (this.keyD.isDown) {
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

    // Shoot a spell when the shoot key is pressed
    if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
      this.shootSpell()
    }

    // Scroll the background
    this.background2.tilePositionX += 0.2
  }
}