/**
 * This is the 'World' class for the scenarios
 * @fileOverview
 * @author Jon Bretman
 */

var yaml = require('js-yaml');
var QaApi = require('./QaApi');
var webdriver = require('selenium-webdriver');
var url = require('url');
var Capabilities = webdriver.Capabilities;
var By = webdriver.By;

var elements =  {};
var pages =  {};

var defaultCreateUserParams = {
    email_confirmed: true,
    name: 'Test User',
    fname: 'Test',
    sname: 'User',
    gender: 'M',
    birthday: '1980-03-03',
    tiw_gender: 'F',
    preserve_empty_name: false,
    preserve_empty_gender: false,
    preserve_empty_city: false,
    preserve_empty_birthdate: false
};

var returnTrue = function () {
    return true;
};

var returnFalse = function () {
    return false;
};

/**
 * World Class
 * @param callback
 * @constructor
 */
var World = module.exports.World = function (callback) {

    this.driver = new webdriver.Builder().withCapabilities(this.getBrowserCapabilities()).build();
    this.QaApi = new QaApi(this);
    this.createUserParams = Object.create(defaultCreateUserParams);

    process.env.APPS.split(',').map(function(app) {
        try {
            elements[app] = require('./' + app + '/elements.yaml');
        }
        catch(e) {
            console.error(e);
        }
        try {
            pages[app] = require('./' + app + '/pages.yaml');
        }
        catch(e) {
            console.error(e);
        }
    });

    this.driver.manage().window().setSize(640, 960);
    this.wait(function() {
        return this.driver.manage().window().getSize().then(function(size) {
            return size.width === 640 && size.height === 960;
        }.bind(this));
    }.bind(this)).then(function(){
        callback();
    });

};

