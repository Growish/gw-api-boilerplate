const Dummies = require('../../models/dummies');

const tagLabel = 'readGwProtectedController';

module.exports = async (req, res) => {

    try {

        const dummy = await Dummies.findOne({ _id: req.params.id, gwOwnerId: req.locals.user._id });

        if(!dummy)
            return res.notFound();

        res.resolve(dummy);

    } catch (error) {

        utilities.logger.error('Controller crash', {tagLabel, error});
        res.apiErrorResponse(error);

    }

};