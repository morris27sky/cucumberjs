module.exports = function () {

    this.After(function (callback) {
        this.QaApi.clean().then(function() {
            if (this.noBrowserClose) {
                console.log('Not closing browser');
                return webdriver.promise.success();
            }
            return this.driver.quit.bind(this.driver)();
        }.bind(this)).then(callback);
    });

};