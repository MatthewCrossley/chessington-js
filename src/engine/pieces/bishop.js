import Piece from './piece';

export default class Bishop extends Piece {
    constructor(player) {
        super(player);
    }

    getMoveIncrements(){
        return [[1,1], [1,-1], [-1,1], [-1,-1]]
    }
    _getAvailableMoves(board) {
        let moveVectors = this.getMoveVectors(board)
        return this.filterMoveVectors(board, moveVectors)
    }
}
