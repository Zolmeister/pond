var muted = false
popSound = document.createElement('audio')
popSound.src='drop1.ogg'
popSound.volume = 0.8
bgRainSound = document.createElement('audio')
bgRainSound.src='bg1.ogg'
bgRainSound.loop = true
bgRainSound.play()
if(localStorage.muted === 'true') toggleMute()
$('.sound').bind('click', toggleMute)
function toggleMute(){
  if(!muted) {
    popSound.volume = 0
    bgRainSound.volume = 0
    muted = true
    $('.sound').html('&#9834;')
    localStorage.muted = 'true'
  } else {
    popSound.volume = 0.8
    bgRainSound.volume = 1
    muted = false
    $('.sound').html('&#9835;')
    localStorage.muted = 'false'
  }
}

function playPop() {
  popSound.play()
}
