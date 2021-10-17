function setup() {
  c = createCanvas(1200,700);
  noStroke();
  pixelDensity(1);
  noSmooth();

  //stat based variables
  score = 0;

  //tile based variables
  tilePieces = new Array(10);
  for (var i = 0; i < tilePieces.length; i++) {
    tilePieces[i] = new Array(20);
  }
  pieceColours = [color("#FF0000"),color("#FF5F00"),color("#FFFF00"),color("#00FF00"),color("#0000FF"),color("#9400d3")];

  //block based variables
  blockTypes = ["square","line","L","reverse L","squiggle","reverse squiggle","T"];
  currentBlock = new Block(blockTypes[Math.floor(Math.random()*blockTypes.length)]);
  nextBlock = new Block(blockTypes[Math.floor(Math.random()*blockTypes.length)]);
  heldBlock = null;
  swappedThisTurn = false;

  //time based variables
  humanDropTime = 40;
  humanDropTimeNormal = 40;
  humanDropTimeDownHeld = 5;
  dropTime = 0;
  dropTimeLeft = dropTime;
  framesSinceNewBlock = 0;

  ai = new AI();

  //slider based variables
  slider = createSlider(1, 10, 3);
  slider.position(678, 193);
  slider.style('width', '120px');
  slider.elt.oninput = function() {
    var powerOf2 = Math.pow(2,slider.value());
    dropTime = humanDropTime / powerOf2;
  }
  slider.elt.oninput(); //set to slider default value immediately
}

function timeStep() {
  framesSinceNewBlock++;
  if (ai.enabled) {
    if (!ai.calculatedIdealState) {
      ai.evalStates(tilePieces,currentBlock,heldBlock,nextBlock);
    } else {
      if (ai.BufferSwap == 1) { //wait two frames without movement then swap
        if (framesSinceNewBlock == 2) {
          swapBlocks();
          ai.BufferSwap = 0;
        }
      } else {
        if (ai.inputMoveBuffer.length > 0) {
        currentBlock.moveHoriz(ai.inputMoveBuffer[0]);
        ai.inputMoveBuffer.splice(0,1);
        }
        if (ai.inputRotateBuffer.length > 0) {
          currentBlock.rotate(tilePieces);
          ai.inputRotateBuffer.splice(0,1);
        }
      }
    }
  }
  if (currentBlock.collide(tilePieces)) {
    currentBlock = nextBlock;
    //random
    createNextBlock()
    checkFinishedRow();
    swappedThisTurn = false;
    framesSinceNewBlock = 0;
    if (ai.enabled) ai.calculatedIdealState = false;
  } else currentBlock.drop();
}

//called 60 times a second, for 60fps animation.
function draw() {
  drawUI();

  dropTimeLeft--;
  while (dropTimeLeft <= 0) {
    timeStep();
    if (ai.enabled) dropTimeLeft += dropTime;
    else dropTimeLeft += humanDropTime;
  }

  //drawing to screen
  currentBlock.show();
  for (var i = 0; i < tilePieces.length; i++) {
    for (var j = 0; j < tilePieces[i].length; j++) {
      if (tilePieces[i][j] != undefined) {
        tilePieces[i][j].show();
      }
    }
  }
}

//player inputs handled
function keyPressed() {
  if (ai.enabled) return;
  if (key == "ArrowRight" || key == "d") {
    if (currentBlock.sideCollide(tilePieces,1)) currentBlock.moveHoriz(1);
  } else if (key == "ArrowLeft" || key == "a") {
    if (currentBlock.sideCollide(tilePieces,-1)) currentBlock.moveHoriz(-1);
  } else if (key == "ArrowDown" || key == "s") {
    dropTimeLeft = 0;
    humanDropTime = humanDropTimeDownHeld;
  } else if (key == "ArrowUp" || key == "w") currentBlock.rotate(tilePieces);
  if (key == "k") noLoop();
  if (key == " ") { //spacebar key
    swapBlocks();
  }
}

//player inputs handled
function keyReleased() {
  if (ai.enabled) return;
  if (key == "ArrowDown" || key == "s") {
    humanDropTime = humanDropTimeNormal;
    dropTimeLeft = humanDropTime;
  }
}

