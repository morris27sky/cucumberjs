var http = require('http');
var querystring = require('querystring');
var Q = require('q');

var defaultOptions = {
    method: 'GET',
    hostname: 'qaapi.staffpass.com',
    headers: {
        'X-Qaapi-Auth-Secret': 'f13f225a60fb9a1e4cbfa432caba7f17'
    }
};

var extend = function () {

    var result = {};

    Array.prototype.slice.call(arguments).forEach(function (source) {

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                result[key] = source[key];
            }
        }

    });

    return result;
};

var QaApi = module.exports = function (world) {
    this.world = world;
    this.createdUsers = [];
};

QaApi.prototype = {

    world: null,

    createdUsers: null,

    uploadedPhotoId: null,

    /**
     *
     * @param endpoint
     * @param params
     * @returns {Promise}
     */
    request: function (endpoint, params) {

        var deferred = Q.defer();

        params = extend(params || {}, {
            output_format: 'json'
        });

        var req = http.request(extend(defaultOptions, {
            path: '/' + endpoint + '?' + querystring.stringify(params)
        }), function (response) {

            var json = '';

            response.on('data', function (chunk) {
                json += chunk;
            });

            response.on('end', function () {

                try {

                    json = JSON.parse(json);

                    if (json.error_code) {
                        deferred.reject(json);
                        return;
                    }

                }
                catch (e) {
                    deferred.reject(e);
                    return;
                }

                deferred.resolve(json);
            });

        });

        req.on('error', function (e) {
            deferred.reject(e);
        });

        req.end();
        return deferred.promise;
    },

    /**
     *
     * @param str
     * @returns {*}
     */
    decodeBase64: function (str) {
        return new Buffer(str, 'base64').toString();
    },

    /**
     *
     * @param {String} search
     * @returns {Promise}
     */
    getUser: function (search) {
        return this.request('userGet', {
            search: search
        });
    },

    /**
     *
     * @param user
     * @returns {*}
     */
    addModeratedPhoto: function (user) {

        return this.request('photoUpload', {
            user_id: user.user_id,
            photo: 'http://www.gleeksource.com/GleekSource/files/5f/5f019237-b3ec-4906-bf2e-0d164b55d9dc_580_426.jpg'
        }).then(function (photos) {

            return this.request('photoModerate', {
                user_id: user.user_id,
                photo_id: photos[0].id,
                moderation_status: 'Approved'
            }).then(function () {

                return user;

            });

        }.bind(this));
    },

    /**
     *
     * @returns {Promise}
     */
    createUser: function () {
        return this.request('userRegister', this.world.getCreateUserParams()).then(function (user) {
            this.createdUsers.push(user);

            if (this.world.userHasModeratedPhoto()) {
                return this.addModeratedPhoto(user);
            }

            return user;

        }.bind(this));
    },

    /**
     * Deletes a user.
     * @param {String|Object} user Either a user id or a user object
     * @returns {Promise}
     */
    deleteUser: function (user) {
        return this.request('userDelete', {
            user_id: typeof user === 'string' ? user : user.user_id
        });
    },

    clean: function () {
        return Q.all(this.createdUsers.map(this.deleteUser.bind(this)));
    }

};

//new QaApi().deleteUser('341003000').then(function (resp) {
//    console.log(resp);
//});

//QaApi.request('photoUpload', {
//    user_id: '305259797',
//    photo: 'http://www.home-designing.com/wp-content/uploads/2009/06/nice-building.jpg'
//}).then(function (resp) {
//    console.log(resp);
//});


