function choice(arr) {
  return arr[Math.floor(Math.random()*arr.length)]
}

function randColor(prevColor) {
  prevColor = prevColor || lastColor

  do {
    var color = choice(pallet)
    var col = new Color(color[0], color[1], color[2])
  } while (lastColor.equals(col))
  lastColor = col

  return col

  var r = 0
  var g = 86
  var b = 255
  var offset = 100
  var value = (r + g + b) / 3
  var newVal = value + 2*Math.random()*offset-offset
  var ratio = newVal / value

  return rgbToHex(r * ratio, g * ratio, b * ratio)
}

function shadeColor(col, percent) {
  var shade = Math.round(2.55 * percent)
  return new Color(col.r + shade, col.g + shade, col.b + shade)
}

function directionTowards(a, b) {
  return Math.atan2( a.y-b.y, a.x-b.x)
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y - b.y, 2))
}

function collideBox(a, b) {
  var y1 = a.y
  var h1 = a.height
  var y2 = b.y
  var h2 = b.height
  var x1 = a.x
  var x2 = b.x
  var w1 = a.width
  var w2 = b.width
  if (y1 + h1 < y2
     || y1 > y2 + h2
     || x1 + w1 < x2
     || x1 > x2 + w2) return false
  return true
}

function rot(x, y, dir) {
  /*var rotationMatrix = [
    [Math.cos(dir), -Math.sin(dir)],
    [Math.sin(dir), Math.cos(dir)]
  ]*/
  return [Math.cos(dir)*x - Math.sin(dir)*y, Math.sin(dir)*x + Math.cos(dir)*y]
}

function sign(n){
  if(n<0) return -1
  return 1
}
