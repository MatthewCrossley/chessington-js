import Player from "../player";
import Square from "../square";

export default class Piece {
    constructor(player) {
        this.player = player;
        this.moveHistory = [];
        this.cannotTake = false;
    }

    _getAvailableMoves(board) {
        throw new Error('This method must be implemented, and return a list of available moves');
    }

    getCheckedPieces(board){
        let checkConcluded = false
        for (let i = 0; i < board.board.length; i++){
            for (let j = 0; j < board.board.length; j++){
                let checkablePiece = board.getPiece(Square.at(i, j))
                if (!checkablePiece){
                    // if checkablePiece is undefined
                    continue
                }
                if (checkablePiece.player !== this.player){
                    continue
                }
                if (checkablePiece.cannotTake === false){
                    continue
                }
                if (Object.keys(checkablePiece.attackers).length > 0){
                    // if the piece's current square is checked, we cannot move.
                    // Player MUST move the checkable piece
                    return checkablePiece
                }
                checkConcluded = true
                break
            }
            if (checkConcluded){
                break
            }
        }
    }

    getAvailableMoves(board, allowChecks=false){
        if (allowChecks === false && this.cannotTake === false){
            let checkedPiece = this.getCheckedPieces(board)
            if (!!checkedPiece){
                return []
            }
        }

        let allMoves = this._getAvailableMoves(board)
        if (allowChecks !== false){
            return allMoves
        }
        let moves = []
        for (let move of allMoves){
            let p = board.getPiece(move)
            if (p !== undefined && p.cannotTake === true){
                continue
            }
            moves.push(move)
        }
        return moves
    }

    updateCheckablePieces(board){
        if (this.cannotTake === false){
            let checkConcluded = false
            for (let i = 0; i < board.board.length; i++){
                for (let j = 0; j < board.board.length; j++){
                    let checkablePiece = board.getPiece(Square.at(i, j))
                    // check that all pieces that cannot be taken (ie: the king)
                    // are not in check
                    if (!checkablePiece || checkablePiece.cannotTake === false){
                        continue
                    }
                    if (checkablePiece.player === this.player){
                        continue
                    }
                    if (this.canCheck(board, Square.at(i, j))){
                        checkablePiece.attackers[this] = this.getAvailableMoves(board, {allowChecks: true})
                    } else if (this in checkablePiece.attackers){
                        // cannot check, still in attackers list. Have to remove ourselves
                        delete checkablePiece.attackers[this]
                    }
                    checkConcluded = true
                    break
                }
                if (checkConcluded){
                    break
                }
            }
        }
    }

    moveTo(board, newSquare) {
        const currentSquare = board.findPiece(this);
        board.movePiece(currentSquare, newSquare);
        if (this.moveHistory.length === 0 || !this.moveHistory.at(-1).equals(currentSquare)){
            this.moveHistory.push(currentSquare)
        }
        this.moveHistory.push(newSquare)
        this.updateCheckablePieces(board)
    }

    squareFromCurrent(board, rows, cols){
        let direction = this.player == Player.WHITE? 1: -1
        const currentSquare = board.findPiece(this)
        return Square.at(
            currentSquare.row + (rows === 0 ? 0 : rows * direction),
            currentSquare.col + (cols === 0 ? 0 : cols * direction)
        )
    }

    canMoveTo(board, square, allowTakes=true){
        if (board.availableSquare(square)){
            return true
        }
        if (allowTakes !== true){
            return false
        }
        if (board.squareExists(square)){
            // square not available. Check if there is a piece there we can take
            let takePiece = board.getPiece(square)
            return (takePiece !== undefined && takePiece.player !== this.player)
        }
        return false
    }

    checkAvailableMoves(board, currentSquare, rowIncrement, colIncrement){
        let moves = []
        var lastMove = currentSquare
        while (true){
            let tmpMove = Square.at(lastMove.row + rowIncrement, lastMove.col + colIncrement)
            if (this.canMoveTo(board, tmpMove)){
                moves.push(tmpMove)
                if (!board.availableSquare(tmpMove)){
                    // we can move there but only to take a piece
                    // so break here so we don't calculate moves beyond this piece
                    break
                }
            } else {
                break
            }
            lastMove = tmpMove
        }
        return moves
    }

    canCheck(board, square){
        let p = board.getPiece(square)
        if (p !== undefined && p.player === this.player){
            return false
        }

        return this.getAvailableMoves(board, {allowChecks: true}).some(item => square.equals(item))
    }
}