//swaps block from hold into play (and vice versa)
function swapBlocks() {
  if (!swappedThisTurn) {
    swappedThisTurn = true;
    if (heldBlock == null) {
      heldBlock = currentBlock;
      currentBlock = nextBlock;
      //random
      createNextBlock()
    } else {
      var holdingSpot = currentBlock;
      currentBlock = heldBlock;
      heldBlock = holdingSpot;
      currentBlock = new Block(currentBlock.type);
    }
  }
}

function moveBlocksDown(rows,yVal) {
  for (var i = 0; i < tilePieces.length; i++) {
    for (var j = tilePieces[i].length - 1; j >= 0; j--) {
      if (j < yVal && tilePieces[i][j] != undefined) {
        tilePieces[i][j].pos.y += rows;
        tilePieces[i][j+rows] = tilePieces[i][j];
        tilePieces[i][j] = undefined;
      }
    }
  }
}

function checkFinishedRow() {
  var completeInRow = 0;
  var allComplete = true;
  var rowClearScores = [40,100,300,1200];//[1,2,3,4]; for line based scores
  for (var j = 0; j < 20; j++) {
    for (var i = 0; i < tilePieces.length; i++) {
      if (tilePieces[i][j] == undefined) {
        if (completeInRow > 0) {
          score += rowClearScores[Math.min(completeInRow - 1,3)];
          moveBlocksDown(completeInRow,j);
          completeInRow = 0;
        }
        break;
      }
      if (i == 9) {
        completeInRow++;
        for (var a = 0; a < tilePieces.length; a++) { //kill row
          tilePieces[a][j] = undefined;
        }
      }
    }
  }
  if (completeInRow > 0) {
    score += rowClearScores[Math.min(completeInRow - 1,3)];
    moveBlocksDown(completeInRow,j);
    completeInRow = 0;
  }
}

function createNextBlock() {
  nextBlock = new Block(blockTypes[Math.floor(Math.random()*blockTypes.length)]);
}

function drawUI() {
  background(0);

  //game grid container
  fill(255);
  rect(90,40,320,620);
  fill(100);
  rect(100,50,300,600);

  //grid lines
  stroke(0);
  strokeWeight(2);
  for (var i = 0; i < 19; i++) {
    line(100,80 + i * 30,400,80 + i * 30);
  }
  for (var i = 0; i < 9; i++) {
    line(130 + i * 30,50,130 + i * 30,650);
  }
  noStroke();

  //score text
  fill(255);
  textSize(30);
  text("Score: " + score,500,100);
  //ai button
  rect(500,150,150,75);
  if (ai.enabled) fill(0,100,0);
  else fill(100,0,0);
  rect(505,155,140,65);
  fill(255);
  textSize(25);
  if (!ai.enabled) text("Enable AI",520,195);
  else text("Disable AI",518,195);

  //next block text and box
  fill(255);
  text("Next Block",505,290);
  rect(505,300,120,120);
  fill(0);
  rect(510,305,110,110);
  nextBlock.draw(545,475 + 45 - 170);
  fill(255);

  //hold text and box
  text("Hold",505,460);
  rect(505,470,120,120);
  fill(0);
  rect(510,475,110,110);
  if (heldBlock != null) heldBlock.draw(545,475 + 45);
  fill(255);
  text("AI speed",682,178);

  //descriptive text
  textSize(18);
  var sentences = ["Welcome to the Tetris AI. The AI is already running, so toggle the speed it runs at using the slider beside the \"Disable AI\" button.",
                   "It works by testing all possible moves (positions and rotations) and chooses the best one, based on my written scoring system.",
                   "You can also press the AI button to play yourself, but do note that you can cheat by rotating pieces into eachother...",
                   "The AI wont cheat, will you hold yourself to be moral like the computer?",
                   "Play with Arrow Keys or WASD. Spacebar to Hold Pieces.",];
  var spacings = ["\n\n","\n\n","\n\n","\n\n",,"\n"];
  totalString = "";
  for (var i = 0; i < sentences.length; i++) {
    totalString += sentences[i] + "\n\n";
  }
  text(totalString,682,280,450);
}

function mousePressed() {
  //clicking on the AI button
  if (mouseX > 500 && mouseX < 650 && mouseY > 150 && mouseY < 225) ai.enabled = !ai.enabled;
}
