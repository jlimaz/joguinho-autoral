const widthGame = 1920
const heightGame = 1080

// configurações iniciais do phaser como resolução, gravidade, cenas, etc
const config = {
  type: Phaser.AUTO,
  width: widthGame,
  height: heightGame,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 }, // isso aqui define a gravidade no eixo y
      debug: true // isso aqui mostra a caixinha de colisão dos objetos
    }
  },
  // isso adiciona as cenas que serão usadas
  scene: [MenuScene, GameScene, PauseScene, OverScene],
};

// cria a instância do jogo
const game = new Phaser.Game(config);