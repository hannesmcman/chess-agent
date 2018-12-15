import React, {Component} from 'react'
import Select from 'react-select'
import {Button} from 'reactstrap'
import './App.css'
import {HumanVsAI} from './views/human-vs-ai'
import {Helmet} from 'react-helmet'

const options = [
	{value: 'black', label: 'Black'},
	{value: 'white', label: 'White'},
]

class App extends Component {
	state = {
		inGame: false,
		userColor: options[1],
	}

	componentDidMount() {}

	handleSubmit = () => {
		this.setState(() => ({inGame: true}))
	}

	handleChange = userColor => {
		this.setState(() => ({userColor}))
	}

	render() {
		if (!this.state.inGame) {
			return (
				<div style={styles.container}>
					<div style={styles.dialogue}>
						<Helmet>
							<title>Killer Instinct</title>
							<meta
								name="Description"
								content="Introduction to artificial intelligence final project."
							/>
							<link
								rel="shortcut icon"
								type="image/x-icon"
								href="/favicon.ico"
							/>
						</Helmet>
						<h1>Let&apos;s Play Chess!</h1>
						<div style={styles.select}>
							<Select
								className="select"
								onChange={this.handleChange}
								options={options}
								value={this.state.userColor}
							/>
						</div>
						<div style={styles.select}>
							<Button color="success" onClick={this.handleSubmit}>
								Play!
							</Button>
						</div>
					</div>
				</div>
			)
		}
		return (
			<div style={styles.boardsContainer}>
				<Helmet>
					<title>Killer Instinct</title>
					<meta
						name="Description"
						content="Introduction to artificial intelligence final project."
					/>
					<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
				</Helmet>
				<HumanVsAI userColor={this.state.userColor.value} />
			</div>
		)
	}
}

export default App

const styles = {
	boardsContainer: {
		display: 'flex',
		justifyContent: 'space-around',
		alignItems: 'center',
		flexWrap: 'wrap',
		width: '100vw',
		marginTop: 30,
		marginBottom: 50,
	},
	container: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100vh',
	},
	dialogue: {
		width: '50vw',
		textAlign: 'center',
	},
	select: {
		display: 'flex',
		justifyContent: 'center',
		marginBottom: 20,
	},
}
