const Dummies = require('../../models/dummies');

const tagLabel = 'saveGwProtectedController';

module.exports = async (req, res) => {

    try {

        //req.locals.user contains all data of the user authenticated with Growish API
        utilities.logger.debug("User information", { tagLabel, user: req.locals.user });


        const dummy = new Dummies({
            gwOwnerId: req.locals.user._id,
            someData: req.body.someData,
            sensitive: req.body.sensitive
        });

        await dummy.save();

        res.resolve(dummy);


    } catch (error) {

        utilities.logger.error('Controller crash', {tagLabel, error});
        res.apiErrorResponse(error);

    }

};