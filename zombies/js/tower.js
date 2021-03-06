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
  this.health = 100;
  
  this.midX = this.x + (this.width / 2);
  this.midY = this.y + (this.height / 2);
  
  this.survivor = undefined;
  this.selected = false;
  
	this.red = 0;
	this.green = 100;
	this.blue = 255;
	this.alpha = 0.6;
  this.color = "rgba(0,100,255,0.6)";
	//would be nice to abstract these all out
	this.colors = {
		empty: "rgba(0,100,255,0.6)",
		survivor: "rgba(0,100,255,0.6)",
		selectedSurvivor: "rgba(0,100,255,0.1)",
		selectedEmpty: "rgba(0,0,0,0.5)",
		targetLine: "rgba(255,0,0,0.1)",
	};
}

Tower.prototype = {
  cost : 10
}

Tower.prototype.draw = function(context) {

  //Tower and range
  context.save();
    context.fillStyle = this.color_string();
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
		this.survivor.draw(context);
	}
  //Line to show engaged enemy
  if(false && this.target !== undefined && this.survivor !== undefined) {
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
  
  if(this.selected) {
    $("#damage_display").html(this.get_damage());
    $("#range_display").html(this.get_range());
    $("#rate_display").html(this.get_rate());
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
        return new Projectile(this.midX,this.midY,this.survivor.get_velocity(),newDirection,this.survivor.get_damage(),
                                this.survivor.get_projectile_size(),this.survivor.get_projectile_lifespan(),
                                this.survivor.get_projectile_angle_variation(),this.survivor.get_projectile_size_increse(),this.survivor.get_type());
      }
    }
  }
  return false;
}

Tower.prototype.lose_focus = function() {
  this.selected = false;
  this._set_default_color();
  this.hide_menu();
}

Tower.prototype.set_survivor = function(survivor) {
  this.alpha = 0.9;
  this.survivor = survivor;
}


Tower.prototype.lose_survivor = function() {
  this._set_default_color();
  this.survivor = undefined;
}


Tower.prototype.get_damage = function() {
  if(!this.survivor) {
    return 0;
  }
  return this.survivor.get_damage();
}

Tower.prototype.get_range = function() {
  if(!this.survivor) {
    return 0;
  }
  return this.survivor.get_range();
}

Tower.prototype.get_rate = function() {
  if(!this.survivor) {
    return 0;
  }
  return this.survivor.get_rate();
}
Tower.prototype.get_survivor = function() {
  return this.survivor;
}

Tower.prototype._set_default_color = function() {
  if(this.selected) {
		this.alpha = 0.3;
  }
  else {
		this.alpha = 0.6;
  }
}


Tower.prototype.set_focus = function() {
  this.selected = true;
	this.alpha = 0.3;
  this.display_menu();
  return this;
}

Tower.prototype.display_menu = function() {
  /* May need to move some of this to gameBoard */
  $(".tower_info").css("display","block");
  $("#damage_display").html(this.get_damage());
  $("#range_display").html(this.get_range());
  $("#rate_display").html(this.get_rate());
}

Tower.prototype.hide_menu = function() {
  $(".tower_info").css("display","none");
}

Tower.prototype.get_health = function() {
  return this.health;
}

Tower.prototype.is_dead = function() {
  return (this.health <= 0);
}

Tower.prototype.take_damage = function(damage) {
	this.red += damage * 2;
	this.blue -= damage;
  this.health -= damage;
}

Tower.prototype.color_string = function() {
	return "rgba("+this.red+","+this.green+","+this.blue+","+this.alpha+")";
};
