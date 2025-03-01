class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' }); // Define a chave da cena como 'menuScene'
  }

  preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('playButton', 'assets/playButton.png');
    this.load.image('settingsButton', 'assets/settingsButton.png');
    this.load.image('logo', 'assets/logo.png');
  }
  create() {
    this.add.image(widthGame / 2, heightGame / 2, 'background');

    this.add.image(widthGame / 2, heightGame / 3, 'logo').setScale(0.7);

    const playButton = this.add.image(widthGame / 2, heightGame / 2, 'playButton').setInteractive();

    playButton.setScale(0.2);
    playButton.setOrigin(0.5);
    playButton.setInteractive();
    playButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
    
    const settingsButton = this.add.image(widthGame / 2, heightGame / 1.725, 'settingsButton').setInteractive();

    settingsButton.setScale(0.2);
    settingsButton.setOrigin(0.5);
    settingsButton.setInteractive();
    settingsButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
