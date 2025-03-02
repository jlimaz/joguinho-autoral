class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })

    // Mana system properties
    this.maxMana = 200 // Max mana
    this.mana = this.maxMana // Start at full mana
    this.manaRegenRate = 25 // Mana regeneration per second
    this.manaCost = 25 // Mana cost per spell

    // Health system properties
    this.maxHealth = 100
    this.health = this.maxHealth
  }

  preload() {
    this.load.image('background', 'assets/background.png')
    this.load.spritesheet('enemy', 'assets/enemy.png', { frameWidth: 22, frameHeight: 33 })
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('waterball_startup', 'assets/waterball_startup.png', { frameWidth: 64, frameHeight: 64 })
    this.load.spritesheet('waterball_impact', 'assets/waterball_impact.png', { frameWidth: 64, frameHeight: 64 })
    this.load.image('strokeBar', 'assets/strokeBar.png')
    this.load.image('heart', 'assets/heart.png')
    this.load.image('mana', 'assets/mana.png')
    this.load.image('hudQ', 'assets/hudQ.png')
    this.load.image('hudE', 'assets/hudE.png')
    this.load.image('hudR', 'assets/hudR.png')
    this.load.image('hudLeft', 'assets/hudLeft.png')
    this.load.image('hudRight', 'assets/hudRight.png')

    let mistGfx = this.make.graphics({ x: 0, y: 0, add: false })
    mistGfx.fillStyle(0xffffff, 0.2)
    mistGfx.fillCircle(2, 2, 2)
    mistGfx.generateTexture('mistParticle', 10, 10)
    mistGfx.destroy()
  }

  create() {
    this.add.image(widthGame / 2, heightGame / 2, 'background')

    this.add.image(530, 23, 'hudQ').setScale(0.045)
    this.add.image(560, 23, 'hudE').setScale(0.045)
    this.add.image(590, 23, 'hudR').setScale(0.045)

    this.add.image(590, 48, 'hudRight').setScale(0.045)
    this.add.image(560, 48, 'hudLeft').setScale(0.045)

    this.add.image(20, 23, 'heart').setScale(0.035)
    this.add.image(20, 48, 'mana').setScale(0.035)

    this.add.image(89.5, 22, 'strokeBar').setDepth(100)
    this.add.image(89.5, 48, 'strokeBar').setDepth(100)

    this.ground = this.physics.add.staticGroup()
    let groundTile = this.ground.create(widthGame / 2, heightGame - 26, null)
    groundTile.displayWidth = widthGame
    groundTile.refreshBody()
    this.ground.setVisible(false)

    this.player = this.physics.add.sprite(widthGame / 2, heightGame / 2, 'player')
    this.player.setSize(15, 27)
    this.player.setCollideWorldBounds(true)
    this.physics.add.collider(this.player, this.ground)

    this.cursors = this.input.keyboard.createCursorKeys()
    this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
      frameRate: 2,
      repeat: -1
    })

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('player', { start: 24, end: 31 }),
      frameRate: 8,
      repeat: -1
    })

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player', { start: 40, end: 47 }),
      frameRate: 8,
      repeat: 0
    })

    this.anims.create({
      key: 'waterball_startup',
      frames: this.anims.generateFrameNumbers('waterball_startup', { start: 0, end: 20 }),
      frameRate: 21,
      repeat: 0
    })

    this.anims.create({
      key: 'waterball_impact',
      frames: this.anims.generateFrameNumbers('waterball_impact', { start: 0, end: 14 }),
      frameRate: 15,
      repeat: 0
    })

    this.anims.create({
      key: 'enemy_walk',
      frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 12 }),
      frameRate: 13,
      repeat: -1
    })

    this.spells = this.physics.add.group({ allowGravity: false })

    this.mistParticles = this.add.particles(0, 0, 'mistParticle', {
      x: { min: 0, max: widthGame },
      y: { min: heightGame - 400, max: heightGame },
      lifespan: 3000,
      speedX: { min: -10, max: 10 },
      speedY: { min: -3, max: -8 },
      alpha: { start: 0.5, end: 0 },
      scale: { start: 1, end: 2 },
      blendMode: 'ADD'
    })

    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true })

    this.spawnEnemy()

    this.time.addEvent({
      delay: Phaser.Math.Between(500, 2000),
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    })

    this.physics.add.collider(this.enemies, this.ground)
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      console.log('Player hit!')
    })

    this.physics.add.overlap(this.spells, this.enemies, (spell, enemy) => {
      console.log('Enemy hit!')
      spell.destroy()
      enemy.destroy()
    })

    // Create mana bar UI
    this.manaBar = this.add.graphics()
    this.updateManaBar()

    // Create health bar UI
    this.healthBar = this.add.graphics()
    this.updateHealthBar()

    // Mana regeneration event
    this.time.addEvent({
      delay: 1000, // Regenerates every second
      callback: () => {
        this.mana = Math.min(this.mana + this.manaRegenRate, this.maxMana)
        this.updateManaBar()
      },
      callbackScope: this,
      loop: true
    })
  }

  update() {
    let onGround = this.player.body.blocked.down

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-100)
      this.player.setFlipX(true)
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(100)
      this.player.setFlipX(false)
    } else {
      this.player.setVelocityX(0)
    }

    if (!onGround) {
      this.player.anims.play('jump', true)
    } else if (this.cursors.left.isDown || this.cursors.right.isDown) {
      this.player.anims.play('walk', true)
    } else {
      this.player.anims.play('idle', true)
    }

    if (this.cursors.up.isDown && onGround) {
      this.player.setVelocityY(-335)
    }

    if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
      this.castSpell()
    }
  }

  spawnEnemy() {
    let x = Phaser.Math.Between(50, widthGame - 50)
    let y = heightGame - 60
    let enemy = new Enemy(this, x, y)
    this.enemies.add(enemy)
  }

  castSpell() {
    if (this.mana < this.manaCost) {
      console.log('Not enough mana!')
      return
    }

    this.mana -= this.manaCost
    this.updateManaBar()

    let direction = this.player.flipX ? -1 : 1
    let spell = this.spells.create(this.player.x + 10 * direction, this.player.y - 5, 'waterball_startup')

    spell.setScale(0.6)
    spell.setSize(40, 20)
    spell.setVelocityX(200 * direction)
    spell.body.setAllowGravity(false)
    spell.setFlipX(this.player.flipX)
    spell.anims.play('waterball_startup')

    this.time.delayedCall(1200, () => {
      if (spell.active) {
        spell.setTexture('waterball_impact')
        spell.setVelocityX(0)
        spell.anims.play('waterball_impact')
        this.time.delayedCall(800, () => spell.destroy())
      }
    })
  }

    // Update Health Bar UI
  updateHealthBar() {
    this.healthBar.clear()
    this.healthBar.fillStyle(0xD84040, 1)
    this.healthBar.fillRect(40, 15, (this.health / this.maxHealth) * 100, 15)
    }

    // Update Mana Bar UI
  updateManaBar() {
    this.manaBar.clear()
    this.manaBar.fillStyle(0x3674B5, 1)
    this.manaBar.fillRect(40, 39, (this.mana / this.maxMana) * 100, 15) // Scales the bar
  }
}

class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)
    this.setVelocityX(Phaser.Math.Between(-50, 50))
    this.setBounce(1)

    this.play('enemy_walk')
  }

  update() {
    if (this.scene.player) {
      let direction = this.scene.player.x > this.x ? 1 : -1
      this.setVelocityX(50 * direction)
      this.setFlipX(direction === -1)
    }
  }
}
