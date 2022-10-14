import Piece from './piece';
import Square from '../square'
import Player from '../player';
import Rook from './rook';

export default class King extends Piece {
    constructor(player) {
        super(player);
        this.cannotTake = true
    }

    squareIsChecked(board, square){
        let checkable = false
        for (let row = 0; row < board.board.length; row++) {
            for (let col = 0; col < board.board[row].length; col++) {
                if (board.board[row][col] instanceof Piece) {
                    let p = board.board[row][col]
                    if (p.player === this.player){
                        continue
                    }

                    if (p.canCheck(board, square)){
                        checkable = true
                        break
                    }
                }
            }
            if (checkable){
                break
            }
        }
        return checkable
    }

    castling(board){
        let castleMoves = []
        if (this.moveHistory.length !== 0){
            return castleMoves
        }
        let currentSquare = board.findPiece(this)
        if (this.squareIsChecked(board, currentSquare)){
            return castleMoves
        }

        let baseRow = this.player === Player.WHITE ? 0 : 7
        let rooks = [
            [board.getPiece(Square.at(baseRow, 0)), Square.at(baseRow, 0)],
            [board.getPiece(Square.at(baseRow, 7)), Square.at(baseRow, 7)]
        ]

        for (let r of rooks){
            let rook = r[0]
            let rookPos = r[1]
            if (rook === undefined || !rook instanceof Rook){
                continue
            }
            if (rook.player !== this.player){
                continue
            }
            if (rook.moveHistory.length !== 0){
                continue
            }
            let direction = rookPos.col > currentSquare.col ? 1 : -1
            let availableMoves = this.checkAvailableMoves(board, currentSquare, 0, direction)

            if (availableMoves.length >= 2){
                // if all squares are free up until the rook itself
                if (availableMoves.length === 2){
                    castleMoves.push(availableMoves.at(-1))
                } else {
                    // queenside rooks are 1 square further away
                    castleMoves.push(availableMoves.at(-2))
                }
            }
        }
        return castleMoves
    }

    _getAvailableMoves(board) {
        let moves = []

        let currentSquare = board.findPiece(this)

        // check regular moves
        for (let i = -1; i <= 1; i++){
            for (let j = -1; j <= 1; j++){
                if (i === 0 && j === 0){
                    continue
                }
                let tmpMove = Square.at(currentSquare.row + i, currentSquare.col + j)
                if (this.canMoveTo(board, tmpMove)){
                    // can we take the piece?
                    // Only if it cannot take the space we're trying to move to
                    if (!this.squareIsChecked(board, tmpMove)){
                        moves.push(tmpMove)
                    }
                }
            }
        }

        // check castling
        moves.push.apply(moves, this.castling(board))

        return moves;
    }

    moveTo(board, newSquare){
        let castling = this.castling(board)
        let kingSrc = board.findPiece(this)
        for (let kingDest of castling){
            let rookSrc = Square.at(kingSrc.row, kingDest.col > kingSrc.col ? 7 : 0)
            if (newSquare.equals(kingDest)){
                // if they have tried to select a castling square
                let rook = board.getPiece(rookSrc)
                let direction = kingDest.col > kingSrc.col ? 1 : -1
                let rookDest = Square.at(kingSrc.row, kingSrc.col + direction)

                board.setPiece(rookDest, rook)
                board.setPiece(rookSrc, undefined)
                super.moveTo(board, kingDest)
                board.setPiece(rookSrc, undefined)
                return
            }
        }
        super.moveTo(board, newSquare)
    }

    checkAvailableMoves(board, currentSquare, rowIncrement, colIncrement){
        let moves = []
        for (let move of super.checkAvailableMoves(board, currentSquare, rowIncrement, colIncrement)){
            if (this.squareIsChecked(board, move)){
                break
            }
            moves.push(move)
        }
        return moves
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
