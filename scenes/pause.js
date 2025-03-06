class PauseScene extends Phaser.Scene {
    constructor() {
      super({ key: 'PauseScene' }); // Define a chave da cena como 'PauseScene'
    }
  
    preload() {
      this.load.image('background1', 'assets/backgroundIG.png');
      this.load.image('background2', 'assets/backgroundMenu2.png');
      this.load.image('playButton', 'assets/play.png');
      this.load.image('settingsButton', 'assets/settings.png');
      this.load.image('resumeButton', 'assets/resumeButton.png');
      this.load.image('statisticsButton', 'assets/statisticsButton.png');
      this.load.image('restartButton', 'assets/restartButton.png');
      this.load.image('forfeitButton', 'assets/forfeitButton.png');

      this.load.image('pause', 'assets/pauseUI.png');
    }
  
    create() {

    this.background2 = this.add.tileSprite(0, 0, widthGame, heightGame, 'background2').setOrigin(0, 0);
    this.add.image(widthGame / 2, heightGame / 2, 'backgroundIG')
    const blackFilter = this.add.graphics();
    blackFilter.fillStyle(0x000000, 0.65);
    blackFilter.fillRect(0, 0, widthGame, heightGame);

    this.add.image(widthGame / 2, heightGame / 2, 'pause')

    const forfeitButton = this.add.image(widthGame / 2, 725, 'forfeitButton').setInteractive()

    const buttons = [
        this.add.image(widthGame / 2, 335, 'resumeButton').setInteractive(),
        this.add.image(widthGame / 2, 465, 'statisticsButton').setInteractive(),
        this.add.image(widthGame / 2, 595, 'restartButton').setInteractive(),
    ];

    buttons[0].on('pointerup', () => {
        this.scene.resume('GameScene');
        this.scene.stop();
    });

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

    forfeitButton.on('pointerover', () => {
        this.tweens.add({
          targets: forfeitButton,
          scale: 1.015,
          duration: 250,
          ease: 'Power2'
        });
        forfeitButton.setTint(0xFF7777);
      });
  
      forfeitButton.on('pointerout', () => {
        this.tweens.add({
          targets: forfeitButton,
          scale: 1,
          duration: 250,
          ease: 'Power2'
        });
        forfeitButton.clearTint();
      });

    }

    
  
    update() {
      this.background2.tilePositionX += 0.2;
    }
  }
  