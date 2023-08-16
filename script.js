const cvs = document.getElementById('tetris-board')
const ctx = cvs.getContext("2d")

const scoreEle = document.getElementById('score')

const ROW = 20
const COL = COLUMN = 10;
const sq = 20 // Size of square

const vacant = 'white' // color of an empty square

let score = 0

// Drawing a Square
function drawSquare(x, y, color) {
    ctx.fillStyle = color
    ctx.fillRect(x*sq, y*sq, sq, sq)

    ctx.strokeStyle = 'black'
    ctx.strokeRect(x*sq, y*sq, sq, sq)
}

// Creating a board
let board = []
for (var i=0 ;i<ROW;++i){
    board[i] = []
    for ( var j=0 ;j <COL;++j ){
        board[i][j] = vacant
    }
}

// Drawing the board
function drawBoard(){
    for (var i=0 ;i<ROW;++i){
        for ( var j=0 ;j <COL;++j ){
            drawSquare(j, i, board[i][j])
        }
    }
}

drawBoard()

// Pieces and their color
const pieces = [
    [Z,"red"],
    [S,"green"],
    [T,"yellow"],
    [O,"blue"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];

// Generate a random piece
function randomPiece(){
    let r = Math.floor(Math.random()*pieces.length)
    return new Piece(pieces[r][0], pieces[r][1])
}

let p = randomPiece()

// The object piece
function Piece(tetromino, color){
    this.tetromino = tetromino
    this.color = color

    this.tetrominoN = 0 // The orientation of the piece
    this.activeTetromino = this.tetromino[this.tetrominoN]

    // To controll the piece
    this.x = 3
    this.y = -1
}

// Function to draw and remove piece
Piece.prototype.fill = function(color) {
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we draw only occupied squares
            if( this.activeTetromino[r][c]){
                drawSquare(this.x + c,this.y + r, color);
            }
        }
    }
}

// Draw a Piece
Piece.prototype.draw = function() {
    this.fill(this.color)
}

p.draw()

// Undraw previous piece
Piece.prototype.unDraw = function() {
    this.fill(vacant)

}

// Functions for Controlling the piece
Piece.prototype.moveLeft = function() {
    if(!this.collision(1,0,this.activeTetromino)){
        this.unDraw()
        this.x++
        this.draw()
    }
}

Piece.prototype.moveRight = function() {
    if(!this.collision(-1,0,this.activeTetromino)){
        this.unDraw()
        this.x--
        this.draw()
    }
}

Piece.prototype.rotate = function() {
    let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length]
    let kick = 0;
    
    if(this.collision(0,0,nextPattern)){ // finding collision
        if(this.x > COL/2){
            // it's the right wall
            kick = -1; // we need to move the piece to the left
        }else{
            // it's the left wall
            kick = 1; // we need to move the piece to the right
        }
    }
    if(!this.collision(kick,0,nextPattern)){
        this.unDraw()
        this.x += kick
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length
        this.activeTetromino = this.tetromino[this.tetrominoN]
        this.draw()
    }
}

// Moving the piece down
Piece.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeTetromino)){
        this.unDraw()
        this.y++
        this.draw()
    }else {
        this.lock()
        p = randomPiece()
    }
}

// Locking a piece on the board
Piece.prototype.lock = function(){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we skip the vacant squares
            if( !this.activeTetromino[r][c]){
                continue;
            }
            // pieces to lock on top = game over
            if(this.y + r < 0){
                alert("Game Over");
                // stop request animation frame
                gameOver = true;
                break;
            }
            // we lock the piece
            board[this.y+r][this.x+c] = this.color;
        }
    }

    // Checking if the row is full
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for( c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[r][c] != vacant);
        }
        if(isRowFull){
            // if the row is full
            // we move down all the rows above it
            for( y = r; y > 0; y--){
                for( c = 0; c < COL; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            // the top row board[0][..] has no row above it
            for( c = 0; c < COL; c++){
                board[0][c] = vacant;
            }
            // increment the score
            score += 10;
        }
    }
    // update the board and score
    drawBoard();
    scoreEle.innerHTML = `Score = ${score}`
}

// Pause the game
function pause() {
    gameOver = !gameOver
    if(!gameOver){
        drop()
    }
}

// Finding collisions
Piece.prototype.collision = function(x, y, piece) {
    for(r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // Skip if square is empty
            if(!piece[r][c]){
                continue
            }
            // Coordinates after movement
            let newX = this.x + c + x
            let newY = this.y + r + y

            // Collision with Border
            if(newX < 0 || newX >= COL || newY >= ROW){
                return true
            }
            // Skip if newY < 0
            if (newY < 0){
                continue
            }
            // Collision with Block
            if(board[newY][newX] != vacant) {
                return true
            }
        }
    }
    return false
}

// Adding Controlls
document.addEventListener('keydown', control)

function control(event) {
    if(event.keyCode == 39){
        p.moveLeft();
        dropStart = Date.now();
    }else if(event.keyCode == 38){
        p.rotate();
        dropStart = Date.now();
    }else if(event.keyCode == 37){
        p.moveRight();
        dropStart = Date.now();
    }else if(event.keyCode == 40){
        p.moveDown();
    }else if(event.keyCode == 32){
        pause();
    }
}

let dropStart = Date.now()
let gameOver = false

function drop() {
    let now = Date.now()
    if (now-dropStart > 1000){
        p.moveDown()
        dropStart = Date.now()
    }
    if(!gameOver){
        requestAnimationFrame(drop)
    }
}

drop()

document.getElementById('pause').onclick = pause



