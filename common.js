const database = require('./database');
const routers = require('./routers');
const util = require('./util');
const crypto = require('./crypto');

module.exports.crypto = crypto;
module.exports.database = database;
module.exports.routers = routers;
module.exports.util = util;
module.exports.responseMaker = routers.responseMaker;

module.exports.main = routers.pathRouter({
    "/": routers.methodRouter({
        GET: async function(args) {
            return routers.responseMaker (
                {
                    "active": false
                }
            );
        }
    })
});
