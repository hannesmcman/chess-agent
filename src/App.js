import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ChessBoard from 'react-chess'
import {disableBodyScroll} from 'body-scroll-lock'

class App extends Component {

  state = {
    pieces: ChessBoard.getDefaultLineup(),
  }

  componentDidMount() {
    const targetElement = document.querySelector('#root')
    disableBodyScroll(targetElement)
  }

  handleMovePiece = (piece, fromSquare, toSquare) => {
    const newPieces = this.state.pieces
      .map((curr, index) => {
        if (piece.index === index) {
          return `${piece.name}@${toSquare}`
        } else if (curr.indexOf(toSquare) === 2) {
          return false // To be removed from the board
        }
        return curr
      })
      .filter(Boolean)

    this.setState({pieces: newPieces})
  }

  render() {
    const {pieces} = this.state
    return (
      <div className="App">
        <ChessBoard
          pieces={pieces}
          onMovePiece={this.handleMovePiece}
        />
      </div>
    );
  }
}

export default App;
