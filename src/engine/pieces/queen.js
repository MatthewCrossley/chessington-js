import Piece from './piece';

export default class Queen extends Piece {
    constructor(player) {
        super(player);
    }

    _getAvailableMoves(board) {
        let moves = []

        const currentSquare = board.findPiece(this)

        for (let i = -1; i <= 1; i++){
            for (let j = -1; j <= 1; j++){
                if (i === 0 && j === 0){
                    continue
                }
                moves.push.apply(moves, this.checkAvailableMoves(board, currentSquare, i, j))
            }
        }

        return moves;
    }
}
