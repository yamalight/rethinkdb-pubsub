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
        // subscribe
        testExchange
        .queue(topic => topic.eq('test.out'))
        .subscribe((topic, payload) => {
            t.equal(payload, 'test');
            t.equal(topic, 'test.out');
            t.end();
            // close connection
            testExchange.conn.close();
            // stop server
            server.stop();
        });
        setTimeout(() => {
            // publish
            testExchange
            .topic('test.out')
            .publish('test');
        }, 50);
    });
});
