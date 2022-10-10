import Piece from './piece';
import Square from '../square'

export default class Bishop extends Piece {
    constructor(player) {
        super(player);
    }

    getAvailableMoves(board) {
        let moves = []

        const currentSquare = board.findPiece(this)

        let increments = [[1,1], [1,-1], [-1,1], [-1,-1]]
        for (let inc of increments){
            let rowInc = inc[0]
            let colInc = inc[1]
            var lastMove = currentSquare
            while (true) {
                let tmpMove = Square.at(lastMove.row + rowInc, lastMove.col + colInc)
                if (board.availableSquare(tmpMove)){
                    moves.push(tmpMove)
                } else {
                    break
                }
                lastMove = tmpMove
            }
        }

        return moves;
    }
}
