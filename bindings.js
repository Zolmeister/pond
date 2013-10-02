// last

var keymap = {
  38: 'up',
  39: 'right',
  40: 'down',
  37: 'left',
  87: 'up',
  68: 'right',
  83: 'down',
  65: 'left'
}

var userInput = []
var mouseDown = false

window.onresize = function() {
  ctx = $canv.getContext('2d')
  $canv.width = $('#canv').width()
  $canv.height = $('#canv').height()
}

$canv.onmousedown = function(e){
  GAME.player.updateInput([e.clientX - $canv.width/2, e.clientY - $canv.height/2], true)
  mouseDown = true
}

$canv.onmouseup = function(e) {
  GAME.player.updateInput([], true)
  mouseDown = false
}

$canv.onmousemove = function(e) {
  if(mouseDown) {
    GAME.player.updateInput([e.clientX - $canv.width/2, e.clientY - $canv.height/2], true)
  }
}

window.onkeydown = function(e){

  var k = keymap[e.which]
  if (!k) return

  // remove from input list if it was there already
  if(userInput.indexOf(k)!=-1) {
    userInput.splice(userInput.indexOf(k), 1)
  }

  // add to front of input list
  userInput.unshift(k)

  GAME.player.updateInput(userInput, false)
}

window.onkeyup = function(e) {
  var k = keymap[e.which]
  if (!k) return

  // remove from input list if it was there already
  if(userInput.indexOf(k)!=-1) {
    userInput.splice(userInput.indexOf(k), 1)
  }

  GAME.player.updateInput(userInput, false)
}
