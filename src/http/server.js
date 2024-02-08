import fastify from 'fastify'
import { createPoll } from './routes/create-poll.js'
import { getPoll } from './routes/get-poll.js'
import { voteOnPoll } from './routes/vote-on-poll.js'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import { pollResults } from './ws/poll-results.js'

const app = fastify()

app.register(cookie, {
    secret: 'polls-app-nlw',
    hook: 'onRequest'
})

app.register(websocket)
app.register(cors)
app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)
app.register(pollResults)

app.listen({ port: 3333 }).then(() => {
    console.log('HTTP server running!')
})
