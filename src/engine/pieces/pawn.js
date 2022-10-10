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

        let oneSpaceMove = this.squareFromCurrent(board, 1, 0)
        if (board.availableSquare(oneSpaceMove)){
            moves.push(oneSpaceMove)
            
            let twoSpaceMove = this.squareFromCurrent(board, 2, 0)
            if (currentSquare.row == baseRow && board.availableSquare(twoSpaceMove)){
                moves.push(twoSpaceMove)
            }
        }

        return moves;
    }
}
