let startScreen = null;
let gameScreen = null;
let currScreen = null;
let board = null;

function setup() {
  createCanvas(800, 800);
  frameRate(60);
  gameScreen = new GameScreen();
  homeScreen = new HomeScreen();
  currScreen = homeScreen;
}

function draw() {
  currScreen.drawMe();
}

function mousePressed(){
  currScreen.processMouse();
}

function keyPressed() {
  currScreen.processKey();
}

class HomeScreen {
  constructor() {
    textSize(50);
    this.play = new MyButton("Play Now!", width * 0.20, height * 0.60);;
  }
  processKey() {}
  processMouse() {
    if(this.play.isClicked(mouseX, mouseY)){
      currScreen = gameScreen;
    }
  }
  drawMe() {
    background(255);
    fill(0);
    noStroke();
    textSize(50);
    text("TETRIS", width * 0.20, height * 0.30);
    textSize(25);
    text("By Matthijs van Mierlo", width * 0.20, height * 0.40);
    textSize(20);
    text("Working beta. Some gameplay bugs...", width * 0.20, height * 0.45);
    this.play.drawMe();
  }
}

class GameScreen {
  constructor() {
    this.board = new Board();
    this.left = new MyButton("LEFT", width * 0.675, height * 0.75);
    this.right = new MyButton("RIGHT", width * 0.80, height * 0.75);
    this.up = new MyButton("ROTATE", width * (0.675 + 0.75)/2, height * 0.65);
  }
  processKey() {
    if (keyCode == LEFT_ARROW) {
      this.board.moveLeft();
    } else if (keyCode == RIGHT_ARROW) {
      this.board.moveRight();
    } else if (keyCode == UP_ARROW) {
      this.board.rotatePiece();
    }
  }
  processMouse() {
    
    if(this.up.isClicked(mouseX, mouseY)){
      console.log("Called");
      this.board.rotatePiece();
    }else if(this.left.isClicked(mouseX, mouseY)){
      this.board.moveLeft();
    }else if(this.right.isClicked(mouseX, mouseY)){
      this.board.moveRight();
    }
  }
  drawMe() {
    background(0);
    if (frameCount % 30 == 0) {
      this.board.update();
    }
    this.board.show();
    this.up.drawMe();
    this.left.drawMe();
    this.right.drawMe();
  }
}

class Piece {
  constructor() {
    this.pieceChoices = [
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
      ],
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [0, 1],
      ],
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
    ];
    this.pieceGrid = this.pieceChoices[
      Math.floor(Math.random() * this.pieceChoices.length)
    ];
    this.row = 0;
    // Random column on the board, refactor this to get dimensions as parameter
    this.col = Math.floor(Math.random() * 9);
  }
  show() {
    stroke(255);
    fill(255, 0, 0);
    // Refactor to get the dimensions of the board as a parameter
    for (let i = 0; i < this.pieceGrid.length; i++) {
      let p = this.pieceGrid[i];
      // Coordinates of piece parts is with respect to bottom left corner...
      let x = (p[1] + this.col) * ((width * 0.6) / 10);
      let y = (this.row - p[0]) * (height / 20);
      let rectWidth = (width * 0.6) / 10;
      let rectHeight = height / 20;
      rect(x, y, rectWidth, rectHeight);
    }
  }
  moveLeft() {
    this.col -= 1;
  }
  moveRight() {
    this.col += 1;
  }
  fall() {
    this.row += 1;
  }
}

