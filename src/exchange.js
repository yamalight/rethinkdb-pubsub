import r from 'rethinkdb';
import {Topic} from './topic';
import {Queue} from './queue';

// Represents a message exchange which messages can be sent to and
// consumed from. Each exchange has an underlying RethinkDB table.
export class Exchange {
    constructor(name, connOpts = {}) {
        this.db = connOpts.db = connOpts.db || 'test';
        this.name = name;
        this.conn = null;
        this.table = r.table(name);
        this._asserted = false;

        this.promise = r.connect(connOpts)
        .then(conn => this.conn = conn)
        .catch(r.Error.RqlRuntimeError, (err) => {
            console.error(err.message);
            process.exit(1);
        });

        this.assertPromise = this.promise;
    }

    // Returns a topic in this exchange
    topic(name) {
        return new Topic(this, name);
    }

    // Returns a new queue on this exchange that will filter messages by
    // the given query
    queue(filterFunc) {
        return new Queue(this, filterFunc);
    }

    // The full ReQL query for a given filter function
    fullQuery(filterFunc) {
        return this.table
            .changes()('new_val')
            .filter(row => filterFunc(row('topic')));
    }

    // Publish a message to this exchange on the given topic
    publish(topicKey, payload) {
        return this.assertTable()
        .then(() => {
            const topIsObj = Object.prototype.toString.call(topicKey) === '[object Object]';
            const topic = topIsObj ? r.literal(topicKey) : topicKey;
            return this.table
            .filter({topic})
            .update({
                payload,
                updated_on: r.now() // eslint-disable-line
            })
            .run(this.conn);
        })
        .then((updateResult) => {
            // If the topic doesn't exist yet, insert a new document. Note:
            // it's possible someone else could have inserted it in the
            // meantime and this would create a duplicate. That's a risk we
            // take here. The consequence is that duplicated messages may
            // be sent to the consumer.
            if (updateResult.replaced === 0) {
                return this.table
                .insert({
                    payload,
                    topic: topicKey,
                    updated_on: r.now() // eslint-disable-line
                })
                .run(this.conn);
            }

            return updateResult;
        });
    }

    // Receives a callback that is called whenever a new message comes in
    // matching the filter function
    subscribe(filterFunc, iterFunc) {
        return this.assertTable()
        .then(() => this.fullQuery(filterFunc).run(this.conn))
        .then(cursor => cursor.each((err, message) => {
            if (err) {
                throw err;
            }

            iterFunc(message.topic, message.payload);
        }));
    }

    // Ensures the table specified exists and has the correct primary_key
    // and durability settings
    assertTable() {
        return this.assertPromise.then(() => {
            if (this._asserted) {
                return undefined;
            }

            this.assertPromise = r.dbCreate(this.db)
                .run(this.conn)
                .finally(() => r.db(this.db)
                    .tableCreate(this.name)
                    .run(this.conn)
                )
                .catch(r.Error.RqlRuntimeError, (err) => {
                    if (err.msg.indexOf('already exists') === -1) {
                        throw err;
                    }
                })
                .then(() => {
                    this._asserted = true;
                    this.assertPromise = this.promise;
                });

            return this.assertPromise;
        });
    }
}
