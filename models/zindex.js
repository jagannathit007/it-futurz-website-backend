const resellerModel = require('./reseller.model');

//Maintain this json, for easy access to models anywhere in the app.
module.exports = {
    Admin: require('./admin.model'),
    Contact: require('./contact.model'),
    JobApplication: require('./jobApplication.model'),
    resellerModel: require('./reseller.model'),
}