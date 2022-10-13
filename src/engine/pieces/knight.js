import Piece from './piece';
import Square from '../square'

export default class Knight extends Piece {
    constructor(player) {
        super(player);
    }

    _getAvailableMoves(board) {
        let moves = []

        let currentSquare = board.findPiece(this)

        for (let i of [-2, -1, 1, 2]){
            for (let j of [-2, -1, 1, 2]){
                if (Math.abs(i) === Math.abs(j)){
                    continue
                }
                let tmpMove = Square.at(currentSquare.row + i, currentSquare.col + j)
                if (this.canMoveTo(board, tmpMove)){
                    moves.push(tmpMove)
                }
            }
        }

        return moves;
    }
}
