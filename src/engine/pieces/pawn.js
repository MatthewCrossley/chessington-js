import Player from '../player';
import Piece from './piece';
import Square from '../square'

export default class Pawn extends Piece {
    constructor(player) {
        super(player);
    }

    getAvailableMoves(board) {
        let baseRow = this.player == Player.WHITE? 1 : 6
        const currentSquare = board.findPiece(this)
        let moves = []

        for (let diag of [-1, 1]){
            let diagMove = this.squareFromCurrent(board, 1, diag)
            if (!board.availableSquare(diagMove) && this.canMoveTo(board, diagMove)){
                moves.push(diagMove)
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
}
