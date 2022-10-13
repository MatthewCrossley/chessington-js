import Player from '../player';
import Square from '../square';
import Piece from './piece';
import Queen from './queen';

export default class Pawn extends Piece {
    constructor(player) {
        super(player);
    }

    enPassant(board, currentSquare, diagMove){
        if (diagMove.col - currentSquare.col === 0){
            return undefined
        }
        let enPassant = Square.at(currentSquare.row, diagMove.col)
        let hostilePiece = board.getPiece(enPassant)
        if (hostilePiece instanceof Pawn){
            if (hostilePiece.player !== this.player){
                if (hostilePiece.moveHistory.length === 2){
                    // if has moved initial pos -> new pos
                    if (Math.abs(hostilePiece.moveHistory[0].row - hostilePiece.moveHistory[1].row) === 2){
                        // if that initial move was indeed 2 places
                        return hostilePiece
                    }
                }
            }
        }
    }

    _getAvailableMoves(board) {
        let baseRow = this.player == Player.WHITE? 1 : 6
        const currentSquare = board.findPiece(this)
        let moves = []

        for (let diag of [-1, 1]){
            let diagMove = this.squareFromCurrent(board, 1, diag)
            if (this.canMoveTo(board, diagMove)){
                // ^ if the square is EMPTY OR has a piece we can take
                if (!board.availableSquare(diagMove)){
                    // ^ if there is a piece we can take
                    moves.push(diagMove)
                } else {
                    let passantPiece = this.enPassant(board, currentSquare, diagMove)
                    if (passantPiece !== undefined){
                        moves.push(diagMove)
                    }
                }
            }
        }

        let oneSpaceMove = this.squareFromCurrent(board, 1, 0)
        if (this.canMoveTo(board, oneSpaceMove, {allowTakes: false})){
            moves.push(oneSpaceMove)

            let twoSpaceMove = this.squareFromCurrent(board, 2, 0)
            if (currentSquare.row == baseRow && this.canMoveTo(board, twoSpaceMove, {allowTakes: false})){
                moves.push(twoSpaceMove)
            }
        }

        return moves;
    }

    moveTo(board, newSquare){
        let currentSquare = board.findPiece(this)
        let passantPiece = this.enPassant(board, currentSquare, newSquare)
        if (passantPiece !== undefined){
            board.setPiece(board.findPiece(passantPiece), undefined)
            passantPiece.moveHistory = []
        }

        let maxRow = this.player === Player.WHITE ? 7: 0
        if (newSquare.row === maxRow){
            board.setPiece(currentSquare, undefined)
            let promotedPawn = new Queen(this.player)
            promotedPawn.moveHistory = this.moveHistory
            board.setPiece(currentSquare, promotedPawn)
            promotedPawn.moveTo(board, newSquare)
        } else {
            super.moveTo(board, newSquare)
        }
    }

    canCheck(board, square){
        let p = board.getPiece(square)
        if (p !== undefined && p.player === this.player){
            return false
        }

        for (let diag of [-1, 1]){
            if (square.equals(this.squareFromCurrent(board, 1, diag))){
                return true
            }
        }
        return false
    }
}
