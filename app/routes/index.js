const fs                        = require('fs');
const appRoot                   = require('app-root-path').path;

const gwUserAuthMiddleware      = require('../middlewares/gw-user-auth-server-to-server')

module.exports = async api => {

    api.use(gwUserAuthMiddleware);
    fs.readdirSync(`${appRoot}/app/routes/api`).map(file => {
        api.use(require('./api/' + file));
    });


};