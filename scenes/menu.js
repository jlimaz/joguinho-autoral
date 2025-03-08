class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' }); // Define a chave da cena como 'menuScene'
  }

  preload() {
    this.load.image('background1', 'assets/backgroundMenu1.png');
    this.load.image('background2', 'assets/backgroundMenu2.png');
    this.load.image('background3', 'assets/backgroundMenu3.png');
    this.load.image('playButton', 'assets/play.png');
    this.load.image('settingsButton', 'assets/settings.png');
    this.load.image('logo', 'assets/tbate.webp');
  }

  create() {
    this.background2 = this.add.tileSprite(0, 0, widthGame, heightGame, 'background2').setOrigin(0, 0);
    this.background1 = this.add.tileSprite(0, 0, widthGame, heightGame, 'background1').setOrigin(0, 0);
    this.add.image(widthGame / 2, heightGame / 2, 'background3')

    this.add.image(widthGame / 2, heightGame / 3.5, 'logo').setScale(0.45);

    const playButton = this.add.image(widthGame / 2, heightGame / 1.9, 'playButton').setInteractive();

    playButton.setScale(0.75);

    playButton.setOrigin(0.5);
    playButton.setInteractive();
    playButton.on('pointerdown', () => {
      this.tweens.add({
        targets: this.cameras.main,
        alpha: 0,
        duration: 225,
        onComplete: () => {
          this.scene.start('GameScene');
        }
      });
    });

    playButton.on('pointerover', () => {
      this.tweens.add({
        targets: playButton,
        scale: 0.765,
        duration: 250,
        ease: 'Power2'
      });
      playButton.setTint(0xC0C0C0);
    });

    playButton.on('pointerout', () => {
      this.tweens.add({
        targets: playButton,
        scale: 0.75,
        duration: 250,
        ease: 'Power2'
      });
      playButton.clearTint();
    });

    const settingsButton = this.add.image(widthGame / 2, heightGame / 1.64, 'settingsButton').setInteractive();

    settingsButton.setScale(0.75);

    settingsButton.setOrigin(0.5);
    settingsButton.setInteractive();
    settingsButton.on('pointerdown', () => {
      alert('soon');
    });

    settingsButton.on('pointerover', () => {
      this.tweens.add({
        targets: settingsButton,
        scale: 0.765,
        duration: 250,
        ease: 'Power2'
      });
      settingsButton.setTint(0xC0C0C0);
    });

    settingsButton.on('pointerout', () => {
      this.tweens.add({
        targets: settingsButton,
        scale: 0.75,
        duration: 250,
        ease: 'Power2'
      });
      settingsButton.clearTint();
    });
  }

  update() {
    this.background1.tilePositionX += 0.35;
    this.background2.tilePositionX += 0.2;
  }
}
