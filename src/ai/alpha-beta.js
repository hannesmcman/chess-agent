import reduce from 'lodash/reduce'
import maxBy from 'lodash/maxBy'
import OpeningExplorer from 'lichess-opening-explorer'

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
	if (parseInt(fen[fen.length - 1]) > 3) {
		return alphabetaRoot(gameState, maxDepth, isWhite)
	}
	const explorer = new OpeningExplorer()
	return explorer
		.analyze(fen, {
			master: true,
			variant: 'standard',
			speeds: ['classical'],
		})
		.then(analysis => {
			console.log(analysis)
			const {moves} = analysis
			const randomIndex = Math.floor(Math.random() * moves.length)
			return moves[randomIndex].san
		})
		.catch(() => {
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
			false,
			isWhite,
		)
		gameState.undo()
		console.log(move, value)
		return value
	})
	console.log('Positions evaluated: ', numPos)
	return bestMove
}

export function alphabeta(
	gameState,
	depth,
	alpha,
	beta,
	isMaximizingPlayer,
	isWhite,
) {
	numPos++
	if (depth === 0 || gameState.game_over()) {
		console.log(gameState, gameState.game_over())
		return heuristic(gameState, isWhite)
	}
	if (isMaximizingPlayer) {
		let value = Number.NEGATIVE_INFINITY
		const moves = gameState.ugly_moves()
		for (let i = 0; i < moves.length; i++) {
			gameState.ugly_move(moves[i])
			value = Math.max(
				value,
				alphabeta(
					gameState,
					depth - 1,
					alpha,
					beta,
					!isMaximizingPlayer,
					isWhite,
				),
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
				alphabeta(
					gameState,
					depth - 1,
					alpha,
					beta,
					!isMaximizingPlayer,
					isWhite,
				),
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

function heuristic(gameState, isWhite) {
	if (gameState.game_over()) {
		return isWhite ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
	}
	const boardSum = reduce(
		gameState.SQUARES,
		(sum, square) => {
			const squareState = gameState.get(square)
			if (squareState === null) {
				return sum
			}
			const value =
				squareState.color === 'w'
					? PIECE_VALUE[squareState.type]
					: -PIECE_VALUE[squareState.type]
			return sum + value
		},
		0,
	)
	return isWhite ? boardSum : -boardSum
}
