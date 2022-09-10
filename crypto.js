const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = {
    bcrypt: {
        sync_compare: function (pass, hash) {
            return bcrypt.compareSync(pass, hash);
        },
        sync_hash: function (pass) {
            return bcrypt.hashSync(pass, 10);
        },
        async_compare: async function (pass, hash) {
            return module.exports.bcrypt.sync_compare(pass, hash);
        },
        async_hash: async function (pass) {
            return module.exports.bcrypt.sync_hash(pass);
        },
    },
    crypto: {
        sync_hash: function (pass) {
            return crypto.createHash("sha256").update(pass).digest("base64");
        },
        async_hash: async function (pass) {
            return module.exports.crypto.sync_hash(pass);
        },
        sync_random: function() {
            return crypto.randomBytes(20).toString('hex');
        },
        async_random: function() {
            return module.exports.crypto.sync_random();
        }
    }
}