import maxBy from 'lodash/maxBy'
import OpeningExplorer from 'lichess-opening-explorer'
import {getEndGameMove} from './lichess'

const PIECE_VALUE = {
	p: 10,
	n: 30,
	b: 30,
	r: 50,
	q: 90,
	k: 900,
}

export function getBestMove(gameState, maxDepth, isWhite) {
	const fen = gameState.fen()
	// if (parseInt(fen[fen.length - 1]) > 3) {
	// 	console.log("Leaving explorer on purpose")
	// 	return alphabetaRoot(gameState, maxDepth, isWhite)
	// }
	const explorer = new OpeningExplorer()
	return explorer
		.analyze(fen, {
			master: false,
			variant: 'standard',
			speeds: ['classical'],
			ratings: [2000, 2200, 2500],
		})
		.then(analysis => {
			console.log(analysis)
			const {moves} = analysis
			const randomIndex = Math.floor(Math.random() * moves.length)
			return moves[randomIndex].san
		})
		.catch(async () => {
			const endGameMove = await getEndGameMove(gameState)
			if (endGameMove.dtm) {
				console.log(endGameMove)
				return endGameMove.san
			}
			return alphabetaRoot(gameState, maxDepth, isWhite)
		})
}

let numPos = 0

export function alphabetaRoot(gameState, maxDepth, isWhite) {
	const newGameMoves = gameState.moves()
	const bestMove = maxBy(newGameMoves, move => {
		gameState.move(move)
		const value = alphabeta(
			gameState,
			maxDepth - 1,
			Number.NEGATIVE_INFINITY,
			Number.POSITIVE_INFINITY,
			!isWhite,
		)
		gameState.undo()
		// console.log(move, value)
		return isWhite ? value : -value
	})
	console.log(bestMove)
	console.log('Positions evaluated: ', numPos)
	return bestMove
}

export function alphabeta(gameState, depth, alpha, beta, isMaximizingPlayer) {
	numPos++
	if (depth === 0 || gameState.game_over()) {
		// console.log(gameState, gameState.game_over())
		return heuristic(gameState)
	}
	if (isMaximizingPlayer) {
		let value = Number.NEGATIVE_INFINITY
		const moves = gameState.ugly_moves()
		for (let i = 0; i < moves.length; i++) {
			gameState.ugly_move(moves[i])
			value = Math.max(
				value,
				alphabeta(gameState, depth - 1, alpha, beta, !isMaximizingPlayer),
			)
			gameState.undo()
			alpha = Math.max(alpha, value)
			if (alpha >= beta) {
				break
			}
		}
		return value
	} else {
		let value = Number.POSITIVE_INFINITY
		const moves = gameState.ugly_moves()
		for (let i = 0; i < moves.length; i++) {
			gameState.ugly_move(moves[i])
			value = Math.min(
				value,
				alphabeta(gameState, depth - 1, alpha, beta, !isMaximizingPlayer),
			)
			gameState.undo()
			beta = Math.min(beta, value)
			if (alpha >= beta) {
				break
			}
		}
		return value
	}
}

function heuristic(gameState) {
	const board = gameState.board()
	// console.log(board)
	let boardSum = 0
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			boardSum += getPieceValue(board[y][x], x, y)
		}
	}
	if (gameState.game_over()) {
		// console.log("Game over: ", gameState.ascii(), gameState.turn(), boardSum)
		boardSum += gameState.turn() === 'b' ? PIECE_VALUE['k'] : -PIECE_VALUE['k']
		// console.log(boardSum)
	}
	return boardSum
}

const getPieceValue = (piece, x, y) => {
	if (piece === null) {
		return 0
	}
	const isWhite = piece.color === 'w'
	const pieceValue = isWhite
		? PIECE_VALUE[piece.type]
		: -PIECE_VALUE[piece.type]
	let locationValue
	switch (piece.type) {
		case 'p':
			locationValue = isWhite ? pawnEvalWhite[y][x] : -pawnEvalBlack[y][x]
			break
		case 'n':
			locationValue = isWhite ? knightEval[y][x] : -knightEval[y][x]
			break
		case 'b':
			locationValue = isWhite ? bishopEvalWhite[y][x] : -bishopEvalBlack[y][x]
			break
		case 'r':
			locationValue = isWhite ? rookEvalWhite[y][x] : -rookEvalBlack[y][x]
			break
		case 'q':
			locationValue = isWhite ? evalQueen[y][x] : -evalQueen[y][x]
			break
		case 'k':
			locationValue = isWhite ? kingEvalWhite[y][x] : -kingEvalBlack[y][x]
			break
		default:
			locationValue = 0
	}
	// console.log(piece, pieceValue, locationValue, pieceValue + locationValue)
	return pieceValue + locationValue
}

const reverseArray = function(array) {
	return array.slice().reverse()
}

const pawnEvalWhite = [
	[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
	[5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
	[1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
	[0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
	[0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
	[0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
	[0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
	[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
]

const pawnEvalBlack = reverseArray(pawnEvalWhite)

const knightEval = [
	[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
	[-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
	[-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
	[-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
	[-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
	[-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
	[-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
	[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
]

const bishopEvalWhite = [
	[-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
	[-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
	[-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
	[-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
	[-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
	[-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
	[-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
	[-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
]

const bishopEvalBlack = reverseArray(bishopEvalWhite)

const rookEvalWhite = [
	[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
	[0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0],
]

const rookEvalBlack = reverseArray(rookEvalWhite)

const evalQueen = [
	[-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
	[-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
	[-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
	[-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
	[0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
	[-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
	[-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
	[-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
]

const kingEvalWhite = [
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
	[-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
	[2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
	[2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0],
]

const kingEvalBlack = reverseArray(kingEvalWhite)
