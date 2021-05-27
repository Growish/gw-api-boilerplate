require('dotenv').config();
require('./app/utils/i18n');

const tagLabel = 'Initialization routine';

const express                   = require('express');
const mongoose                   = require('mongoose');
const cors                      = require('cors');
const compression               = require('compression');
const bodyParser                = require('body-parser');
const helmet                    = require('helmet');
const { RateLimiterMongo }      = require('rate-limiter-flexible');

global.api = {
    config: require('./app/config')
};

global.utilities = require('@growishpay/service-utilities');

utilities.notifier.init(process.env.ENV, process.env.SLACK_BOT_HOOK);

const dbConn = require('./app/utils/db');

dbConn
    .then(async db => {

        utilities.logger.info(`Successfully connected to MongoDB cluster.`, {tagLabel, env: process.env.ENV});
        await startAPIServer(db);
        return db;

    })
    .catch(error => {

        if (error && error.message && error.message.code === 'ETIMEDOUT') {

            utilities.logger.info('Attempting to re-establish database connection.', {tagLabel});
            mongoose.connect(process.env.DB_SERVER);

        } else {

            utilities.logger.error('Error while attempting to connect to database.', {error});
            if (process.env.ENV !== 'DEVELOPING')
                process.exit();

            utilities.logger.debug('Process exit avoided in DEVELOPING environment');

        }

    });

const rateLimiter           = require('./app/middlewares/rate-limiter');
const apiMiddleware         = require('./app/middlewares/api');
const maintenanceMiddleware = require('./app/middlewares/maintenance');

const apiApp = express();

apiApp.disable('x-powered-by');

apiApp.use(cors());
apiApp.options('*', cors());

apiApp.use(require('morgan')("combined", {"stream": utilities.logger.stream}));
apiApp.use(express.static('app/public'));
apiApp.use(compression());
apiApp.use(helmet());
apiApp.use(bodyParser.json({limit: '5mb'}));


if (process.env.ENV === 'DEVELOPING') {

    apiApp.post('/hooks/github', utilities.githubHookExpress.controller);
    utilities.logger.info("Webhook for Github available on /hooks/github", {tagLabel});

}

//Sets API helper response functions like, resolve, forbidden, etc. and the chains continues next().
apiApp.use(apiMiddleware);

//Checks if the API is in maintenance mode, if true, blocks the chain and returns a maintenance message. If is false: next().
apiApp.use(maintenanceMiddleware);

apiApp.get('/favicon.ico', (req, res) => res.status(204));


async function startAPIServer(db) {


    const globalRateLimiter = new RateLimiterMongo({
        storeClient: db.connection,
        keyPrefix: 'rateLimitsGlobal',
        points: 10, // 10 requests
        duration: 1, // per 1 second by IP
    });

    apiApp.use(rateLimiter.getMiddleware(globalRateLimiter));

    await require('./app/routes')(apiApp);

    apiApp.use(function (error, req, res, next) {

        if (error) {

            utilities.logger.error("API ERROR NOT HANDLED", {error});
            res.status(400).json({code: 400, data: {} });

        }

        next();

    });

    apiApp.listen(process.env.PORT, async () => {

        utilities.logger.info('API server running.', {tagLabel, port: process.env.PORT});
        utilities.state.increment('restarts');
        utilities.state.set('APILastBootDate', new Date());



        if(process && typeof process.send === 'function') process.send('ready');

        if (process.env.ENABLE_RESTART_NOTIFICATION === 'true')
            utilities.notifier.send('API server running!', {env: process.env.ENV}, 'low');


    });

}