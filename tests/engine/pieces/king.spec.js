import 'chai/register-should';
import King from '../../../src/engine/pieces/king';
import Pawn from '../../../src/engine/pieces/pawn';
import Knight from '../../../src/engine/pieces/knight';
import Board from '../../../src/engine/board';
import Player from '../../../src/engine/player';
import Square from '../../../src/engine/square';
import Rook from '../../../src/engine/pieces/rook';
import Queen from '../../../src/engine/pieces/queen';

describe('King', () => {

    let board;
    beforeEach(() => board = new Board());

    it('can move to adjacent squares', () => {
        const king = new King(Player.WHITE);
        board.setPiece(Square.at(3, 4), king);

        const moves = king.getAvailableMoves(board);

        const expectedMoves = [
            Square.at(2, 3), Square.at(2, 4), Square.at(2, 5), Square.at(3, 5),
            Square.at(4, 5), Square.at(4, 4), Square.at(4, 3), Square.at(3, 3)
        ];

        moves.should.deep.include.members(expectedMoves);
    });

    it('cannot make any other moves', () => {
        const king = new King(Player.WHITE);
        board.setPiece(Square.at(3, 4), king);

        const moves = king.getAvailableMoves(board);

        moves.should.have.length(8);
    });

    it('cannot leave the board', () => {
        const king = new King(Player.WHITE);
        board.setPiece(Square.at(0, 0), king);

        const moves = king.getAvailableMoves(board);

        const expectedMoves = [Square.at(0, 1), Square.at(1, 1), Square.at(1, 0)];

        moves.should.deep.have.members(expectedMoves);
    });

    it('can take opposing pieces', () => {
        const king = new King(Player.WHITE);
        const opposingPiece = new Pawn(Player.BLACK);
        board.setPiece(Square.at(4, 4), king);
        board.setPiece(Square.at(5, 5), opposingPiece);

        const moves = king.getAvailableMoves(board);

        moves.should.deep.include(Square.at(5, 5));
    });

    it('cannot take the opposing king', () => {
        const king = new King(Player.WHITE);
        const opposingKing = new King(Player.BLACK);
        board.setPiece(Square.at(4, 4), king);
        board.setPiece(Square.at(5, 5), opposingKing);

        const moves = king.getAvailableMoves(board);

        moves.should.not.deep.include(Square.at(5, 5));
    });

    it('cannot take friendly pieces', () => {
        const king = new King(Player.WHITE);
        const friendlyPiece = new Pawn(Player.WHITE);
        board.setPiece(Square.at(4, 4), king);
        board.setPiece(Square.at(5, 5), friendlyPiece);

        const moves = king.getAvailableMoves(board);

        moves.should.not.deep.include(Square.at(5, 5));
    });

    it('cannot move to a square that would put it in check', () => {
        const king = new King(Player.WHITE);
        const hostileKing = new King(Player.BLACK);
        const hostileKnight = new Knight(Player.BLACK)
        const hostilePawn = new Pawn(Player.BLACK);
        board.setPiece(Square.at(2, 5), king);
        board.setPiece(Square.at(2, 7), hostileKing);
        board.setPiece(Square.at(4, 3), hostileKnight);
        board.setPiece(Square.at(4, 5), hostilePawn);

        const moves = king.getAvailableMoves(board);

        // these are the positions the hostile pieces can "take"
        const cannotMoveTo = [
            Square.at(1, 6),  // covered by hostile king
            Square.at(3, 4),  // covered by hostile pawn
            Square.at(3, 5),  // covered by hostile knight
            Square.at(3, 6),  // covered by hostile pawn and king
            Square.at(4, 2),  // covered by hostile knight
            Square.at(4, 6)   // covered by hostile king
        ];
        moves.should.not.deep.include.members(cannotMoveTo);
    });

    describe('castling', () => {

        let board;
        beforeEach(() => board = new Board(Player.WHITE));

        it('can do castling', () => {
            const king = new King(Player.WHITE);
            const rookQueenSide = new Rook(Player.WHITE);
            const rookKingSide = new Rook(Player.WHITE);
            board.setPiece(Square.at(0, 4), king);
            board.setPiece(Square.at(0, 0), rookQueenSide);
            board.setPiece(Square.at(0, 7), rookKingSide);

            const moves = king.getAvailableMoves(board);
            moves.should.deep.include.members([Square.at(0, 2), Square.at(0, 6)])
        });

        it('cannot castle if piece is in the way', () => {
            const king = new King(Player.WHITE);
            const rookQueenSide = new Rook(Player.WHITE);
            const bishopQueenSide = new Rook(Player.WHITE);
            const bishopKingSide = new Rook(Player.WHITE);
            const rookKingSide = new Rook(Player.WHITE);
            board.setPiece(Square.at(0, 4), king);
            board.setPiece(Square.at(0, 0), rookQueenSide);
            board.setPiece(Square.at(0, 1), bishopQueenSide);
            board.setPiece(Square.at(0, 5), bishopKingSide);
            board.setPiece(Square.at(0, 7), rookKingSide);

            const moves = king.getAvailableMoves(board);
            moves.should.not.deep.include.members([Square.at(0, 2), Square.at(0, 6)])
        });

        it('cannot castle if king is in check', () => {
            const king = new King(Player.WHITE);
            const rookQueenSide = new Rook(Player.WHITE);
            const rookKingSide = new Rook(Player.WHITE);
            const hostileQueen = new Queen(Player.BLACK);
            board.setPiece(Square.at(0, 4), king);
            board.setPiece(Square.at(0, 0), rookQueenSide);
            board.setPiece(Square.at(0, 7), rookKingSide);
            board.setPiece(Square.at(2, 4), hostileQueen);

            const moves = king.getAvailableMoves(board);
            moves.should.not.deep.include.members([Square.at(0, 2), Square.at(0, 6)])
        });

        it('cannot castle if moving through check', () => {
            const king = new King(Player.WHITE);
            const rookQueenSide = new Rook(Player.WHITE);
            const rookKingSide = new Rook(Player.WHITE);
            const hostileQueen = new Queen(Player.BLACK);
            board.setPiece(Square.at(0, 4), king);
            board.setPiece(Square.at(0, 0), rookQueenSide);
            board.setPiece(Square.at(0, 7), rookKingSide);
            board.setPiece(Square.at(2, 3), hostileQueen);

            const moves = king.getAvailableMoves(board);
            moves.should.not.deep.include.members([Square.at(0, 2), Square.at(0, 6)])
        });

        it('cannot castle if moving into check', () => {
            const king = new King(Player.WHITE);
            const rookQueenSide = new Rook(Player.WHITE);
            const rookKingSide = new Rook(Player.WHITE);
            const hostileQueen = new Queen(Player.BLACK);
            board.setPiece(Square.at(0, 4), king);
            board.setPiece(Square.at(0, 0), rookQueenSide);
            board.setPiece(Square.at(0, 7), rookKingSide);
            board.setPiece(Square.at(4, 2), hostileQueen);

            const moves = king.getAvailableMoves(board);
            moves.should.not.deep.include.members([Square.at(0, 2), Square.at(0, 6)])
        });

        it('can castle if rook is checked', () => {
            const king = new King(Player.WHITE);
            const rookQueenSide = new Rook(Player.WHITE);
            const rookKingSide = new Rook(Player.WHITE);
            const hostileQueen = new Queen(Player.BLACK);
            board.setPiece(Square.at(0, 4), king);
            board.setPiece(Square.at(0, 0), rookQueenSide);
            board.setPiece(Square.at(0, 7), rookKingSide);
            board.setPiece(Square.at(7, 0), hostileQueen);

            const moves = king.getAvailableMoves(board);
            moves.should.deep.include.members([Square.at(0, 2), Square.at(0, 6)])
        });

        it('queenside rook can move through check when castling', () => {
            const king = new King(Player.WHITE);
            const rookQueenSide = new Rook(Player.WHITE);
            const hostileQueen = new Queen(Player.BLACK);
            board.setPiece(Square.at(0, 4), king);
            board.setPiece(Square.at(0, 0), rookQueenSide);;
            board.setPiece(Square.at(7, 1), hostileQueen);

            const moves = king.getAvailableMoves(board);
            moves.should.deep.include(Square.at(0, 2))
        });
    });
});
