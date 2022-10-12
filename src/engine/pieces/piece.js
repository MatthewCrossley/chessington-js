import Player from "../player";
import Square from "../square";

export default class Piece {
    constructor(player) {
        this.player = player;
    }

    getAvailableMoves(board) {
        throw new Error('This method must be implemented, and return a list of available moves');
    }

    moveTo(board, newSquare) {
        const currentSquare = board.findPiece(this);
        board.movePiece(currentSquare, newSquare);
    }

    squareFromCurrent(board, rows, cols){
        let direction = this.player == Player.WHITE? 1: -1
        const currentSquare = board.findPiece(this)
        return Square.at(
            currentSquare.row + (rows === 0 ? 0 : rows * direction),
            currentSquare.col + (cols === 0 ? 0 : cols * direction)
        )
    }

    canMoveTo(board, square, allowTakes=true){
        if (board.availableSquare(square)){
            return true
        }
        if (allowTakes !== true){
            return false
        }
        if (board.squareExists(square)){
            // square not available. Check if there is a piece there we can take
            let takePiece = board.getPiece(square)
            if (takePiece.player !== this.player && takePiece.cannotTake !== true){
                return "take"
            }
        }
        return false
    }

    checkAvailableMoves(board, currentSquare, rowIncrement, colIncrement){
        let moves = []
        var lastMove = currentSquare
        while (true){
            let tmpMove = Square.at(lastMove.row + rowIncrement, lastMove.col + colIncrement)
            if (this.canMoveTo(board, tmpMove)){
                moves.push(tmpMove)
                if (!board.availableSquare(tmpMove)){
                    // we can move there but only to take a piece
                    // so break here so we don't calculate moves beyond this piece
                    break
                }
            } else {
                break
            }
            lastMove = tmpMove
        }
        return moves
    }
}
