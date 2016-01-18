// A queue that filters messages in the exchange
export class Queue {
    constructor(exchange, filterFunc) {
        this.exchange = exchange;
        this.filterFunc = filterFunc;
    }

    // Returns the full ReQL query for this queue
    fullQuery() {
        return this.exchange.fullQuery(this.filterFunc);
    }

    // Subscribe to messages from this queue's subscriptions
    subscribe(iterFunc) {
        return this.exchange.subscribe(this.filterFunc, iterFunc);
    }
}
