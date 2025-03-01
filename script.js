const widthGame = 620
const heightGame = 360

// configurações iniciais do phaser como resolução, gravidade, cenas, etc
const config = {
  type: Phaser.AUTO,
  width: 620,
  height: 360,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 850 }, // isso aqui define a gravidade no eixo y
      debug: false // isso aqui mostra a caixinha de colisão dos objetos
    }
  },
  // isso adiciona as cenas que serão usadas
  scene: [MenuScene, GameScene],
};

// cria a instância do jogo
const game = new Phaser.Game(config);