function Block(type) {
  var xOffset = 5;
  this.center = createVector(xOffset,0);
  this.colour = pieceColours[Math.floor(Math.random()*pieceColours.length)];
  this.lastChance = 0;
  this.type = type;

  //block types
  if (type == "square") {
    this.pieceOrientation = [[0,0],[0,1],[1,0],[1,1]];
  } else if (type == "L") {
    this.pieceOrientation = [[0,-1],[0,0],[0,1],[1,1]];
  } else if (type == "reverse L") {
    this.pieceOrientation = [[0,-1],[0,0],[0,1],[-1,1]];
  } else if (type == "line") {
    this.pieceOrientation = [[0,-1],[0,0],[0,1],[0,2]];
  } else if (type == "squiggle") {
    this.pieceOrientation = [[0,-1],[0,0],[1,0],[1,1]];
  } else if (type == "reverse squiggle") {
    this.pieceOrientation = [[0,-1],[0,0],[-1,0],[-1,1]];
  } else if (type == "T") {
    this.pieceOrientation = [[0,0],[0,1],[-1,1],[1,1]];
  }

  for (var i = 0; i < this.pieceOrientation.length; i++) {
    this.pieceOrientation[i][0] += xOffset;
  }
  this.pieces = [new Piece(this.pieceOrientation[0][0],this.pieceOrientation[0][1],this.colour,this),
                 new Piece(this.pieceOrientation[1][0],this.pieceOrientation[1][1],this.colour,this),
                 new Piece(this.pieceOrientation[2][0],this.pieceOrientation[2][1],this.colour,this),
                 new Piece(this.pieceOrientation[3][0],this.pieceOrientation[3][1],this.colour,this)
  ];

  this.show = function() {
    for (var i = 0; i < this.pieces.length; i++) {
      this.pieces[i].show();
    }
  }

  this.draw = function(x,y) {
    for (var i = 0; i < this.pieces.length; i++) {
      this.pieces[i].draw(x + this.pieceOrientation[i][0]*30 - 150,y + this.pieceOrientation[i][1]*30); //"-150" accounts for the x-offset
    }
  }

  this.drop = function() {
    if (this.lastChance > 0) return;
    for (var i = 0; i < this.pieces.length; i++) {
      this.pieces[i].pos.y += 1;
    }
    this.center.y += 1;
  }

  this.moveHoriz = function(dir) {
    for (var i = 0; i < this.pieces.length; i++) {
      this.pieces[i].pos.x += dir;
    }
    this.center.x += dir;
  }

  this.rotate = function(allPieces) {
    var wallBump = 0;
    var tileBump = 0;
    for (var i = 0; i < this.pieces.length; i++) {
      var deltaX = this.pieces[i].pos.x - this.center.x;
      var deltaY = this.pieces[i].pos.y - this.center.y;
      this.pieces[i].pos.x = this.center.x + deltaY;
      this.pieces[i].pos.y = this.center.y -deltaX;
      if (this.pieces[i].pos.x < 0) wallBump = this.pieces[i].pos.x;
      else if (this.pieces[i].pos.x > 9) wallBump = this.pieces[i].pos.x - 9;
      if (wallBump) {
        this.moveHoriz(-wallBump);
        wallBump = 0;
      }
    }
  }

  this.sideCollide = function(allPieces,dir) {
    for (var i = 0; i < this.pieces.length; i++) {
      if (this.pieces[i].pos.x == 0 && dir == -1) return false;
      else if (this.pieces[i].pos.x == 9 && dir == 1) return false;
      if (allPieces[this.pieces[i].pos.x + dir][this.pieces[i].pos.y] != undefined) return false;
      if (this.pieces[i].pos.x + dir < 0 || this.pieces[i].pos.x + dir > 9) return false;
    }
    return true;
  }

  this.collide = function(allPieces) {
    var collided = false;
    for (var i = 0; i < this.pieces.length; i++) {
      if (allPieces[this.pieces[i].pos.x][this.pieces[i].pos.y+1] != undefined || this.pieces[i].pos.y == 19) {
        if (this.lastChance == 3) {
          this.convertToPieces(allPieces);
          return true;
        } else {
          collided = true;
          this.lastChance++;
          return;
        }
      }
    }
    if (!collided) this.lastChance = 0;
  }

  //this.collide variant used by the AI so that no data is actually changed.
  this.collideSimulate = function(allPieces) {
    for (var i = 0; i < this.pieces.length; i++) {
      if (this.pieces[i].pos.x < 0 || this.pieces[i].pos.x > 9) console.log(this.pieces[i].pos.x);
      if (allPieces[this.pieces[i].pos.x][this.pieces[i].pos.y+1] == true || this.pieces[i].pos.y == 19) {
        this.convertToPiecesSimulate(allPieces);
        return true;
      }
    }
  }

  this.convertToPieces = function(allPieces) {
    for (var i = 0; i < this.pieces.length; i++) {
      allPieces[this.pieces[i].pos.x][this.pieces[i].pos.y] = this.pieces[i];
    }
  }

  //this.convertToPieces variant used by the AI so that no data is actually changed.
  this.convertToPiecesSimulate = function(allPieces) {
    for (var i = 0; i < this.pieces.length; i++) {
      allPieces[this.pieces[i].pos.x][this.pieces[i].pos.y] = 1;
    }
  }

  this.blockBounds = function() {
    var leftMost = 9;
    var rightMost = 0;
    for (var i = 0; i < this.pieces.length; i++) {
      if (this.pieces[i].pos.x < leftMost) leftMost = this.pieces[i].pos.x;
      if (this.pieces[i].pos.x > rightMost) rightMost = this.pieces[i].pos.x;
    }
    return [leftMost,rightMost];
  }
}
