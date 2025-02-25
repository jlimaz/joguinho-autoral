const widthGame = 620
const heightGame = 360

var config = {
  type: Phaser.AUTO,
  width: widthGame,
  height: heightGame,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1000 }, debug: false }
  },
  scene: { preload, create, update }
}

var game = new Phaser.Game(config)

// Enemy class
class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)
    this.setVelocityX(Phaser.Math.Between(-50, 50)) // Random initial movement
    this.setBounce(1) // Bounce off walls

    this.play('enemy_walk') // Play walking animation
  }

  update() {
    // Move toward the player
    if (this.scene.player) {
      let direction = this.scene.player.x > this.x ? 1 : -1
      this.setVelocityX(50 * direction)
      this.setFlipX(direction === -1) // Face the player
    }
  }
}

function preload() {
  this.load.image('background', 'assets/background.png')
  this.load.image('ground', 'assets/ground.png')
  this.load.spritesheet('enemy', 'assets/enemy.png', { frameWidth: 22, frameHeight: 33 }) // Load enemy spritesheet
  this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 32 })
  this.load.spritesheet('waterball_startup', 'assets/waterball_startup.png', { frameWidth: 64, frameHeight: 64 })
  this.load.spritesheet('waterball_impact', 'assets/waterball_impact.png', { frameWidth: 64, frameHeight: 64 })

  let mistGfx = this.make.graphics({ x: 0, y: 0, add: false })
  mistGfx.fillStyle(0xffffff, 0.2)
  mistGfx.fillCircle(2, 2, 2)
  mistGfx.generateTexture('mistParticle', 10, 10)
  mistGfx.destroy()
}

function create() {
  this.add.image(widthGame / 2, heightGame / 2, 'background')

  // Create ground
  this.ground = this.physics.add.staticGroup()
  let groundTile = this.ground.create(widthGame / 2, heightGame - 26, 'ground')
  groundTile.displayWidth = widthGame
  groundTile.refreshBody()
  this.ground.setVisible(false)

  this.player = this.physics.add.sprite(widthGame / 2, heightGame / 2, 'player')
  this.player.setSize(15, 27)
  this.player.setCollideWorldBounds(true)
  this.physics.add.collider(this.player, this.ground)

  this.cursors = this.input.keyboard.createCursorKeys()
  this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)

  // Player animations
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

  // Enemy walk animation
  this.anims.create({
    key: 'enemy_walk',
    frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 12 }), 
    frameRate: 13,
    repeat: -1
  })

  // Waterball group
  this.spells = this.physics.add.group({ allowGravity: false })

  // Mist particles
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

  // Enemy group
  this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true })

  // Initial enemy spawn
  spawnEnemy.call(this)

  // Spawn enemies every .5-2 seconds
  this.time.addEvent({
    delay: Phaser.Math.Between(500, 2000),
    callback: spawnEnemy,
    callbackScope: this,
    loop: true
  })

  // Collisions
  this.physics.add.collider(this.enemies, this.ground)
  this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
    console.log('Player hit!')
  })

  this.physics.add.collider(this.spells, this.enemies, (spell, enemy) => {
    console.log('Enemy hit!')
    spell.destroy()
    enemy.destroy()
  })
}

function update() {
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
    castSpell.call(this)
  }
}

function spawnEnemy() {
  let x = Phaser.Math.Between(50, widthGame - 50) // Random X position
  let y = (heightGame - 60) // Spawn above ground
  let enemy = new Enemy(this, x, y)
  this.enemies.add(enemy)
}

function castSpell() {
  let direction = this.player.flipX ? -1 : 1
  let spell = this.spells.create(this.player.x + 10 * direction, (this.player.y - 5), 'waterball_startup')

  spell.setScale(0.6)
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
