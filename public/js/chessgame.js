const socket = io();
const chess=new Chess()
const boardelement=document.querySelector('.chessboard')
let draggedPiece=null;
let sourceSquare=null;
let playerRole=null

const renderBoard=()=>{
  const board=chess.board()
  boardelement.innerHTML=""
  board.forEach((row,rowindex)=>{
    row.forEach((square,squareindex)=>{
      const squareElement=document.createElement('div')
      squareElement.classList.add("square",(rowindex+squareindex)%2===0?'light':'dark')
      squareElement.dataset.row=rowindex;
      squareElement.dataset.col=squareindex;
      if(square){
        const pieceElement=document.createElement('div')
        pieceElement.classList.add("piece",(square.color==="w"?"white":"black"))
      pieceElement.innerText=getPieceUnicode(square)
      pieceElement.draggable=playerRole===square.color
      pieceElement.addEventListener("dragstart",(e)=>{
        if(pieceElement.draggable){
        draggedPiece=pieceElement
        sourceSquare={row:rowindex,col:squareindex}
        e.dataTransfer.setData("text/plain","")
        }
      })
      pieceElement.addEventListener("dragend",(e)=>{
        draggedPiece=null
        sourceSquare=null
      })
      squareElement.appendChild(pieceElement)
    }

    squareElement.addEventListener("dragover",function(e){
      e.preventDefault()
      if(draggedPiece){
        const targetsource={
          row:parseInt(squareElement.dataset.row),
          col:parseInt(squareElement.dataset.col),
        }
        handleMove(sourceSquare,targetsource)
      }
    })
    boardelement.appendChild(squareElement)
    })
  })
  if(playerRole==='b'){
  boardelement.classList.add("flipped")
}
else{
  boardelement.classList.remove('flipped')
}
}

const handleMove=(source,target)=>{
  const move={
    from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
    to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
    promotion:'q'
  }
  socket.emit("move",move)
}
const getPieceUnicode=(piece)=>{
 const unicodepieces={
   K: "♔", // King
  Q: "♕", // Queen
  R: "♖", // Rook
  B: "♗", // Bishop
  N: "♘", // Knight
  P: "♙", // Pawn

  // Black pieces
  k: "♚", // King
  q: "♛", // Queen
  r: "♜", // Rook
  b: "♝", // Bishop
  n: "♞", // Knight
  p: "♟", // Pawn
 }
 return unicodepieces[piece.type] || ''
}

socket.on("playerRole",function(role){
  playerRole=role
  renderBoard()
})
socket.on("spectatorRole",function(role){
  playerRole=null
  renderBoard()
})
socket.on("boardstate",function(fen){
 chess.load(fen)
  renderBoard()
})
socket.on("move",function(move){
 chess.move(move)
  renderBoard()
})
renderBoard()