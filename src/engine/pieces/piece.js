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

    getCheckablePieces(board){
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
                return checkablePiece
            }
        }
    }

    getCheckedPieces(board){
        let checkablePiece = this.getCheckablePieces(board)
        if (checkablePiece.attackers.length > 0){
            return checkablePiece
        }
        // let checkConcluded = false
        // for (let i = 0; i < board.board.length; i++){
        //     for (let j = 0; j < board.board.length; j++){
        //         let checkablePiece = board.getPiece(Square.at(i, j))
        //         if (!checkablePiece){
        //             // if checkablePiece is undefined
        //             continue
        //         }
        //         if (checkablePiece.player !== this.player){
        //             continue
        //         }
        //         if (checkablePiece.cannotTake === false){
        //             continue
        //         }
        //         if (checkablePiece.attackers.length > 0){
        //             // if the piece's current square is checked, we cannot move.
        //             // Player MUST move the checkable piece
        //             return checkablePiece
        //         }
        //         checkConcluded = true
        //         break
        //     }
        //     if (checkConcluded){
        //         break
        //     }
        // }
    }

    flattenMoveVectors(moveVectors){
        let flat = []
        for (let arr of moveVectors){
            if (arr instanceof Square){
                flat.push(arr)
            } else {
                for (let move of arr){
                    flat.push(move)
                }
            }
        }
        return flat
    }

    filterCheckBlockingMoves(board, allMoves){
        let defender = this.getCheckablePieces(board)
        if (defender === undefined){
            return allMoves
        }
        let defenderPos = board.findPiece(defender)
        let currentSquare = board.findPiece(this)
        let invalids = []
        // get all peices that are not attacking that COULD check the king
        for (let i = 0; i < board.board.length; i++){
            for (let j = 0; j < board.board.length; j++){
                let p = board.getPiece(Square.at(i, j))
                if (p === undefined){
                    continue
                }
                if (p.player === this.player){
                    continue
                }
                let pVec = p.getMoveVectors(board)
                if (pVec.length === 0){
                    continue
                }
                let flatPVec = this.flattenMoveVectors(pVec)
                if (!flatPVec.some(i => defenderPos.equals(i))){
                    continue
                }
                for (let group of pVec){
                    if (group instanceof Square){
                        group = [group,]
                    }
                    let piecesInTheWay = []
                    for (let gSq of group){
                        if (!group.some(i => i.equals(currentSquare))){
                            continue
                        }
                        let atSq = board.getPiece(gSq)
                        if (atSq === undefined){
                            continue
                        }
                        if (atSq === defender){
                            break
                        }
                        piecesInTheWay.push(atSq)
                    }
                    if (piecesInTheWay.length === 1 && piecesInTheWay.includes(this)){
                        // if we are the only piece blocking this vector
                        if (group.some(i => i.equals(currentSquare))){
                            for (let move of allMoves){
                                // if we start in this vector and move out of it, thus opening the attack
                                if (!group.some(i => i.equals(move))){
                                    invalids.push(move)
                                }
                            }
                        }
                    }
                }
            }
        }

        return allMoves.filter(i => !invalids.some(j => i.equals(j)))
    }

    filterHeroMoves(board, allMoves, defender){
        function vectorContains(vecList, item){
            return vecList.some(i => i.equals(item))
        }

        function calculateAttackVector(board, attackerPos, defenderPos){
            let direction = [0, 0]
            if (attackerPos.row > defenderPos.row){
                // attacker is above defender
                direction[0] = -1
            } else if (attackerPos.row < defenderPos.row){
                // attacker is below defender
                direction[0] = 1
            }

            if (attackerPos.col > defenderPos.col){
                // attacker is right of defender
                direction[1] = -1
            } else if (attackerPos.col < defenderPos.col){
                // attacker is left of defender
                direction[1] = 1
            }

            let path = []
            for (let sq of this.constructVectorPath(board, attackerPos, ...direction)){
                path.push(sq)
                if (sq.equals(defenderPos)){
                    break
                }
            }
            return sq
        }

        let disruptiveMoves = []
        let requiredCount = defender.attackers.length
        let defenderPos = board.findPiece(defender)
        for (let attacker of defender.attackers){
            let attackerPos = board.findPiece(attacker)
            let attackerVectors = attacker.getMoveVectors(board)

            if (this.canMoveTo(board, attackerPos)){
                if (allMoves.some(i => attackerPos.equals(i))){
                    // can we take the attacker?
                    disruptiveMoves.push(attackerPos)
                }
            }

            if (attackerVectors.length === 0 && attacker.canJump){
                // attacker can jump. Only solution is to take the attacker
                continue
            }
            if (attackerVectors.length === 0){
                // attacker does not have static attack vectors.
                // We have to calculate what their current attack vector is
                let tmp = calculateAttackVector(board, attackerPos, defenderPos)
                attackerVectors = [tmp]
            }

            for (let vector of attackerVectors){
                if (vectorContains(vector, defenderPos)){
                    // if THIS is the vector that affects the defender
                    for (let move of allMoves){
                        if (vectorContains(vector, move)){
                            // if we can move into this vector to disrupt it
                            disruptiveMoves.push(move)
                        }
                    }
                }
            }
        }

        if (disruptiveMoves.length < requiredCount){
            return []
        }

        // now we have to find moves that are CONSISTENT across ALL attackers.
        // we can stop all of them or we can stop None of them

        let disruptive = []
        for (let move of disruptiveMoves){
            if (!disruptive.some(i => i.equals(move))){
                // not already in list
                if (disruptiveMoves.filter(i => move.equals(i)).length >= requiredCount){
                    // correct num of elements
                    disruptive.push(move)
                }
            }
        }

        // todo: don't let pieces move away from blocking a check

        return this.filterCheckBlockingMoves(board, disruptive)
    }

    getAvailableMoves(board, allowChecks=false){
        let allMoves = this._getAvailableMoves(board)

        if (allowChecks === false && this.cannotTake === false){
            let checkedPiece = this.getCheckedPieces(board)
            if (!!checkedPiece){
                // ok so we have a checked king. Can we move to fix that?
                return this.filterHeroMoves(board, allMoves, checkedPiece)
            }
        }

        if (allowChecks !== false){
            return this.filterCheckBlockingMoves(board, allMoves)
        }
        let moves = []
        for (let move of allMoves){
            let p = board.getPiece(move)
            if (p !== undefined && p.cannotTake === true){
                continue
            }
            moves.push(move)
        }
        return this.filterCheckBlockingMoves(board, moves)
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
                        if (checkablePiece.attackers.indexOf(this) === -1){
                            checkablePiece.attackers.push(this)
                        }
                    } else {
                        // remove
                        while (true){
                            let index = checkablePiece.attackers.indexOf(this)
                            if (index === -1){
                                break
                            }
                            checkablePiece.attackers.splice(index, 1)
                        }
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
