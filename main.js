var $canv = $('#canv')[0]
$canv.width = window.innerWidth
$canv.height = window.innerHeight

var ctx = $canv.getContext('2d')
ctx.lineJoin = 'round'
var debug =  false //true
// color pallet // blue        l blue        l green         orange         d orange
var pallet = [[105,210,231], [167,219,216], [224,228,204], [243,134,48], [250,105,0]]
var lastColor = new Color()
var GAME = {}

function init() {
  GAME.player = new Fish(false)
  GAME.fishes = [GAME.player]
  GAME.spawner = new Spawner($canv.width, $canv.height, GAME.player, GAME.fishes)
  GAME.levelParticles = []
  GAME.levelBar = new LevelBar($canv.width)
  GAME.levelBalls = new LevelBalls($canv.width, $canv.height)
  GAME.levelBallParticles = []
  GAME.endGameParticles = []
}

function draw(t) {
  requestAnimFrame(draw)

  var player = GAME.player
  var fishes = GAME.fishes
  var spawner = GAME.spawner
  var levelParticles = GAME.levelParticles
  var levelBar = GAME.levelBar
  var levelBalls = GAME.levelBalls
  var levelBallParticles = GAME.levelBallParticles
  var endGameParticles = GAME.endGameParticles


  // physics
  for(var i=0; i<fishes.length; i++) {
    fishes[i].physics()

    // if far enough away from player, remove

    if(distance(fishes[i], player) > Math.max($canv.width, $canv.height) * 2) {
      fishes[i].dead = true
    }
  }

  // enemy spawner
  spawner.update()

  // player score
  if(player.colors.length > 5 && player.colors.every(function(col){return col.loaded >= 1})) {

    // steal colors from player
    player.drawColors()
    var newParticles = player.toParticles(levelBar)

    // staticly position
    for(var i=0;i<newParticles.length;i++) {
      newParticles[i].x += -player.x + $canv.width/2
      newParticles[i].y += -player.y + $canv.height/2
    }

    GAME.levelParticles = levelParticles.concat(newParticles)
    var colors = player.colors.splice(1, player.colors.length)

  }

  // collision
  for(var i=0; i<fishes.length; i++) {
    var fish = fishes[i]
    for(var j=i+1; j<fishes.length; j++) {
      var fish2 = fishes[j]
      if(fish.collide(fish2)) {
        if(fish.size >= fish2.size){
          fish2.killedBy(fish)
        } else {
          fish.killedBy(fish2)
        }
      }
    }
  }

  // cleanup dead fish
  for(var i=fishes.length-1;i>=0;i--) {
    if(fishes[i].dead) {
      fishes.splice(i, 1)
    }
  }

  ctx.save()
  ctx.translate(-player.x + $canv.width/2, -player.y + $canv.height/2)
  ctx.fillStyle = '#111'
  ctx.fillRect(player.x - $canv.width/2, player.y - $canv.height/2, $canv.width, $canv.height)

  // draw
  for(var i=0; i<fishes.length; i++) {
    fishes[i].draw(ctx)
  }

  // enemy spawner debug
  if(debug) spawner.debug()

  // draw level particles (static position)
  ctx.translate(player.x - $canv.width/2, player.y - $canv.height/2)
  var nextStage = levelBar.physics()
  if(nextStage) {
    GAME.levelBallParticles = levelBallParticles.concat(levelBar.toParticles(levelBalls))
    levelBalls.nextColors = levelBar.colors.slice(0, 2)

    // reset levelBar
    GAME.levelBar = new LevelBar($canv.width)
  }

  levelBar.draw(ctx)
  for(var i=levelParticles.length-1; i>=0; i--) {
    var dist = levelParticles[i].physics()
    levelParticles[i].draw(ctx)
    if (dist < 10) {
      levelParticles.splice(i, 1)
      if(!levelBar.updating) {
        levelBar.updating = true
        levelBar.addColor()
      }
      if(levelParticles.length === 0) {
        levelBar.updating = false
      }
    }
  }

  nextStage = levelBalls.physics()
  if(nextStage) {
    GAME.endGameParticles = levelBalls.toParticles(player)

    // un-static position
    for(var i=0;i<GAME.endGameParticles.length;i++) {
      GAME.endGameParticles[i].x += player.x - $canv.width/2
      GAME.endGameParticles[i].y += player.y - $canv.height/2
    }

    GAME.levelBalls = new LevelBalls($canv.width, $canv.height)
  }
  levelBalls.draw(ctx)
  for(var i=levelBallParticles.length-1;i>=0;i--){
    var dist = levelBallParticles[i].physics()
    levelBallParticles[i].draw(ctx)
    if (dist < 10) {
      levelBallParticles.splice(i, 1)
      if(!levelBalls.updating) {
        levelBalls.updating = true
        levelBalls.addBall()
      }
      if(levelBallParticles.length === 0) {
        levelBalls.updating = false
        levelBalls.shift()
      }
    }
  }
  ctx.translate(-player.x + $canv.width/2, -player.y + $canv.height/2)
  for(var i=0;i<endGameParticles.length;i++) {
    endGameParticles[i].physics()
    endGameParticles[i].draw(ctx)
  }

  ctx.restore()
}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    function( callback ){
    window.setTimeout(callback, 1000 / 60);
  };
})();

init()
requestAnimFrame(draw)


// level debug
//levelBalls.addBall()
var levelBar = GAME.levelBar
var levelBalls = GAME.levelBalls
function levelUp(){
  for(var i=0;i<9;i++)
    levelBar.addColor()

  levelBar.colors.forEach(function(col){
  col.loaded = 1
  })
  levelBar.x = levelBar.targetX
  levelBar.addColor()
}
function levelUp2(){
  for(var i=0;i<9;i++){
    levelBalls.addBall()
    levelBalls.shift()
  }
  levelBalls.balls.forEach(function(b){b.size = b.targetSize})
  levelBalls.addBall()
}
//setTimeout(levelUp, 100)
//setTimeout(levelUp2, 100)
