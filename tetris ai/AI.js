function AI() {
 this.enabled = true;
 this.calculatedIdealState = false;
 this.prevState = new State(this);
 this.stateScores = [];
 this.scoreStates = [];
 this.inputMoveBuffer = [];
 this.inputRotateBuffer = [];

 //checks all positions, rotations of current peice and HOLD peice, to see which is best.
 this.evalStates = function(tiles,block,blockHeld,blockNext) {
   this.inputMoveBuffer = [];
   this.inputRotateBuffer = [];
   for (var b = 0; b < 2; b++) {
     var blockToUse;
     if (b == 0) blockToUse = block;
     else if (blockHeld == null) blockToUse = blockNext;
     else blockToUse = blockHeld;
     for (var i = 0; i < 4; i++) { //3 rotations
       this.prevState.setState(tiles,blockToUse);
       for (var a = 0; a < i; a++) this.prevState.block.rotate(tiles);
       var bounds = this.prevState.block.blockBounds();
       for (var j = 5 - bounds[0]; j < 15 - bounds[1]; j++) { //5 - its left most peice (usually 5), 15 - its rightmost (usually 5)
         this.prevState.setState(tiles,blockToUse);
         for (var a = 0; a < i; a++) this.prevState.block.rotate(tiles);
         this.prevState.test(j);
         this.stateScores.push(this.prevState.scoreState());
         if (b == 0) this.scoreStates.push({b:0,pos:j,rotate:i});
         else this.scoreStates.push({b:1,pos:j,rotate:i});
       }
     }
   }
   var optimumState = this.bestStateIndex();
   this.play(this.scoreStates[optimumState]);
   this.stateScores = [];
   this.scoreStates = [];
 }

 //stores movements for later to move the piece in a "human" way towards ideal position
 this.play = function(idealConfig) {
   this.BufferSwap = idealConfig.b;
   for (var i = 0; i < idealConfig.rotate; i++) {
     this.inputRotateBuffer.push(1);
   }
   for (var i = 0; i < Math.abs(5 - idealConfig.pos); i++) {
     if (5 - idealConfig.pos > 0) this.inputMoveBuffer.push(-1);
     else this.inputMoveBuffer.push(1);
   }
   this.calculatedIdealState = true;
 }

 this.bestStateIndex = function() {
   var sI = 0;
   var bestScore = -Infinity;
   for (var i = 0; i < this.stateScores.length; i++) {
     if (this.stateScores[i] > bestScore) {
       bestScore = this.stateScores[i];
       sI = i;
     }
   }
   return sI;
 }
}

function State(AI) {
  this.ai = AI;
  this.tiles = new Array(10);
  for (var i = 0; i < this.tiles.length; i++) {
    this.tiles[i] = new Array(20);
  }
  this.block = undefined;

  this.setState = function(tiles,block) {
    this.block = new Block(block.type);
    for (var i = 0; i < tiles.length; i++) {
      for (var j = 0; j < tiles[i].length; j++) {
        this.tiles[i][j] = tiles[i][j] != undefined;
      }
    }
  }

  //scores each possibility on a few factors
  this.scoreState = function() {
    var stateScore = 0;

    //the lower all the tiles are, the better...
    //line clears also improve score through this code
    for (var i = 0; i < this.tiles.length; i++) {
      for (var j = 0; j < this.tiles[i].length; j++) {
        if (this.tiles[i][j]) stateScore += j;
      }
    }
    var topTile = false;

    //discourage creating "holes" (empty pockets)
    for (var i = 0; i < this.tiles.length; i++) {
      var topTile = false;
      for (var j = 0; j < this.tiles[i].length; j++) {
        if (this.tiles[i][j] == 1 && !topTile) {
          topTile = true;
        } else if (this.tiles[i][j] == 0 && topTile) {
          stateScore -= 40;
        }
      }
    }

    //discourage creating areas where only line peices can perfectly fit (3x1 empty spaces)
    //Punished harshly (-300 score for this, compared to -40 for creating a one square hole.)
    for (var i = 0; i < this.tiles.length; i++) {
      var emptyBlocks = 0;
      for (var j = 0; j < this.tiles[i].length; j++) {
        if (this.tiles[i][j] == 0) {
          if (i == 0) {
            if (this.tiles[i+1][j] == 1) emptyBlocks++;
          } else if (i == 9) {
            if (this.tiles[i-1][j] == 1) emptyBlocks++;
          }
          else {
            if (this.tiles[i-1][j] == 1 && this.tiles[i+1][j] == 1) emptyBlocks++;
          }
          if (emptyBlocks == 3) {
            stateScore -= 300;
            break;
          }
        } else if (this.tiles[i][j] == 1) {
          break;
        }
      }
    }
    return stateScore;
  }

  //simulate moving the piece into the position, so we can score the outcome later
  this.test = function(xPos) {
    var landed = false;
    this.block.moveHoriz(-5 + xPos);
    while (!landed) {
      if (this.block.collideSimulate(this.tiles)) landed = true;
      else this.block.drop();
      if (landed) checkFinishedRow();
    }
  }
}
