import test from 'tape';
import {Queue} from '../src/queue';

test('Queue', (it) => {
    it.test('# should pass filter function to full query in exchange', (t) => {
        const testExchange = {
            fullQuery(filterFunc) {
                filterFunc('fullQuery');
            },
        };
        const filterFunc = (data) => {
            t.equal(data, 'fullQuery');
            t.end();
        };
        const queue = new Queue(testExchange, filterFunc);
        queue.fullQuery();
    });

    it.test('# should subscribe to exchange', (t) => {
        const ff = () => {};
        const itf = () => {};
        const testExchange = {
            subscribe(filterFunc, iterFunc) {
                t.equal(ff, filterFunc);
                t.equal(itf, iterFunc);
                t.end();
            },
        };
        const queue = new Queue(testExchange, ff);
        queue.subscribe(itf);
    });
});
