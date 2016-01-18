// Represents a topic that may be published to
export class Topic {
    constructor(exchange, topicKey) {
        this.exchange = exchange;
        this.key = topicKey;
    }

    // Publish a payload to the current topic
    publish(payload) {
        return this.exchange.publish(this.key, payload);
    }
}
