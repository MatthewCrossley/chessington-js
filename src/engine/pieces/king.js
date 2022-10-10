import Piece from './piece';
import Square from '../square'

export default class King extends Piece {
    constructor(player) {
        super(player);
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
                if (board.availableSquare(tmpMove)){
                    moves.push(tmpMove)
                }
            }
        }

        return moves;
    }
}
