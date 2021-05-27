const mongoose = require('mongoose');
const publicFields = require("../plugins/public-fields");

const DummySchema = new mongoose.Schema({

        gwOwnerId: {
            type: String,
            required: [true, i18n.__('FIELD_REQUIRED')]
        },
        someData: {
            type: String,
            minlength: [10, i18n.__('STRING_AT_LEAST', { min: 10 })],
            maxlength: [300, i18n.__('STRING_AT_MUST', { min: 300 })],
            required: [true, i18n.__('FIELD_REQUIRED')]
        },
        sensitive: {
            type: String,
            required: [true, i18n.__('FIELD_REQUIRED')]
        }

    },
    {collection: 'dummies', timestamps: true}
);

DummySchema.plugin(publicFields, [
    "_id",
    "someData"
]);

module.exports = exports = mongoose.model('Dummy', DummySchema);
