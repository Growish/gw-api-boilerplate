const axios    = require('axios');
const unless    = require('express-unless');

const tagLabel  = 'gwUserAuthMiddleware';

const mw = async (req, res, next) => {

    try {

        const url = process.env.GW_API_URL + "/user-session?token=" + req.headers['x-gw-client-token'];

        const response = await axios.get(url, {
            auth: {
                username: process.env.GW_BASIC_AUTH_USER,
                password: process.env.GW_BASIC_AUTH_PASS
            }
        });

        req.locals.user = response.data.data;

        return next();
    }
    catch (error) {

        if(!error.response || !error.response.data) {
            utilities.logger.error('Cannot run client authentication', { tagLabel, error });
            return res.apiErrorResponse(error);
        }

        utilities.logger.debug("Auth response", { response: error.response.data });

        if(error.response.data.code === 401)
            return res.unauthorized();

        res.apiErrorResponse(error);
    }

};


module.exports = unless(mw, {path: api.config.publicRoutes});
