import Player from './player';
import GameSettings from './gameSettings';
import Square from './square';
import King from './pieces/king';

export default class Board {
    constructor(currentPlayer) {
        this.currentPlayer = currentPlayer ? currentPlayer : Player.WHITE;
        this.board = this.createBoard();
    }

    createBoard() {
        const board = new Array(GameSettings.BOARD_SIZE);
        for (let i = 0; i < board.length; i++) {
            board[i] = new Array(GameSettings.BOARD_SIZE);
        }
        return board;
    }

    squareExists(square){
        if (square.col < 0 || square.col >= this.board.length){
            return false
        }
        if (square.row < 0 || square.row >= this.board.length){
            return false
        }
        return true
    }

    availableSquare(square){
        if (!this.squareExists(square)){
            return false
        }

        return (!this.getPiece(square))
    }

    setPiece(square, piece) {
        this.board[square.row][square.col] = piece;
    }

    getPiece(square) {
        return this.board[square.row][square.col];
    }

    findPiece(pieceToFind) {
        for (let row = 0; row < this.board.length; row++) {
            for (let col = 0; col < this.board[row].length; col++) {
                if (this.board[row][col] === pieceToFind) {
                    return Square.at(row, col);
                }
            }
        }
        throw new Error('The supplied piece is not on the board');
    }

    movePiece(fromSquare, toSquare) {
        const movingPiece = this.getPiece(fromSquare);        
        if (!!movingPiece && movingPiece.player === this.currentPlayer) {
            this.setPiece(toSquare, movingPiece);
            this.setPiece(fromSquare, undefined);
            this.currentPlayer = (this.currentPlayer === Player.WHITE ? Player.BLACK : Player.WHITE);

            if (movingPiece instanceof King){
                movingPiece.updateAttackers(this);
            } else {
                for (let i = 0; i < this.board.length; i++){
                    for (let j = 0; j < this.board.length; j++){
                        let sq = Square.at(i, j)
                        let p = this.getPiece(sq)
                        if (p !== undefined && p.player === this.currentPlayer && p instanceof King){
                            p.updateAttackers(this);
                            return
                        }
                    }
                }
            }
        }
    }
}
