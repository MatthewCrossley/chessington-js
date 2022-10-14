import Piece from './piece';

export default class Queen extends Piece {
    constructor(player) {
        super(player);
    }

    getMoveIncrements(){
        let increments = []
        for (let i = -1; i <= 1; i++){
            for (let j = -1; j <= 1; j++){
                if (i === 0 && j === 0){
                    continue
                }
                increments.push([i, j])
            }
        }
        return increments
    }

    _getAvailableMoves(board) {
        let moveVectors = this.getMoveVectors(board)
        return this.filterMoveVectors(board, moveVectors)
    }
}
