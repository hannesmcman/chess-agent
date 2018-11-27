export const getRandomMove = game => {
	const newGameMoves = game.moves()
	return newGameMoves[Math.floor(Math.random() * newGameMoves.length)]
}
