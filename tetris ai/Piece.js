//the singular square components of a "Block"
function Piece(x,y,colour,block) {
  this.parent = block;
  this.pos = createVector(x,y);
  this.colour = colour;

  //for drawing pieces in the game grid
  this.show = function() {
    translate(100,50);
    fill(this.colour.levels[0] * 0.4,this.colour.levels[1] * 0.4,this.colour.levels[2] * 0.4);
    rect(this.pos.x*30,this.pos.y*30,30,30);
    fill(this.colour);
    rect(this.pos.x*30+3,this.pos.y*30+3,24,24);
    translate(-100,-50);
  }

  //for drawing game pieces in the UI outside the game grid
  this.draw = function(x,y) {
    translate(x,y);
    fill(this.colour.levels[0] * 0.4,this.colour.levels[1] * 0.4,this.colour.levels[2] * 0.4);
    rect(0,0,30,30);
    fill(this.colour);
    rect(3,3,24,24);
    translate(-x,-y);
  }
}