class Board {
  constructor() {
    this.score = 0;
    this.numRows = 20;
    this.numCols = 10;
    this.piece = new Piece();
    this.grid = [];
    for (let r = 0; r < this.numRows; r++) {
      let row = [];
      for (let c = 0; c < this.numCols; c++) {
        row.push(false);
      }
      this.grid.push(row);
    }
  }
  update() {
    // Move piece down until it intersects
    this.piece.fall();
    // If piece hits bottom of board
    // If piece hits existing piece on board
    for (let i = 0; i < this.piece.pieceGrid.length; i++) {
      let part = this.piece.pieceGrid[i];
      let tempRow = this.piece.row - part[0];
      let tempCol = this.piece.col + part[1];
      if (tempRow == this.numRows - 1) {
        // Collision detected with one of the pieces
        for (let j = 0; j < this.piece.pieceGrid.length; j++) {
          let part2 = this.piece.pieceGrid[j];
          let tempRow = this.piece.row - part2[0];
          let tempCol = this.piece.col + part2[1];
          this.grid[tempRow][tempCol] = true;
        }
        this.piece = new Piece();
        break;
      }
      if (
        tempRow + 1 >= 0 &&
        tempRow + 1 < this.numRows &&
        tempCol >= 0 &&
        tempCol < this.numCols &&
        this.grid[tempRow + 1][tempCol]
      ) {
        // Collision detected with one of the pieces
        for (let i = 0; i < this.piece.pieceGrid.length; i++) {
          let part = this.piece.pieceGrid[i];
          let tempRow = this.piece.row - part[0];
          let tempCol = this.piece.col + part[1];
          this.grid[tempRow][tempCol] = true;
        }
        this.piece = new Piece();
        break;
      }
    }

    // *** ISSUE If piece gets rotated too close to the bottom,
    // there is a chance it could be out of bounds
    // ****** SEE BELOW FOR WHERE TO FIX THIS....

    this.clearRows();
  }
  show() {
    let cellWidth = (width * 0.6) / this.numCols;
    let cellHeight = height / this.numRows;
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        if (this.grid[row][col] == false) {
          stroke(255);
          noFill();
        } else {
          stroke(255);
          fill(255, 0, 0);
        }
        rect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
      }
    }
    this.piece.show();
    // ***** ADD SCORE BOX ON TOP RIGHT
    stroke(255);
    fill(255);
    rect(width * 0.65, height * 0.05, width * 0.3, height * 0.3);
    textSize(40);
    noStroke();
    fill(0);
    text("Score: ", width * 0.675, height * 0.15);
    text(this.score, width * 0.675, height * 0.25);
  }
  moveLeft() {
    for (let i = 0; i < this.piece.pieceGrid.length; i++) {
      let part = this.piece.pieceGrid[i];
      let tempRow = this.piece.row - part[0];
      let tempCol = this.piece.col + part[1];
      if (tempCol <= 0) {
        return;
      }
    }
    this.piece.moveLeft();
  }
  moveRight() {
    for (let i = 0; i < this.piece.pieceGrid.length; i++) {
      let part = this.piece.pieceGrid[i];
      let tempRow = this.piece.row - part[0];
      let tempCol = this.piece.col + part[1];
      if (tempCol >= this.numCols - 1) {
        return;
      }
    }
    this.piece.moveRight();
  }
  rotatePiece() {
    // *** ISSUE Only rotate the piece if it won't be off screen or intersect with existing pieces
    let tempList = [];
    for (let i = 0; i < this.piece.pieceGrid.length; i++) {
      let newPart = [
        -1 * this.piece.pieceGrid[i][1],
        this.piece.pieceGrid[i][0],
      ];
      tempList.push(newPart);
    }
    this.piece.pieceGrid = tempList;
  }
  clearRows() {
    // Start at the bottom, shift other rows down
    for (let r = 1; r < this.grid.length; r++) {
      // Check to see if row is supposed to be cleared
      let currRow = this.grid[r];
      let toClear = true;
      for (let space in currRow) {
        if (currRow[space] == false) {
          toClear = false;
        }
      }
      if (toClear) {
        this.score += 1;
        // For all rows above, move them down one row
        for (let rAbove = r - 1; rAbove >= 0; rAbove--) {
          for (let cIndex = 0; cIndex < this.grid[r].length; cIndex++) {
            this.grid[rAbove + 1][cIndex] = this.grid[rAbove][cIndex];
          }
        }
      }
    }
  }
}

class MyButton {
  constructor(t, x, y) {
    this.x = x;
    this.y = y;
    this.text = t;
    this.fontSize = 20;
    textSize(this.fontSize);
    this.rectWidth = textWidth(this.text) * 1.5;
    this.rectHeight = this.fontSize * 2;
    console.log(textWidth(this.text), this.rectWidth);
  }
  drawMe() {
    fill(0, 0, 255);
    textSize(this.fontSize);
    rect(this.x, this.y, this.rectWidth, this.rectHeight);
    noStroke();
    fill(255);
    let newX = this.x + (this.rectWidth - textWidth(this.text)) / 2;
    let newY = this.y + this.rectHeight / 2 + this.fontSize / 4;
    text(this.text, newX, newY);
  }
  isClicked(x, y) {
    return (
      x > this.x &&
      x < this.x + this.rectWidth &&
      y > this.y &&
      y < this.y + this.rectHeight
    );
  }
}
