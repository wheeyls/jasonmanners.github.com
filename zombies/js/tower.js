/*************************************************************************
  Tower
**************************************************************************/
function Tower(x,y,gridSpace) {
  this.x = x;
  this.y = y;
  this.direction = 0;
  this.cooldown = 0;
  this.width = gridSpace;
  this.height = gridSpace;
  
  this.midX = this.x + (this.width / 2);
  this.midY = this.y + (this.height / 2);
  
  this.survivor = undefined;
  this.selected = false;
  
  this.color = "rgba(0,100,255,0.6)";
}

Tower.prototype = {
  cost : 10
}

Tower.prototype.draw = function(context) {

  //Tower and range
  context.save();
    context.fillStyle = this.color;
    context.fillRect (this.x+0.5, this.y+0.5, this.width - 0.5, this.height - 0.5);
    if(this.selected) {
      context.fillStyle = "rgba(0,0,0,0.5)";
      context.beginPath();
        context.rect (this.x, this.y, this.width, this.height);
      context.stroke();
    }
    if(this.survivor && this.selected) {
      context.fillStyle = "rgba(0,100,255,0.1)";
      context.beginPath();
        context.arc(this.midX, this.midY, this.survivor.get_range(), 0, Math.PI*2, true); //*2
      context.fill();
    }
  context.restore();
  
  //Cannon
  if(this.survivor !== undefined) {
    context.save();
      context.lineWidth = 3;
      context.strokeStyle = "#000000";
      context.translate(this.midX,this.midY);
      context.rotate(this.direction);
      
      context.save();
        context.beginPath();
          context.moveTo(0,0);
          context.lineTo((this.width+this.height) / 2 ,0); //Size of turret is avg of width and length
        context.stroke();
      context.restore();
    context.restore();
  }
  //Line to show engaged enemy
  if(this.target !== undefined && this.survivor !== undefined) {
    context.save();
      context.strokeStyle = "rgba(255,0,0,0.1)";
      context.beginPath();
        context.moveTo(this.midX,this.midY);
        context.lineTo(this.target.x,this.target.y);
      context.stroke();
    context.restore();
  }
}

Tower.prototype.update = function(delta_time,enemies) {
  if(this.survivor == undefined) {
    return false;
  }
  
  //Want to add in priority - if closer to goal and in range shoot at it - otherwise shoot at closest
  var distMin = 10000000;

  for(var i = 0; i < enemies.length; i++) {
    var tmpDist = distance_between(enemies[i].x,enemies[i].y,this.midX,this.midY);
    if(tmpDist < distMin ) {
      distMin = tmpDist;
      this.target = enemies[i];
    }
  }

  if(this.target !== undefined) {
    this.direction = Math.atan2(this.target.y-this.midY,this.target.x-this.midX);
    this.cooldown += delta_time;
    if(this.cooldown > this.survivor.get_rate()) {
      this.cooldown = 0;
      if(distMin < this.survivor.get_range()) {
        
        var beta = this.target.direction - this.direction;
        var newDirection = this.direction + Math.asin(Math.sin(beta) * (this.target.velocity / this.survivor.get_velocity()));
        return new Projectile(this.midX,this.midY,this.survivor.get_velocity(),newDirection,this.survivor.get_damage(),this.survivor.get_projectile_size());
      }
    }
  }
  return false;
}

Tower.prototype.set_focus = function() {
  this.selected = true;
  this.color = "rgba(50,100,255,0.3)";
  this.display_menu();
  return this;
}

Tower.prototype.lose_focus = function() {
  this.selected = false;
  this._set_default_color();
  this.hide_menu();
}

Tower.prototype.set_survivor = function(survivor) {
  this.color = "rgba(0,100,255,0.9)";
  this.survivor = survivor;
}

Tower.prototype.lose_survivor = function() {
  this._set_default_color();
  this.survivor = undefined;
}

Tower.prototype.get_damage = function() {
  return this.survivor.get_damage();
}

Tower.prototype.get_survivor = function() {
  return this.survivor;
}

Tower.prototype._set_default_color = function() {
  if(this.selected) {
    this.color = "rgba(50,100,255,0.3)";
  }
  else {
    this.color = "rgba(0,100,255,0.6)";
  }
}

Tower.prototype.display_menu = function() {
  $(".tower_info").css("display","block");
}

Tower.prototype.hide_menu = function() {
  $(".tower_info").css("display","none");
}