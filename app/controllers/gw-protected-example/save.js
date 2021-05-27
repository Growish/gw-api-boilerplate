const Dummies = require('../../models/dummies');

const tagLabel = 'saveGwProtectedController';

module.exports = async (req, res) => {

    try {

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