/*************************************************************************
  Projectile
*************************************************************************/
function Projectile(x,y,velocity,direction,damage,size) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
  this.direction = direction;
  this.damage = damage;
  this.size = size;
}

Projectile.prototype.draw = function(context) {
  context.save();
    context.fillStyle = "rgba(0,0,0,0.8)";
    context.beginPath();
      context.arc(this.x, this.y, this.size, 0, Math.PI*2, true); //*2
    context.fill();
  context.restore();
}

Projectile.prototype.update = function(delta_time) {
  var step = (delta_time / MS_IN_SEC);
  var tmpX = step * this.velocity * Math.cos(this.direction);
  var tmpY = step * this.velocity * Math.sin(this.direction);
  
  this.x += tmpX;
  this.y += tmpY;
}