World.prototype = {

    /**
     * The webdriver instance.
     * @type {webdriver.WebDriver}
     */
    driver: null,

    /**
     * Instance of QaApi helper
     * @type {QaApi}
     */
    QaApi: null,

    /**
     * If set to true the browser doesn't close when tests are complete
     */
    noBrowserClose: false,

    /**
     * @type {Object}
     */
    createUserParams: null,

    /**
     *
     */
    userHasModeratedPhoto_: false,

    getCreateUserParams: function () {
        return this.createUserParams;
    },

    userHasModeratedPhoto: function () {
        return this.userHasModeratedPhoto_;
    },

    /**
     * Returns the base url the tests should be run against.
     * @returns {String}
     */
    getUrl: function (pageId) {

        var page = pages[this.getApplication()][pageId];

        if (!page) {
            return webdriver.promise.rejected('No page in support/' + this.getApplication() + '/pages.yaml with identifier: ' + pageId);
        }

        var path = page['path'] || '';
        var hash = page['hash'] || '';

        return process.env.URL_BASE + path + '?' + process.env.URL_QUERY + '#' + hash;
    },

    /**
     * Returns the application being tested
     * @returns {String}
     */
    getApplication: function () {
        return process.env.APP;
    },

    /**
     * Return the build environment the tests are running against, e.g. SHOT, MQA
     * @returns {String}
     */
    getBuild: function () {
        return process.env.BUILD;
    },

    /**
     * Returns the browser capabilities for webdriver.
     * When we support Browserstack / Saucelabs this method will need to be updated.
     * @returns {Object}
     */
    getBrowserCapabilities: function () {
        return webdriver.Capabilities[process.env.BROWSER]();
    },

    /**
     *
     * @param elementId
     * @returns {webdriver.promise.Promise}
     */
    getElement: function (elementId) {

        var entry = elements[this.getApplication()][elementId];

        if (!entry) {
            return webdriver.promise.rejected('No element in support/' + this.getApplication() + '/elements.yaml with identifier: ' + elementId);
        }

        var strategy = Object.keys(entry)[0];

        if (!strategy) {
            return webdriver.promise.rejected('No strategy specified for element with identifier: ' + elementId);
        }

        // searching by text can not be done with selenium
        if (strategy === 'text') {
            return this.getElementByText(entry.text);
        }

        return this.wait(function () {
            return this.driver.findElement(By[strategy](entry[strategy])).then(null, returnFalse);
        });

    },

    /**
     *
     * @param text
     * @returns {webdriver.promise.Promise}
     */
    getElementByText: function (text) {

        return this.wait(function () {

            return this.driver.executeScript(function () {

                var text = arguments[0];
                var element = null;

                var search = function (el) {

                    if (!el || el.nodeType !== 1) {
                        return;
                    }

                    if (el.textContent) {
                        if (el.textContent.replace(/\n/g, '').replace(/(\w)( .*?)(\w)/g, '$1 $3').trim() === text) {
                            element = el;
                        }
                    }

                    var children = el.childNodes;

                    for (var i = 0; i < children.length; i++) {
                        search(children[i]);
                    }

                };

                search(document.body);
                return element;

            }, text);

        });

    },

    /**
     *
     * @param elementId
     * @returns {webdriver.promise.Promise}
     */
    click: function (elementId) {
        return this.wait(function () {

            return this.getElement(elementId).then(function (element) {

                return element.isDisplayed().then(function (displayed) {
                    return !displayed ? false : element.click().then(returnTrue, returnFalse);
                }, returnFalse);

            });

        }.bind(this));
    },

    /**
     *
     * @param {String} elementId
     * @param {String} value
     * @returns {webdriver.promise.Promise}
     */
    enterFormFieldValue: function (elementId, value) {
        return this.getElement(elementId).then(function (element) {
            return element.sendKeys(value);
        });
    },

    /**
     *
     * @param elementId
     * @param optionText
     * @returns {webdriver.promise.Promise}
     */
    setSelectBoxValue: function (elementId, optionText) {

        if (!elements[getApplication()][elementId] || !elements[getApplication()][elementId].name) {
            return webdriver.promise.rejected('The "name" strategy must be used to find <select> element');
        }

        var name = elements[getApplication()][elementId].name;

        return this.driver.executeScript(function () {

            var select = document.querySelector('select[name="' + arguments[0] + '"]');

            if (!select) {
                return false;
            }

            var options = select.getElementsByTagName('option');

            for (var i = 0; i < options.length; i++) {

                if (options[i].textContent.trim() === arguments[1]) {
                    select.value = options[i].value;
                    return true;
                }

            }

            // failed to find option
            return false;

        }, name, optionText).then(function (result) {
            return result || webdriver.promise.rejected('Unable to set select with name "' + name + '" to option with text "' + optionText + '"');
        });
    },

    /**
     * Visit a url in the driver and waits for the splash screen to have been removed.
     * @param {String} url
     * @returns {webdriver.promise.Promise}
     */
    visit: function (url) {
        return this.driver.get(url).then(function () {

            return this.wait(15000, function () {

                return this.driver.executeScript(function () {
                    return !document.getElementById('splashscreen');
                });

            }.bind(this)).then(null, function() {
                return webdriver.promise.rejected('splashscreen was not removed');
            }.bind(this));

        }.bind(this));
    },

    /**
     * Makes the webdriver sleep for the given amount of time. Default is 500ms.
     * @param ms
     * @returns {*|!Promise}
     */
    sleep: function (ms) {
        return this.driver.sleep(ms || 500);
    },

    wait: function (time, fn) {
        if (arguments.length === 1) {
            return this.driver.wait(time.bind(this), 5000);
        }
        return this.driver.wait(fn.bind(this), time);
    },

    /**
     *
     * @param elementId
     * @param expected
     * @returns {!Promise|*}
     */
    assertElementHasText: function (elementId, expected) {

        return this.wait(function () {

            return this.getElement(elementId).then(function (element) {
                return element.getText().then(function (actual) {
                    return actual === expected;
                }, returnFalse);
            });

        });

    },

    /**
     * Assert that an element is visible on the page
     * @param elementId
     * @returns {*}
     */
    assertElementIsVisible: function (elementId) {

        return this.wait(function () {

            return this.getElement(elementId).then(function (element) {
                return element.isDisplayed().then(null, returnFalse);
            });

        });

    },

    /**
     * Assert that an element is not visible on the page
     * @param elementId
     * @returns {*}
     */
    assertElementIsNotVisible: function (elementId) {

        return this.wait(function () {

            return this.getElement(elementId).then(function (element) {
                return element.isDisplayed().then(function (displayed) {
                    return !displayed;
                }, returnFalse);
            });

        });

    },

    /**
     * @param expected
     * @returns {*}
     */
    assertUrl: function (expectedPageId) {

        var finalActual;

        var page = pages[this.getApplication()][expectedPageId];

        if (!page) {
            return webdriver.promise.rejected('No page in support/' + this.getApplication() + '/pages.yaml with identifier: ' + expectedPageId);
        }

        return this.wait(function () {

            return this.driver.getCurrentUrl().then(function (actual) {

                var expectedPath = page['path'] || '';
                var expectedHash = page['hash'] || '';

                var requiredParameters = Object.create(page['required parameters'] || {});
                var allowedParameters = Object.create(page['allowed parameters'] || {_webapp : '.*'});

                var uri = url.parse(actual, true);
                finalActual = actual;

                var queryPassed = true;

                // The logic is all parameters in the query must be either in required or allowed parameters
                // You define the parameters as regular expressions
                Object.keys(uri.query || {}).map(function(key){
                    var checkParam = function(value) {
                        for (key in requiredParameters) {
                            if (new RegExp(key + "=" + requiredParameters[key]).exec(key + '=' + value)) {
                                delete requiredParameters[key];
                                return;
                            }
                        }
                        for (key in allowedParameters) {
                            if (new RegExp(key + "=" + allowedParameters[key]).exec(key + '=' + value)) {
                                return;
                            }
                        }
                        queryPassed = false;
                    };

                    if (uri.query[key].map) {
                        uri.query[key].map(checkParam);
                    }
                    else {
                        checkParam(uri.query[key]);
                    }

                });

                return queryPassed && Object.keys(requiredParameters).length === 0 &&
                    (uri.pathname.indexOf(expectedPath, uri.pathname.length - expectedPath.length) !== -1) &&
                    ((uri.hash || '#').indexOf('#' + expectedHash) === 0)
                ;
            });

        }).then(null, function () {
            return webdriver.promise.rejected('actual url' + ' "' + finalActual + '"');
        });

    }

};