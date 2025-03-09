class OverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OverScene' }); // Scene key
  }
  
  preload() {
    // Load images
    this.load.image('background1', 'assets/backgroundIG.png');
    this.load.image('background2', 'assets/backgroundMenu2.png');
    this.load.image('playButton', 'assets/play.png');
    this.load.image('settingsButton', 'assets/settings.png');
    this.load.image('playAgainButton', 'assets/playAgain.png');
    this.load.image('backMenuButton', 'assets/backMenu.png');
    this.load.image('over', 'assets/overUI.png');
  }
  
  create() {
    // Add background and overlay
    this.background2 = this.add.tileSprite(0, 0, widthGame, heightGame, 'background2').setOrigin(0, 0);
    this.add.image(widthGame / 2, heightGame / 2, 'backgroundIG');
    const blackFilter = this.add.graphics();
    blackFilter.fillStyle(0x000000, 0.65);
    blackFilter.fillRect(0, 0, widthGame, heightGame);
    this.add.image(widthGame / 2, heightGame / 2, 'over');
    
    // Add buttons
    const buttons = [
      this.add.image(widthGame / 2, 530, 'playAgainButton').setInteractive(),
      this.add.image(widthGame / 2, 640, 'backMenuButton').setInteractive(),
    ];
    
    // Button actions
    buttons[0].on('pointerup', () => {
      this.scene.start('GameScene');
      this.scene.stop();
    });
    buttons[1].on('pointerup', () => {
      this.scene.start('MenuScene');
    });
    
    // Button hover effects
    buttons.forEach(button => {
      button.on('pointerover', () => {
        this.tweens.add({
          targets: button,
          scale: 1.015,
          duration: 250,
          ease: 'Power2'
        });
        button.setTint(0xC0C0C0);
      });
      button.on('pointerout', () => {
        this.tweens.add({
          targets: button,
          scale: 1,
          duration: 250,
          ease: 'Power2'
        });
        button.clearTint();
      });
    });
  }
  
  update() {
    // Move background
    this.background2.tilePositionX += 0.2;
  }
}
