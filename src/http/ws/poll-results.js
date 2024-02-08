import { z } from 'zod'
import { voting } from '../../utils/voting-pub-sub.js'

export async function pollResults(app) {
    app.get('/polls/:pollId/results', { websocket: true }, (connection, request) => {
        const getPollResultsParams = z.object({
            pollId: z.string().uuid()
        })

        const { pollId } = getPollResultsParams.parse(request.params)

        voting.subscribe(pollId, (message) => {
            connection.socket.send(JSON.stringify(message))
        })
    })
}
