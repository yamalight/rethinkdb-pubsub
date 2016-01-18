import test from 'tape';
import {Topic} from '../src/topic';

test('Topic', (it) => {
    it.test('# should publish to exchange', (t) => {
        const testExchange = {
            publish(key, payload) {
                t.equal(key, 'testKey');
                t.equal(payload, 'testPayload');
                t.end();
            },
        };
        const topic = new Topic(testExchange, 'testKey');
        topic.publish('testPayload');
    });
});
