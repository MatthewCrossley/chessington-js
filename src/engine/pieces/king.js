import Piece from './piece';
import Square from '../square'

export default class King extends Piece {
    constructor(player) {
        super(player);
        this.cannotTake = true
    }

    getAvailableMoves(board) {
        let moves = []

        let currentSquare = board.findPiece(this)

        for (let i = -1; i <= 1; i++){
            for (let j = -1; j <= 1; j++){
                if (i === 0 && j === 0){
                    continue
                }
                let tmpMove = Square.at(currentSquare.row + i, currentSquare.col + j)
                if (this.canMoveTo(board, tmpMove)){
                    // can we take the piece?
                    // Only if it cannot take the space we're trying to move to
                    let checkable = false
                    for (let row = 0; row < board.board.length; row++) {
                        for (let col = 0; col < board.board[row].length; col++) {
                            if (board.board[row][col] instanceof Piece) {
                                let p = board.board[row][col]
                                if (p.player === this.player){
                                    continue
                                }

                                if (p.canCheck(board, tmpMove)){
                                    checkable = true
                                    break
                                }
                            }
                        }
                        if (checkable){
                            break
                        }
                    }
                    if (!checkable){
                        moves.push(tmpMove)
                    }
                }
            }
        }

        return moves;
    }

    canCheck(board, square){
        let p = board.getPiece(square)
        if (p !== undefined && p.player === this.player){
            return false
        }

        let currentSquare = board.findPiece(this)
        if (Math.abs(square.row - currentSquare.row) <= 1){
            if (Math.abs(square.col - currentSquare.col) <= 1){
                // king can only move 1 sqaure any direction
                // so if piece is than 1 square away in any direction,
                // we can check it
                return true
            }
        }
        return false
    }
}
