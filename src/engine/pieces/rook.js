import Piece from './piece';

export default class Rook extends Piece {
    constructor(player) {
        super(player);
    }

    getMoveIncrements(){
        return [[1,0], [-1,0], [0,1], [0,-1]]
    }

    _getAvailableMoves(board) {
        let moveVectors = this.getMoveVectors(board)
        return this.filterMoveVectors(board, moveVectors)
    }
}
