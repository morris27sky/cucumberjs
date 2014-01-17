module.exports = function () {

    // require the 'World;
    this.World = require('../support/world').World;

    // helper for creating a success callback
    var success = function (callback) {
        return function () {
            callback();
        };
    };

    // helper for creating an failure callback
    var failure = function (callback, message) {
        return function (e) {
            callback.fail(message + (e ? ': ' + (e.message || e) : ''));
        };
    };

    this.Given('I am logged in', function (callback) {

        var goToLoginPage = function (user) {
            return this.visit(this.getUrl('Login')).then(function () {
                return user;
            });
        }.bind(this);

        var fillInUsername = function (user) {
            return this.enterFormFieldValue('Username', this.QaApi.decodeBase64(user.email)).then(function () {
                return user;
            });
        }.bind(this);

        var fillInPassword = function (user) {
            return this.enterFormFieldValue('Password', user.password);
        }.bind(this);

        var submitForm = function () {
            return this.click('Sign In Submit');
        }.bind(this);

        var loginPromise = this.QaApi.createUser()
            .then(goToLoginPage, failure(callback, 'Unable to go to Login'))
            .then(fillInUsername, failure(callback, 'Unable to fill in username'))
            .then(fillInPassword, failure(callback, 'Unable to fill in password'))
            .then(submitForm, failure(callback, 'Unable to submit form'));

        if (this.getApplication() === 'WAP' && this.getBuild() !== 'LIVE') {

            var clickThroughNotification = function () {
                return this.click('Continue');
            }.bind(this);

            loginPromise = loginPromise.then(clickThroughNotification, failure(callback, 'Unable to pass notification'));
        }

        loginPromise.then(
            success(callback),
            failure(callback, 'Unable to log user in.')
        );

    });

    this.Given('I have a moderated photo', function (callback) {
        this.userHasModeratedPhoto_ = true;
        callback();
    });

    this.Given('I visit "$page"', function (page, callback) {

        // just a '/' is no page
        if (page === '/') {
            page = '';
        }

        // a leading '/' breaks the routing on webapp
        if (page.charAt(0) === '/') {
            page = page.substring(1);
        }

        this.visit(this.getUrl(page)).then(
            success(callback),
            failure(callback, 'Unable to load url "' + this.getUrl(page) + '"')
        );

    });

    this.When('I click "$element"', function (elementId, callback) {

        this.click(elementId).then(
            success(callback),
            failure(callback, 'Unable to click element "' + elementId + '"')
        );

    });

    this.When('I enter "$value" into "$elementId"', function (value, elementId, callback) {

        this.enterFormFieldValue(elementId, value).then(
            success(callback),
            failure(callback, 'Unable to fill in "' + elementId + '" with value "' + value + '"')
        );

    });

    this.When('I select "$option" from "$elementId"', function (optionText, elementId, callback) {

        this.setSelectBoxValue(elementId, optionText).then(
            success(callback),
            failure(callback, 'Unable to select option "' + optionText + '" from select box with name "' + elementId + '"')
        );

    });

    this.When(/I wait for ([\d\.]*)(.*)/, function (amount, measurement, callback) {

        amount = parseInt(amount, 10);

        if (['s', 'seconds', 'second'].indexOf(measurement.trim()) !== -1) {
            amount = amount * 1000;
        }

        this.sleep(amount).then(
            success(callback),
            failure(callback, 'Unable to wait for ' + amount + ' ' + measurement)
        );

    });

    this.Then('"$elementId" should have the text "$text"', function (elementId, expected, callback) {

        this.assertElementHasText(elementId, expected).then(
            success(callback),
            failure(callback, elementId + ' should have text ' + expected)
        );

    });

    this.Then('"$elementId" should not have text "$text"', function (elementId, expected, callback) {

        this.assertElementHasText(elementId, expected).then(
            failure(callback, elementId + ' should not have text "' + expected + '"'),
            success(callback)
        );

    });

    this.Then('I should see "$elementId"', function (elementId, callback) {

        this.assertElementIsVisible(elementId).then(
            success(callback),
            failure(callback, 'The element "' + elementId + '" is not visible')
        );

    });

        this.Then('I should not see "$elementId"', function (elementId, callback) {

        this.assertElementIsNotVisible(elementId).then(
            success(callback),
            failure(callback, 'The element "' + elementId + '" is visible')
        );

    });

    this.Then('The current page should be "$url"', function (url, callback) {

        this.assertUrl(url).then(
            success(callback),
            failure(callback, 'The page was not "' + url + '"')
        );

    });

};