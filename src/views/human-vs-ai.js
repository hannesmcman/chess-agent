import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Chess from 'chess.js'
import {getBestMove} from '../ai/alpha-beta'
import Chessboard from 'chessboardjsx'

const getBoardWidth = (width, height) => {
	if (width < height) {
		return width - width/10
	} else {
		return height - height/10
	}
}

export class HumanVsAI extends Component {
	static propTypes = {children: PropTypes.func, userColor: PropTypes.string}

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
		boardWidth: getBoardWidth(window.innerWidth, window.innerHeight),
	}

	componentDidMount() {
		this.game = new Chess()
		window.addEventListener('resize', this.updateDimensions)
		if (this.props.userColor === 'black') {
			setTimeout(() => {
				this.makeAIMove()
			}, 500)
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateDimensions)
	}

	game = undefined

	updateDimensions = () => {
		this.setState(() => ({boardWidth: window.innerWidth / 2}))
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
		let move = this.game.move({
			from: sourceSquare,
			to: targetSquare,
			promotion: 'q', // always promote to a queen for example simplicity
		})

		// illegal move
		if (move === null) return

		return new Promise(resolve => {
			this.setState(() => ({
				fen: this.game.fen(),
			}))
			resolve()
			this.updateHistory()
		}).then(() =>
			setTimeout(() => {
				this.makeAIMove()
			}, 500),
		)
	}

	makeAIMove = async () => {
		if (this.game.game_over()) {
			// console.log('GAME OVER')
			this.resetGame()
		}
		// const aiMove = getRandomMove(game)
		const isWhite = this.props.userColor === 'black'
		const d = new Date().getTime()
		const aiMove = await getBestMove(this.game, 4, isWhite)
		const d2 = new Date().getTime()
		console.log('Time: ', (d2 - d) / 1000)
		this.game.move(aiMove)
		this.setState(() => ({
			fen: this.game.fen(),
		}))
		this.updateHistory()
	}

	resetGame = () => {
		this.game = new Chess()
	}

	allowDrag = ({piece}) => {
		return piece[0] === this.props.userColor[0]
	}

	updateHistory = () => {
		const history = this.game.history({verbose: true})
		this.setState(({pieceSquare}) => ({
			history: history,
			squareStyles: squareStyling({pieceSquare, history}),
		}))
	}

	onMouseOverSquare = square => {
		// get list of possible moves for this square
		let moves = this.game.moves({
			square: square,
			verbose: true,
		})

		// exit if there are no moves available for this square
		if (moves.length === 0) return

		let squaresToHighlight = []
		for (let i = 0; i < moves.length; i++) {
			squaresToHighlight.push(moves[i].to)
		}

		this.highlightSquare(square, squaresToHighlight)
	}

	onMouseOutSquare = square => this.removeHighlightSquare(square)

	render() {
		const {fen, dropSquareStyle, squareStyles, boardWidth} = this.state

		return (
			<Chessboard
				allowDrag={this.allowDrag}
				boardStyle={{
					borderRadius: '5px',
					boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
				}}
				dropSquareStyle={dropSquareStyle}
				id="HumanVsAI"
				onDrop={this.onDrop}
				onMouseOutSquare={this.onMouseOutSquare}
				onMouseOverSquare={this.onMouseOverSquare}
				onSquareClick={this.onMouseOverSquare}
				position={fen}
				squareStyles={squareStyles}
				width={boardWidth}
			/>
		)
	}
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
