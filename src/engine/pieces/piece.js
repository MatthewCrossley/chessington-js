import Player from "../player";
import Square from "../square";

export default class Piece {
    constructor(player) {
        this.player = player;
        this.moveHistory = [];
        this.cannotTake = false;
        this.canJump = false;
    }

    getMoveIncrements(){
        return []
    }

    getMoveVectors(board){
        let currentSquare = board.findPiece(this)
        let vectors = []
        for (let inc of this.getMoveIncrements()){
            let path = this.constructVectorPath(board, currentSquare, ...inc)
            vectors.push(path)
        }
        return vectors
    }

    filterMoveVectors(board, vectors, ignoreSquares){
        let result = []
        for (let group of vectors){
            for (let vector of group){
                if (this.canMoveTo(board, vector)){
                    result.push(vector)
                    if (ignoreSquares !== undefined && ignoreSquares.some(sq => sq.equals(vector))){
                        // if we should ignore any pieces in this square when
                        // deciding how far to calculate
                        continue
                    }
                    if (!board.availableSquare(vector)){
                        // don't compute beyond what we can take
                        break
                    }
                } else {
                    break
                }
            }
        }
        return result
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

    constructVectorPath(board, startPos, rowIncrement, colIncrement){
        let moves = []
        var lastMove = startPos
        while (true){
            let tmpMove = Square.at(lastMove.row + rowIncrement, lastMove.col + colIncrement)
            if (!board.squareExists(tmpMove)){
                break
            }
            moves.push(tmpMove)
            lastMove = tmpMove
        }
        return moves
    }

    checkAvailableMoves(board, currentSquare, rowIncrement, colIncrement){
        let moves = []
        for (let square of this.constructVectorPath(board, currentSquare, rowIncrement, colIncrement)){
            if (this.canMoveTo(board, square)){
                moves.push(square)
                if (!board.availableSquare(square)){
                    // we can move there but only to take a piece
                    // so break here so we don't calculate moves beyond this piece
                    break
                }
            }
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
