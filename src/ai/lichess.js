const LICHESS_ENDGAME_URL = 'http://tablebase.lichess.ovh/standard?fen='

export function getEndGameMove(gameState) {
	const fen = gameState.fen()
	const formattedFen = fen.replace(' ', '_')
	return fetch(`${LICHESS_ENDGAME_URL}${formattedFen}`)
		.then(async resp => {
			const respJSON = await resp.json()
			return respJSON.moves && respJSON.moves.length !== 0
				? respJSON.moves[0]
				: null
		})
		.catch(() => {
			return null
		})
}
