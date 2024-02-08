import z from 'zod'
import { prisma } from '../../lib/prisma.js'

export async function getPoll(app) {
    app.get('/polls/:pollId', async (request, reply) => {
        const getPollParams = z.object({
            pollId: z.string().uuid()
        })

        const { pollId } = getPollParams.parse(request.params)

        const poll = await prisma.poll.findUnique({
            where: {
                id: pollId
            },
            include: {
                options: {
                    select: {
                        id: true,
                        title: true,
                        votesAmount: true
                    }
                }
            }
        })

        return reply.send({ poll })
    })
}
