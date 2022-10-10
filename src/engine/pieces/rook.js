import Square from '../square';
import Piece from './piece';

export default class Rook extends Piece {
    constructor(player) {
        super(player);
    }

    getAvailableMoves(board) {
        function checkRange(from, to, squareMaker) {
            let moves = []
            if (from < to){
                var chk = (i) => i < to;
                var inc = 1
            } else {
                var chk = i => i > to;
                var inc = -1
            }

            for (let i = from; chk(i); i+=inc) {
                let tmpMove = squareMaker(i)
                if (board.availableSquare(tmpMove)) {
                    moves.push(tmpMove)
                } else {
                    break
                }
            }
            return moves
        }

        const currentSquare = board.findPiece(this)

        let vertSquareMaker = (i, c=currentSquare.col) => { return Square.at(i, c) }
        let horiSquareMaker = (i, r=currentSquare.row) => { return Square.at(r, i) }
        let moves = [].concat(
            // check all squares above the corrent position
            checkRange(currentSquare.row + 1, board.board.length, vertSquareMaker),
            // check all squares below the current position
            checkRange(currentSquare.row - 1, -1, vertSquareMaker),
            // check all squares to the right
            checkRange(currentSquare.col + 1, board.board.length, horiSquareMaker),
            // check all squares to the left
            checkRange(currentSquare.col - 1, -1, horiSquareMaker)
        )

        return moves;
    }
}
