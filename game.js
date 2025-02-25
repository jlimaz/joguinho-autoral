const widthGame = 620;
const heightGame = 360;

var config = {
  type: Phaser.AUTO,
  width: widthGame,
  height: heightGame,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1000 }, debug: false }
  },
  scene: { preload, create, update }
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.image('ground', 'assets/ground.png');
  this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 32 });

  // Create a mist texture
  let mistGfx = this.make.graphics({ x: 0, y: 0, add: false });
  mistGfx.fillStyle(0xffffff, 0.2);
  mistGfx.fillCircle(2, 2, 2);
  mistGfx.generateTexture('mistParticle', 10, 10);
  mistGfx.destroy();
}

function create() {
  this.add.image(widthGame / 2, heightGame / 2, 'background');

  // Create ground (invisible)
  this.ground = this.physics.add.staticGroup();
  let groundTile = this.ground.create(widthGame / 2, heightGame - 26, 'ground');
  groundTile.displayWidth = widthGame;
  groundTile.refreshBody();
  this.ground.setVisible(false);

  this.player = this.physics.add.sprite(widthGame / 2, heightGame / 2, 'player');
  this.player.setSize(15, 27);
  this.player.setCollideWorldBounds(true);
  this.physics.add.collider(this.player, this.ground);

  this.cursors = this.input.keyboard.createCursorKeys();

  // Animations
  this.anims.create({
    key: 'idle',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
    frameRate: 2,
    repeat: -1
  });

  this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNumbers('player', { start: 24, end: 31 }),
    frameRate: 8,
    repeat: -1
  });

  this.anims.create({
    key: 'atk',
    frames: this.anims.generateFrameNumbers('player', { start: 64, end: 72 }),
    frameRate: 8,
    repeat: 0
  });

  this.anims.create({
    key: 'jump',
    frames: this.anims.generateFrameNumbers('player', { start: 40, end: 47 }),
    frameRate: 8,
    repeat: 0
  });

  // Mist Particles
  this.mistParticles = this.add.particles(0, 0, 'mistParticle', {
    x: { min: 0, max: widthGame },
    y: { min: heightGame - 400, max: heightGame }, 
    lifespan: 3000,
    speedX: { min: -10, max: 10 },
    speedY: { min: -3, max: -8 },
    alpha: { start: 0.5, end: 0 },
    scale: { start: 1, end: 2 },
    blendMode: 'ADD'
  });
}

function update() {
  let onGround = this.player.body.blocked.down;

  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-100);
    this.player.setFlipX(true);
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(100);
    this.player.setFlipX(false);
  } else {
    this.player.setVelocityX(0);
  }

  if (!onGround) { 
    this.player.anims.play('jump', true);
  } else if (this.cursors.left.isDown || this.cursors.right.isDown) {
    this.player.anims.play('walk', true);
  }

  if (this.cursors.up.isDown && onGround) {
    this.player.setVelocityY(-400);
  }
}
