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
			// console.log(analysis)
			const {moves} = analysis
			return moves[Math.floor(Math.random() * moves.length)].san
		})
		.catch(() => {
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
		// console.log(move, value)
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
		const moves = gameState.moves()
		for (let i = 0; i < moves.length; i++) {
			gameState.move(moves[i])
			value = Math.max(
				value,
				alphabeta(gameState, depth - 1, alpha, beta, false),
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
		const moves = gameState.moves()
		for (let i = 0; i < moves.length; i++) {
			gameState.move(moves[i])
			value = Math.min(
				value,
				alphabeta(gameState, depth - 1, alpha, beta, true),
			)
			gameState.undo()
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
