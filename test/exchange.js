import test from 'tape';
import Reqlite from 'reqlite';
import {Exchange} from '../src/exchange';

test('Exchange', (it) => {
    // init dummy server
    const server = new Reqlite({silent: true});
    // test
    it.test('# should send message to subscriber', (t) => {
        const connection = server.createConnection();
        const testExchange = new Exchange('testexchange', connection);
        let testIndex = 0;
        // subscribe
        testExchange
        .queue(topic => topic.eq('test.out'))
        .subscribe((topic, payload) => {
            t.equal(topic, 'test.out');

            if (testIndex === 0) {
                t.equal(payload, 'test');
                testIndex++;
                return;
            }

            if (testIndex === 1) {
                t.equal(payload, 'test2');
                t.end();
                // just exit to close all connections
                process.exit();
            }
        });
        setTimeout(() => {
            // publish
            testExchange
            .topic('test.out')
            .publish('test');
        }, 50);

        setTimeout(() => {
            // publish
            testExchange
            .topic('test.out')
            .publish('test2');
        }, 100);
    });
});
