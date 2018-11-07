import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Chess from 'chess.js' // import Chess from  "chess.js"(default) if recieving an error about new Chess() not being a constructor
import {getRandomMove} from '../ai/random'
import Chessboard from 'chessboardjsx'

const game = new Chess()

class HumanVsAI extends Component {
	static propTypes = {children: PropTypes.func}

	state = {
		fen: 'start',
		// square styles for active drop square
		dropSquareStyle: {},
		// custom square styles
		squareStyles: {},
		// square with the currently clicked piece
		pieceSquare: '',
		// currently clicked square
		square: '',
		// array of past game moves
		history: [],
	}

	componentDidMount() {
		this.setState({fen: game.fen()})
	}

	// keep clicked square style and remove hint squares
	removeHighlightSquare = () => {
		this.setState(({pieceSquare, history}) => ({
			squareStyles: squareStyling({pieceSquare, history}),
		}))
	}

	// show possible moves
	highlightSquare = (sourceSquare, squaresToHighlight) => {
		const highlightStyles = [sourceSquare, ...squaresToHighlight].reduce(
			(a, c) => {
				return {
					...a,
					...{
						[c]: {
							background: 'rgba(50,205,50,0.4)',
						},
					},
					...squareStyling({
						history: this.state.history,
						pieceSquare: this.state.pieceSquare,
					}),
				}
			},
			{},
		)

		this.setState(({squareStyles}) => ({
			squareStyles: {...squareStyles, ...highlightStyles},
		}))
	}

	onDrop = ({sourceSquare, targetSquare}) => {
		// see if the move is legal
		let move = game.move({
			from: sourceSquare,
			to: targetSquare,
			promotion: 'q', // always promote to a queen for example simplicity
		})

		// illegal move
		if (move === null) return

		return new Promise(resolve => {
			this.setState(() => ({
				fen: game.fen(),
			}))
			resolve()
			this.updateHistory()
		}).then(() =>
			setTimeout(() => {
				this.makeAIMove()
			}, 500),
		)
	}

	makeAIMove = () => {
		if (game.game_over()) {
			console.log('GAME OVER')
		}
		const aiMove = getRandomMove(game)
		game.move(aiMove)
		this.setState(() => ({
			fen: game.fen(),
		}))
		this.updateHistory()
	}

	updateHistory = () => {
		const history = game.history({verbose: true})
		this.setState(({pieceSquare}) => ({
			history: history,
			squareStyles: squareStyling({pieceSquare, history}),
		}))
	}

	onMouseOverSquare = square => {
		// get list of possible moves for this square
		let moves = game.moves({
			square: square,
			verbose: true,
		})

		// exit if there are no moves available for this square
		if (moves.length === 0) return

		let squaresToHighlight = []
		for (var i = 0; i < moves.length; i++) {
			squaresToHighlight.push(moves[i].to)
		}

		this.highlightSquare(square, squaresToHighlight)
	}

	onMouseOutSquare = square => this.removeHighlightSquare(square)

	render() {
		const {fen, dropSquareStyle, squareStyles} = this.state
		return this.props.children({
			squareStyles,
			position: fen,
			onMouseOverSquare: this.onMouseOverSquare,
			onMouseOutSquare: this.onMouseOutSquare,
			onDrop: this.onDrop,
			dropSquareStyle,
		})
	}
}

export default function WithMoveValidation() {
	return (
		<div>
			<HumanVsAI>
				{({
					position,
					onDrop,
					onMouseOverSquare,
					onMouseOutSquare,
					squareStyles,
					dropSquareStyle,
				}) => (
					<Chessboard
						id="HumanVsAI"
						width={window.innerWidth / 2}
						position={position}
						onDrop={onDrop}
						onMouseOverSquare={onMouseOverSquare}
						onMouseOutSquare={onMouseOutSquare}
						boardStyle={{
							borderRadius: '5px',
							boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`,
						}}
						squareStyles={squareStyles}
						dropSquareStyle={dropSquareStyle}
					/>
				)}
			</HumanVsAI>
		</div>
	)
}

const squareStyling = ({pieceSquare, history}) => {
	const sourceSquare = history.length && history[history.length - 1].from
	const targetSquare = history.length && history[history.length - 1].to

	return {
		[pieceSquare]: {backgroundColor: 'rgba(255, 255, 0, 0.4)'},
		...(history.length && {
			[sourceSquare]: {
				backgroundColor: 'rgba(255, 255, 0, 0.4)',
			},
		}),
		...(history.length && {
			[targetSquare]: {
				backgroundColor: 'rgba(255, 255, 0, 0.4)',
			},
		}),
	}
}
