import 'chai/register-should.js';
import Board from '../../src/engine/board.js';
import Pawn from '../../src/engine/pieces/pawn.js';
import Player from '../../src/engine/player.js';
import Square from '../../src/engine/square.js';

describe('Board', () => {

    describe('pawns', () => {

        let board;
        beforeEach(() => { // Common code executed before each test.
            board = new Board();
        });

        it('can be added to the board', () => {
            // Arrange
            const pawn = new Pawn(Player.WHITE);
            const square = Square.at(0, 0);

            // Act
            board.setPiece(square, pawn);

            // Assert
            board.getPiece(square).should.equal(pawn); // Object equality: same object reference
        });

        it('can be found on the board', () => {
            // Arrange
            const pawn = new Pawn(Player.WHITE);
            const square = Square.at(6, 4);

            // Act
            board.setPiece(square, pawn);

            // Assert
            board.findPiece(pawn).should.eql(square); // Object equivalence: different objects, same data
        });

    });
});
