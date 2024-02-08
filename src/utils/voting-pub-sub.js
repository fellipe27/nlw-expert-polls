class VotingPubSub {
    constructor() {
        this.channels = {}
    }

    subscribe(pollId, subscriber) {
        if (!this.channels[pollId]) {
            this.channels[pollId] = []
        }

        this.channels[pollId].push(subscriber)
    }

    publish(pollId, message) {
        if (!this.channels[pollId]) {
            return
        }

        for (const subscriber of this.channels[pollId]) {
            subscriber(message)
        }
    }
}

export const voting = new VotingPubSub()
