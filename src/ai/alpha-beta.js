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

export function getBestMove(gameState, maxDepth) {
	const fen = gameState.fen()
	// if (parseInt(fen[fen.length-1]) > 3) {
	//   return alphabetaRoot(gameState, maxDepth)
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
			return moves[Math.floor(Math.random() * moves.length)].san
		})
		.catch(err => {
			return alphabetaRoot(gameState, maxDepth)
		})
}

export function alphabetaRoot(gameState, maxDepth) {
	const newGameMoves = gameState.moves()
	return maxBy(newGameMoves, move => {
		gameState.move(move)
		const value = alphabeta(
			gameState,
			maxDepth - 1,
			Number.NEGATIVE_INFINITY,
			Number.POSITIVE_INFINITY,
			true,
		)
		console.log(move, value)
		gameState.undo()
		return value
	})
}

export function alphabeta(gameState, depth, alpha, beta, isMaximizingPlayer) {
	if (depth === 0 || gameState.game_over()) {
		// console.log(heuristic(gameState))
		return heuristic(gameState)
	}
	if (isMaximizingPlayer) {
		let value = Number.NEGATIVE_INFINITY
		for (const move in gameState.moves()) {
			const newGameState = Object.assign(Object.create(gameState), gameState)
			newGameState.move(move)
			value = Math.max(
				value,
				alphabeta(newGameState, depth - 1, alpha, beta, false),
			)
			alpha = Math.max(alpha, value)
			if (alpha >= beta) {
				break
			}
		}
		return value
	} else {
		let value = Number.POSITIVE_INFINITY
		for (const move in gameState.moves()) {
			const newGameState = Object.assign(Object.create(gameState), gameState)
			newGameState.move(move)
			value = Math.min(
				value,
				alphabeta(newGameState, depth - 1, alpha, beta, true),
			)
			beta = Math.min(beta, value)
			if (alpha >= beta) {
				break
			}
			return value
		}
	}
}

function heuristic(gameState) {
	const whiteToMove = gameState.turn() === 'w'
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
	return whiteToMove ? boardSum : -boardSum
}
