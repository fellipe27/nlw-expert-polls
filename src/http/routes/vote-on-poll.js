import z from 'zod'
import { prisma } from '../../lib/prisma.js'
import { randomUUID } from 'node:crypto'
import { voting } from '../../utils/voting-pub-sub.js'

export async function voteOnPoll(app) {
    app.post('/polls/:pollId/votes', async (request, reply) => {
        const voteOnPollParams = z.object({
            pollId: z.string().uuid()
        })

        const voteOnPollBody = z.object({
            pollOptionId: z.string().uuid()
        })

        const { pollId } = voteOnPollParams.parse(request.params)
        const { pollOptionId } = voteOnPollBody.parse(request.body)

        let { sessionId } = request.cookies

        if (sessionId) {
            const userPreviousVoteOnPoll = await prisma.vote.findUnique({
                where: {
                    sessionId_pollId: {
                        sessionId,
                        pollId
                    }
                }
            })

            if (userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionId !== pollOptionId) {
                await prisma.vote.delete({
                    where: {
                        id: userPreviousVoteOnPoll.id
                    }
                })

                const votesAmount = await prisma.pollOption.update({
                    where: {
                        id: userPreviousVoteOnPoll.pollOptionId
                    },
                    data: {
                        votesAmount: {
                            decrement: 1
                        }
                    }
                })

                voting.publish(pollId, {
                    pollOptionId: userPreviousVoteOnPoll.pollOptionId,
                    votes: Number(votesAmount.votesAmount)
                })
            } else if (userPreviousVoteOnPoll) {
                return reply.status(400).send({ message: 'You already voted on this poll.' })
            }
        }

        if (!sessionId) {
            sessionId = randomUUID()

            reply.setCookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30,
                signed: true,
                httpOnly: true
            })
        }

        await prisma.vote.create({
            data: {
                sessionId,
                pollId,
                pollOptionId
            }
        })

        const votesAmount = await prisma.pollOption.update({
            where: {
                id: pollOptionId
            },
            data: {
                votesAmount: {
                    increment: 1
                }
            }
        })

        voting.publish(pollId, {
            pollOptionId,
            votes: Number(votesAmount.votesAmount)
        })

        return reply.status(201).send()
    })
}
