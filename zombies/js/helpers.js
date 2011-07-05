/*************************************************************************
  Constants
**************************************************************************/
const MS_IN_SEC = 1000;

const LEFT_ARROW = 37;
const UP_ARROW = 38;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;
const M_KEY = "M";
const T_KEY = "T";
const S_KEY = "S";
const P_KEY = "P";

const WIN     = 42;
const LOSE    = 43;
const PAUSED  = 44;
const STOPPED = 45;
const RUNNING = 46;

const BASE_TOWER = 142;
const FAST_WEAK_TOWER = 143;
const LONG_RANGE_TOWER = 144;
const SLOW_STRING_TOWER = 145;

const MOUSE_UP = 242;
const MOUSE_DOWN = 243;
const MOVE_BOARD = 244;
const UPDATE_TOWER = 245;
const PLACING_TOWER = 246;
const NOTHING = 247;
const KEY_DOWN = 248;
const KEY_UP = 249;
const PLACING_SURVIVOR = 250;
const MOVING_SURVIVOR = 251;

const DAMAGE = 342;
const RANGE = 343;
const RATE = 344;

const BASE = 442;
const FLAMETHROWER = 443;
const MACHINEGUN = 444;
const CANNON = 445;
/*************************************************************************
  bind declaration
  - Has caused issues when it is not declared will not run
  in Safari without declaration
**************************************************************************/
Function.prototype.bind = Function.prototype.bind ||
                          function(scope) {
                            var _function = this;
                            
                            return function() {
                              return _function.apply(scope, arguments);
                            }
                          };

/*************************************************************************
  RequestAnimationFrame declaration
**************************************************************************/
window.requestAnimFrame = window.requestAnimationFrame        || 
                          window.webkitRequestAnimationFrame  || 
                          window.mozRequestAnimationFrame     || 
                          window.oRequestAnimationFrame       || 
                          window.msRequestAnimationFrame      || 
                          function(/* function */ callback) {
                            window.setTimeout(callback, MS_IN_SEC / 60);
                          };
                          
var startTime = window.mozAnimationStartTime || Date.now();

/*************************************************************************
  Helper functions
**************************************************************************/
function distance_between(x1,y1,x2,y2) {
  return Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2));
}

function coord_to_index(x,gridSpace) {
  return Math.floor(x/gridSpace);
}

function clean_coord(x,gridSpace) {
  return Math.floor(x/gridSpace) * gridSpace;
}

function clean_coord_index(x,gridSpace) {
  return coord_to_index(clean_coord(x,gridSpace),gridSpace);
}

