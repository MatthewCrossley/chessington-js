import Square from '../square';
import Piece from './piece';

export default class Rook extends Piece {
    constructor(player) {
        super(player);
    }

    getAvailableMoves(board) {
        let moves = []

        const currentSquare = board.findPiece(this)

        for (let inc of [[1,0], [-1,0], [0,1], [0,-1]]){
            moves.push.apply(moves, this.checkAvailableMoves(board, currentSquare, ...inc))
        }

        return moves;
    }
}
