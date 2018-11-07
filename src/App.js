import React, {Component} from 'react'
import logo from './logo.svg'
import './App.css'
import HumanVsAI from './views/human-vs-ai'

class App extends Component {
	render() {
		return (
			<div style={boardsContainer}>
				<HumanVsAI />
			</div>
		)
	}
}

export default App

const boardsContainer = {
	display: 'flex',
	justifyContent: 'space-around',
	alignItems: 'center',
	flexWrap: 'wrap',
	width: '100vw',
	marginTop: 30,
	marginBottom: 50,
}
