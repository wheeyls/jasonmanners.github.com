// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
function setNavAnimations() {
  $(".nav_button").each(function(){
    var sectionToGo = $(this).attr("section");
    
    var topOffset = $("#"+sectionToGo).css("top");
    var leftOffset = $("#"+sectionToGo).css("left");
    var thisWidth = $("#"+sectionToGo).css("width");
    var thisColor = $(this).css("backgroundColor");
    
    topOffset = topOffset.replace("px","");
    leftOffset = leftOffset.replace("px","");

    $(this).click(function() {
      $("#window_pane").animate({scrollTop: topOffset, scrollLeft: leftOffset-100}, 750);
    });
  });

}

function setPositions() {
  $(".info_section").each(function(){
    var thisWidth = $(this).css("width");
    var thisCol = $(this).attr("colNum");
    var newLeft = (window.innerWidth / 2 - thisWidth.replace("px","") / 2) + (thisCol * window.innerWidth);
    console.log(window.innerWidth);
    console.log(thisWidth);
    $(this).css("left",newLeft);
  });
}

//Order matters
$(document).ready(function() { 
  setPositions(); 
  setNavAnimations();
});
