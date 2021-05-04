const mongoClient = require('mongodb').MongoClient;
const config = require('../config');
const f = require('util').format;
const assert = require('assert');
const fs = require('fs');
let mongodb;
function connect(callback) {

    mongoClient.connect(config.mongo.url, {
        promiseLibrary: Promise,
        useUnifiedTopology: true,
        // uri_decode_auth: true
    }, (error, client) => {

        if (error) {
            console.error('connect ECONNREFUSED Error', error);
            return
        } else {
            mongodb = client.db(config.mongo.name)
        }
        callback();
    });
}
function get() {
    return mongodb;
}

function close() {
    mongodb.close();
}

module.exports = {
    connect,
    get,
    close
};
