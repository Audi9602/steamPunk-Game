//ESVersion:6
/**@type {HTMLCanvasElement} */

window.addEventListener('DOMContentLoaded', function () {
    //canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 500;

    // OOPs-encapsulation
    class InputHandler {
        constructor(game) {
            this.game = game;
            window.addEventListener('keydown', e => {
                if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') &&
                    this.game.keys.indexOf(e.key) === -1) {
                    this.game.keys.push(e.key);
                } else if (e.key === ' ') {
                    this.game.player.shootTop();
                } else if (e.key === 'd') { //toggle prop for debug
                    this.game.debug = !this.game.debug;
                }
            });

            window.addEventListener('keyup', e => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 36.25;
            this.height = 20;
            this.speed = Math.random() * 0.2 + 2.8;
            this.markedForDeletion = false;
            this.image = document.getElementById('fireball');
            if (this.game.debug) this.image = document.getElementById('projectile');
            this.frameX = 0;
            this.maxFrame = 3;
            this.fps = 20;
            
            this.timer = 0;
            this.interval = 1000 / this.fps;
          }
          update(deltaTime) {
            this.x += this.speed;
            if (this.timer > this.interval) {
              if (this.frameX < this.maxFrame) this.frameX++;
              else this.frameX = 0;
                this.timer = 0;
            } else {
              this.timer += deltaTime;
            }
      
            if (this.x > this.game.width * 0.8) {
              this.markedForDeletion = true;
            }
          }
          draw(context) {
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
          }
        /*
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 5;
            this.markedForDeletion = false;
            this.image = document.getElementById('projectile');
        }
        update() {
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
        }
            */
    }

    class Particle {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
            this.frameX = Math.floor(Math.random() * 3);
            this.frameY = Math.floor(Math.random() * 3);
            this.spriteSize = 50;
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
            this.size = this.spriteSize * this.sizeModifier;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * -15;
            this.gravity = 0.5;
            this.markedForDeletion = false;
            this.angle = 0;
            this.va = Math.random() * 0.2 - 0.1;
            this.bounced = 0;
            this.bottomBounceBoundary = Math.random() * 80 + 60;
        }
        update() {
            this.angle += this.va;
            this.speedY += this.gravity;
            this.x -= this.speedX - this.game.speed;
            this.y += this.speedY;
            if (this.y > this.game.height + this.size || this.x < 0 - this.size) this.markedForDeletion = true;
            if (this.y > this.game.height - this.bottomBounceBoundary && this.bounced < 2) {
                this.bounced++;
                this.speedY *= -0.5;
            }
        }
        draw(context) {
            context.save();
            context.translate(this.x, this.y);
            context.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize, this.spriteSize, this.spriteSize, this.size * -0.5, this.size * -0.5, this.size, this.size);
            context.restore();
        }
    }

    class Shield {
        constructor(game) {
            this.game = game;
            this.width = this.game.player.width;
            this.height = this.game.player.height;
            this.frameX = 0;
            this.maxFrame = 24;
            this.fps = 30;
      
            this.image = document.getElementById('shield');
      
            this.timer = 0;
            this.interval = 1000 / this.fps;
          }
          update(deltaTime) {
            if (this.frameX <= this.maxFrame) {
              if (this.timer > this.interval) {
                this.frameX++;
                this.timer = 0;
              } else {
                this.timer += deltaTime;
              }
            }
          }
          draw(context) {
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.game.player.x, this.game.player.y, this.width, this.height);
          }
          play() {
            this.frameX = 0;
            this.game.sound.play(this.game.sound.shieldSound);
          }
    }

    class Player {
        constructor(game) {
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
            this.speedY = 0;
            this.maxSpeed = 3;
            this.projectiles = [];
            this.image = document.getElementById('player');
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;
        }

        update(deltaTime) {
            if (this.game.keys.includes('ArrowUp')) {
                this.speedY = -this.maxSpeed;
            } else if (this.game.keys.includes('ArrowDown')) {
                this.speedY = this.maxSpeed;
            } else {
                this.speedY = 0;
            }
            this.y += this.speedY;

            if (this.y > this.game.height - this.height * 0.5) this.y = this.game.height - this.height * 0.5;
            else if (this.y < -this.height * 0.5) this.y = -this.height * 0.5;

            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);

            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = 0;
            }

            if (this.powerUp) {
                if (this.powerUpTimer > this.powerUpLimit) {
                    this.powerUpTimer = 0;
                    this.powerUp = false;
                    this.frameY = 0;
                } else {
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1;
                    this.game.amo += 0.1;
                }
            }
        }
        draw(context) {
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        shootTop() {
            if (this.game.amo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
                this.game.amo--;
            }
            if (this.powerUp) this.shootBottom();
        }
        shootBottom() {
            if (this.game.amo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175));
            }
        }
        enterPowerUp() {
            this.powerUpTimer = 0;
            this.powerUp = true;
            if (this.game.amo < this.game.maxAmo) this.game.amo = this.game.maxAmo;
        }
    }


    class Enemy {
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
        }
        update(){
            this.x += this.speedX - this.game.speed;
            if (this.x + this.width < 0) this.markedForDeletion = true;
            //sprite animation
            if (this.frameX < this.maxFrame){
                this.frameX++;
            } else this.frameX = 0;
        }
        draw(context){
            //context.fillStyle = 'red';
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width,this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
            if (this.game.debug){
                context.font = '20 px Uncial Antiqua';
                context.fillText(this.lives, this.x, this.y);
            }

        }
    }

    class Angler1 extends Enemy {
        constructor(game){
            super(game);
            this.width = 228;   
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random() * 3);
            this.lives = 5;
            this.score = this.lives;
        }
    }

    class Angler2 extends Enemy {
        constructor(game){
            super(game);
            this.width = 213;   
            this.height = 165;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('angler2');
            this.frameY = Math.floor(Math.random() * 3);
            this.lives = 6;
            this.score = this.lives;
        }
    }

    class BulbWhale extends Enemy {
        constructor(game){
            super(game);
            this.width = 270;
            this.height = 219;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('bulbwhale');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 20;
            this.score = this.lives;
            this.speedX = Math.random() * -1.2 - 0.2;
        }
    }

    class Drone extends Enemy {
        constructor(game, x, y){
            super(game);
            this.width = 115;   
            this.height = 95;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('drone');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;
            this.score = this.lives;
            this.type = 'drone';
            this.speedX = Math.random() * -4.2 - 0.5;
        }
    }

    class HiveWhale extends Enemy {
        constructor(game){
            super(game);
            this.width = 400;   
            this.height = 227;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('hivewhale');
            this.frameY = 0;
            this.lives = 20;
            this.score = this.lives;
            this.type = 'hive';
            this.speedX = Math.random() * -1.2 - 0.2;
        }
    }

    class LuckyFish extends Enemy {
        constructor(game){
            super(game);
            this.width = 99;   
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('lucky');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 5;
            this.score = 15;
            this.type = 'lucky';
        }
    }

    class MoonFish extends Enemy {
        constructor(game) {
            super(game);
            this.width = 227;
            this.height = 240;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('moonfish');
            this.frameY = 0;
            this.lives = 10;
            this.score = this.lives;
            this.speedX = Math.random() * -1.2 - 2;
            this.type = 'moon';
          }
    }

    class Razorfin extends Enemy {
        constructor(game) {
            super(game);
            this.width = 187;
            this.height = 149;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('razorfin');
            this.frameY = 0;
            this.lives = 7;
            this.score = this.lives;
            this.speedX = Math.random() * -1 - 1;
          }
    }

    class Stalker extends Enemy {
        constructor(game) {
            super(game);
            this.width = 243;
            this.height = 123;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('stalker');
            this.frameY = 0;
            this.lives = 5;
            this.score = this.lives;
            this.speedX = Math.random() * -1 - 1;
          }
    }

    class Layer {
        constructor(game, image, speedModifier){
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        update(){
            if (this.x <= -this.width) this.x = 0;
            else this.x -= this.game.speed * this.speedModifier;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }

    class Background {
        constructor(game){
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');

            this.layer1 = new Layer(this.game, this.image1, 0.2);
            this.layer2 = new Layer(this.game, this.image2, 0.4);
            this.layer3 = new Layer(this.game, this.image3, 1);
            this.layer4 = new Layer(this.game, this.image4, 1.5);

            this.layers = [this.layer1, this.layer2, this.layer3];
        }
        update(){
            this.layers.forEach(layer => layer.update());
        }
        draw(context){
            this.layers.forEach(layer => layer.draw(context));
        }
    }

    class Explosion {
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.frameX = 0;
            this.spriteWidth = 200;
            this.spriteHeight = 200;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            //offset position
            this.x = x - this.width * 0.5;
            this.y = y - this.height * 0.5;
            this.fps = 30;
            this.timer = 0;
            this.interval = 1000/this.fps;
            this.markedForDeletion = false;
            this.maxFrame = 8;
        }
        update(deltaTime){
            this.x -= this.game.speed;
            if (this.timer > this.interval){
                this.frameX++;
                this.timer = 0;
            } else {
                this.timer += deltaTime;
            }
                   
            if (this.frameX > this.maxFrame) this.markedForDeletion = true;
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.width, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height, );
        }
    }

    class SmokeExplosion extends Explosion {
        constructor(game, x, y){
            super(game, x, y);
            this.image = document.getElementById('smokeExplosion');
        }
    }

    class FireExplosion extends Explosion {
        constructor(game, x, y){
            super(game, x, y);
            this.image = document.getElementById('fireExplosion');
        }
    }

    class UI {
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Uncial Antiqua';
            this.color = 'white';
        }
        draw(context){
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px ' + this.fontFamily;
            //score
            context.fillText('Score: ' + this.game.score, 20, 40);

            //timer
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Timer: ' + formattedTime, 20, 100);

            //game over messages
            if (this.game.gameOver){
                context.textAlign = 'center';
                let message1;
                let message2;
                if (this.game.score > this.game.winningScore){
                    message1 = 'Most Wondrous!';
                    message2 = 'Well Done. Big bug';
                } else {
                    message1 = 'Blazes!';
                    message2 = 'No worries. Game is afoot';
                }
                context.font = '73px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 30);
                context.font = '35px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 30);
            }

            //ammo
            if (this.game.player.powerUp) context.fillStyle = '#FCDE70';
            //context.fillStyle = this.color;
            for (let i = 0; i < this.game.amo; i++){
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
            context.restore();
        }
    }

    class SoundController {
        constructor() {
            // initialize sound effects from index.html
          this.powerUpSound = document.getElementById('powerup');
          this.powerDownSound = document.getElementById('powerdown');
          this.explosionSound = document.getElementById('explosion');
          this.shotSound = document.getElementById('shot');
          this.hitSound = document.getElementById('hit');
          this.shieldSound = document.getElementById('shieldSound');
        }
        play(soundKey) {
          soundKey.currentTime = 0;
          soundKey.play();
        }
    }

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.sound = new SoundController();
            this.keys = [];
            this.shield = new Shield(this);
            this.amo = 20;
            this.maxAmo = 50;
            this.amoTimer = 0;
            this.amoInterval = 350;
            this.particles = [];
            this.explosions = [];
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 2000;
            this.gameTime = 0;
            this.timeLimit = 45000; //45secs
            this.speed = 1;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 160;
            this.debug = false;
        }
        update(deltaTime) {
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.timeLimit) this.gameOver = true; 
            this.background.update();
            this.background.layer4.update();
            this.player.update(deltaTime);
            if (this.amoTimer > this.amoInterval){
                if (this.amo < this.maxAmo) this.amo++;
                this.amoTimer = 0;
            } else {
                this.amoTimer += deltaTime;
            }

            //handle shield
            this.shield.update(deltaTime);

            //handle particles
            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle => !particle.markedForDeletion);

            //handle explosions
            this.explosions.forEach(explosion => explosion.update(deltaTime));
            this.explosions = this.explosions.filter(explosion => !explosion.markedForDeletion);

            //handle enemy collision
            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollision(this.player, enemy)){
                    this.addExplosion(enemy);
                    this.sound.play(this.sound.hitSound);
                    this.shield.play();
                    enemy.markedForDeletion = true;
                    
                    for (let i = 0; i < enemy.score; i++){
                        this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));//st the enemies come from middle of the enemies not the topmost corners
                    }
                    if (enemy.type === 'lucky') this.player.enterPowerUp();//trigger for powerup
                    else if(!this.gameOver) this.score--;
                }

                //handle particle collision
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)){
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                        if (enemy.lives <= 0){
                            for (let i = 0; i < enemy.score; i++){
                                this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));//st the enemies come from middle of the enemies not the topmost corners
                            }
                            enemy.markedForDeletion = true;
                            this.addExplosion(enemy);
                            this.sound.play(this.sound.explosionSound);
                            if (enemy.type === 'moon') {
                                this.player.enterPowerUp();
                              }
                            if (enemy.type === 'hive'){
                                for (let i = 0; i < 5; i++){
                                    this.enemies.push(new Drone(this, enemy.x + Math.random() * enemy.width, enemy.y + Math.random () * enemy.height * 0.5));
                                }
                            }
                 
                            if (!this.gameOver) this.score += enemy.score;
                            //if (this.score > this.winningScore) this.gameOver = true;
                        }
                    }
                    });
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        }
        draw(context) {
            this.background.draw(context);
            this.ui.draw(context);
            this.player.draw(context);
            this.shield.draw(context);
            this.particles.forEach(particle => particle.draw(context));
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.explosions.forEach(explosion => explosion.draw(context));
            this.background.layer4.draw(context);
        }

        addEnemy() {
            const randomize = Math.random();
            if (randomize < 0.1) {
              this.enemies.push(new Angler1(this));
            } else if (randomize < 0.3) {
              this.enemies.push(new Stalker(this));
            } else if (randomize < 0.5) {
              this.enemies.push(new Razorfin(this));
            } else if (randomize < 0.6) {
              this.enemies.push(new Angler2(this));
            } else if (randomize < 0.7) {
              this.enemies.push(new HiveWhale(this));
            } else if (randomize < 0.8) {
                this.enemies.push(new BulbWhale(this));
            } else if (randomize < 0.9) {
                this.enemies.push(new MoonFish(this));
            } else {
              this.enemies.push(new LuckyFish(this));
            }
          }

        /*addEnemy(){
            const randomize = Math.random();
            if (randomize < 0.3) this.enemies.push(new Angler1(this));
            else if (randomize < 0.6) this.enemies.push(new LuckyFish(this));
            else if (randomize < 0.7) this.enemies.push(new HiveWhale(this));
            else this.enemies.push(new Angler2(this));
           // console.log(this.enemies);
        }*/
        addExplosion(enemy){
           const randomize = Math.random();
           if (randomize < 0.5) {
            this.explosions.push(new SmokeExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
           //console.log(this.explosions);
        } else {
            this.explosions.push(new FireExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
        }
    }
        checkCollision(rect1, rect2){
            return (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.height + rect1.y > rect2.y)
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    //animation loop
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.draw(ctx);
        game.update(deltaTime);
        requestAnimationFrame(animate);
    }
    animate(0);
});