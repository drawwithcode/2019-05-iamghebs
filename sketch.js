// I still got problems with the mic in Google Chrome so I manage to fix volume sensibility from Microsoft Edge
//In case of problems adjust sensibilty value
//I can't access repository's settings to publish it on GitHub Pages. Sorry

//variables for managing mic's volume
var mic;
var volume;
var sensibility = 0.25; //adjust in case of bugs

//variables for setting sprites
var bird;
var obstacles = [];
var pipesCleared;

//variable to manage game dynamics
var startGame = false;
var gameover = false;
var instrs;


function preload() {
  avatar = loadImage('assets/Chiara.png');
  //dead = loadImage('assets/ChiaraDead.png');
  kebab = loadImage('assets/kebab.png');
  adlib = loadFont('assets/adlib.ttf');
}

function setup() {
  var canvas = createCanvas(windowWidth, windowHeight);

  //set microphone input
  mic = new p5.AudioIn();
  mic.start();

  //creating the avatar
  bird = new Bird();

  //initializing pipes
  pipesCleared = 0;
  obstacles.push(new Obstacle());

  //instructions
  instrs = createDiv("Chiara è a dieta, non deve avvicinarsi ai kebab. <br> Fai rumore per tenerla lontano");
  instrs.style("user-select: none; position: absolute; top: 5%; left: 37%; color: black; text-align: center; font-family: adlib; font-size: 2vh");
}

function draw() {
  clear();
  background(89, 219, 129);
  textSize(20);
  fill("black");
  textFont("adlib");
  text('Kebab schivati: ' + pipesCleared, width * 0.44, height * 0.15);

  //getting mic volume and printing it in the console for tracking
  volume = mic.getLevel();
  print(volume);

  //updating bird's position
  bird.show(avatar);
  bird.update();

  if (volume > sensibility) {
    //if user makes loud noise bird goes up
    bird.goUp();
  }

  if (frameCount % 100 == 0) {
    //creating kebabs at even distance
    obstacles.push(new Obstacle());
  }

  for (var i = obstacles.length - 1; i >= 0; i--) {
    //show kebabs and update their position
    obstacles[i].show();
    obstacles[i].update();

    //if bird hits a kebab the game is over
    if (obstacles[i].hits(bird)) {
      gameover = true;
    }

    //when a kebab is entirely out of the screen it gets deleted from the array
    if (obstacles[i].offscreen()) {
      obstacles.splice(i, 1);
      pipesCleared++;
    }
  }

  if (gameover == true) {
    push();
    noStroke();
    fill(255, 0, 0);
    textAlign(CENTER);
    textSize(60);
    textFont(adlib);
    text("Game Over", windowWidth / 2, windowHeight / 2);
    //bird.show(dead);
    pop();
    noLoop();
  }
}

function Bird() {
  //initalizing avatar
  this.y = height / 2;
  this.x = 100;
  this.size = 32;
  this.gravity = 0.6;
  this.lift = -2;
  this.velocity = 0;

  this.show = function(_img) {
    image(_img, this.x, this.y, this.size, this.size);
  }

  this.goUp = function() {
    //add a lift to bird's velocity
    this.velocity += this.lift //*volume;
    print(this.velocity);
  }

  this.update = function() {
    this.velocity += this.gravity;
    this.velocity *= 0.9;
    this.y += this.velocity;

    //if the bird leaves the screen the game is over
    if (this.y > height) {
      this.y = height;
      this.velocity = 0;
      gameover = true;
    }

    //if the bird leaves the screen the game is over
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
      gameover = true;
    }
  }
}

function Obstacle() {
  //every kebab is generated outside the screen
  this.x = width;

  //even width of the kebabs
  this.w = 100;

  //they're at least generated at 200 px
  this.topMin = 200;
  this.botMin = height - 200;
  this.gapStart = random(this.topMin, this.botMin);

  //a gap to let the bird pass through is left
  this.gapLength = 250;

  //speed to mock the pan
  this.speed = 3;

  this.show = function() {
    //generating twins kebabs
    image(kebab, this.x, 0, this.w, this.gapStart);
    image(kebab, this.x, this.gapStart + this.gapLength, this.w, height);
  }
  this.update = function() {
    //position is updated to left
    this.x -= this.speed;
  }

  this.offscreen = function() {
    //the kebab is entirely out of the screen
    return this.x < -this.w;
  }

  //bird and kebabs collide with a safezone of 20px
  this.hits = function(bird) {
    if (bird.y < this.gapStart - 20 || bird.y > this.gapStart + this.gapLength + 20) {
      if (bird.x > this.x && bird.x < this.x + this.w) {
        return true;
      }
    }
    return false;
  }
}
