import Player from "../player";
import Square from "../square";

export default class Piece {
    constructor(player) {
        this.player = player;
    }

    getAvailableMoves(board) {
        throw new Error('This method must be implemented, and return a list of available moves');
    }

    moveTo(board, newSquare) {
        const currentSquare = board.findPiece(this);
        board.movePiece(currentSquare, newSquare);
    }

    squareFromCurrent(board, rows, cols){
        let direction = this.player == Player.WHITE? 1: -1
        const currentSquare = board.findPiece(this)
        return Square.at(
            currentSquare.row + (rows === 0 ? 0 : rows * direction),
            currentSquare.col + (cols === 0 ? 0 : cols * direction)
        )
    }
}
