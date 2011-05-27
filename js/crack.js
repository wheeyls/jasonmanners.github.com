context.save();
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0,0);
  var x = 0;
  var y = 0;
  for(var i = 0; i < this.treePoints.length; i++) {
    x += (this.treePoints[i].x * this.treePoints[i].frag);
    y += (this.treePoints[i].y * this.treePoints[i].frag);
    context.lineTo(x, y);
  }
  
  context.strokeStyle = "rgba(0,0,0,0.5)";
  context.shadowColor = "rgba("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+",0.8)";
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 5;
  context.stroke();
context.restore();