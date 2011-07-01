
/**************
RUN CODE
**************/
$(document).ready(function() {
  var myWorld = new World("world");
  $("#start").click(function() {myWorld.initialize(); myWorld.start(); $(this).css("display","none");});
});