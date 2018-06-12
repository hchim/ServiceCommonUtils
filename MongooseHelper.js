const mongoose = require('mongoose');
const winston = require('winston');

mongoose.Promise = require('bluebird');

const connectDB = (conf) => {
    const dbUrl = conf.get('mongodb.url');
    const env = conf.get('env');

    const options = {
        useMongoClient: true,
        keepAlive: true,
        socketTimeoutMS: 30000
    };

    mongoose.connect(dbUrl, options, (error) => {
        if(error) {
            winston.log('error', 'Failed to connect to mongodb.', error);
            return;
        }

        if (env === 'development' || env === 'test') {
            mongoose.set('debug', true);
        }
    });

    mongoose.connection.on('disconnected', () => {
        winston.log('info', 'Lost MongoDB connection.');
        //Reconnect every 5 seconds.
        setTimeout(connectDB, 5000, conf);
    });

    mongoose.connection.on('connected', () => {
        winston.log('info', 'Connected to mongodb.');
    });

    mongoose.connection.once('open', () => {
        winston.log('info', 'Mongodb connection open.');
    });

    mongoose.connection.on('error', () => {
        winston.log('info', 'Could not connect to mongodb.');
        mongoose.disconnect();
    });

    mongoose.connection.on('reconnected', () => {
        winston.log('info', 'Reconnected to mongodb.');
    });
};

export { connectDB };