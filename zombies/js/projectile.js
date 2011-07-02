/*************************************************************************
  Projectile
*************************************************************************/
function Projectile(x,y,velocity,direction,damage,size) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
  //this.direction = direction+Math.random()*0.5-0.25;
  this.direction = direction
  this.damage = damage;
  this.size = size;
 // this.color = "rgba("+Math.floor(Math.random()*100+155)+","+Math.floor(Math.random()*200)+",25,0.2)";
 
  this.color = "rgba(75,75,75,0.8)";
}

Projectile.prototype.draw = function(context) {
  context.save();
    context.fillStyle = this.color;
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
 // this.size += 0.02;
}