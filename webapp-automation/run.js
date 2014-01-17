#!/usr/bin/env node

var spawn = require('child_process').spawn;
var fs = require('fs');
var mustache = require('mustache');
var colors = require('colors');

var padded = function (n) {
    return n < 10 ? '0' + n : n;
};

var Automation = function (args) {
    this.args = args;
    this.cucumberArgs = ['--format', this.format];
    this.parseCommandLineArgs();
    this.setEnvironment();
    this.setBrowser();
    this.run();
};

Automation.prototype = {

    args: null,
    cucumberArgs: null,

    environment: 'MQA',
    application: 'WEBAPP',
    format: 'pretty',
    browser: 'chrome',

    jsonOutput: '',
    exitCode: -1,
    startTime: Date.now(),
    endTime: null,

    browsers: ['chrome', 'firefox', 'safari', 'phantomjs'],

    environments: {
        MQA: 'http://mqa.{{domain}}',
        LIVE: 'http://m.{{domain}}',
        SHOT: 'http://{{shot_id}}.mshot.{{domain}}',
        LOCAL: 'http://localhost.{{domain}}'
    },

    applications : {
        WAP : {
            domain : 'badoo.com',
            path : '/',
            query : '_webapp=false'
        },
        WEBAPP : {
            domain : 'badoo.com',
            path : '/en-gb/app/',
            query : '_webapp=true'
        },
        HON : {
            domain : 'hotornot.com',
            path : '/en-gb/',
            query : ''
        }
    },

    fileEncoding: {
        encoding: 'utf8'
    },

    parseCommandLineArgs: function () {

        for (var i = 0; i < this.args.length; i++) {

            // environment to run against eg. LOCAL, MQA, SHOT, LIVE
            if (this.args[i] === '--env') {
                this.environment = this.args[++i];
            }

            // application to run against eg. WEBAPP, WAP, HON
            else if (this.args[i] === '--app') {
                this.application = this.args[++i];
            }

            // the output format eg. pretty, json, html
            else if (this.args[i] === '--format') {
                this.format = this.args[++i];
                this.cucumberArgs[1] = this.format === 'html' ? 'json' : this.format;
            }

            // tags to run against
            else if (this.args[i] === '--tags') {
                this.cucumberArgs.push('--tags');
                this.cucumberArgs.push(this.args[++i]);
            }

            // which browser to use eg. chrome, firefox, safari, phantomjs
            else if (this.args[i] === '--browser') {
                this.browser = this.args[++i];
            }
            // Definition library: Lists all the implemented features
            else if (this.args[i] === '--dl') {
                this.listStepDefinitions();
            }

            else if (this.args[i] === '--regenerate-report') {
                this.createHtmlReport(true);
            }

        }

    },

    listStepDefinitions: function () {

        console.log('Available step definitions are:');
        console.log('');
        console.log(new Array(20).join('*'));

        this.readFile('features/step-definitions/main.js')
            .match(/this.(Given|When|Then)\(.*?,/g)
            .forEach(function (match) {
                console.log(match.replace(/this\.(Given|When|Then)\(/, '$1 '.bold).replace(/,$/, ''));
            });

        console.log(new Array(20).join('*'));
        console.log('');
        process.exit(0);

    },

    setEnvironment: function () {

        // split on ':' to support "SHOT:<my-shot-id>"
        var environment = this.environment.split(':')[0];
        var shotId = this.environment.split(':')[1];
        var url = '';

        if (!this.environments.hasOwnProperty(environment)) {
            console.log('Invalid environment. Possible environments are: ' + Object.keys(this.environments));
            process.exit(1);
        }

        if (environment === 'SHOT' && !shotId) {
            console.log('You must provide a shot id. eg. --env SHOT:mhf1234');
            process.exit(1);
        }

        if (!this.applications.hasOwnProperty(this.application)) {
            console.log('Invalid application. Possible applications are: ' + Object.keys(this.applications));
            process.exit(1);
        }

        this.cucumberArgs.push('--tags');
        this.cucumberArgs.push('@' + this.application);

        url = this.environments[environment];
        url = url + this.applications[this.application].path;
        url = url.replace('{{domain}}', this.applications[this.application].domain);
        url = url.replace('{{shot_id}}', shotId);

        process.env.URL_QUERY = this.applications[this.application].query;
        process.env.URL_BASE = url;
        process.env.APP = this.application;
        process.env.BUILD = environment;
        process.env.APPS = Object.keys(this.applications).join(',');
    },

    setBrowser: function () {

        var browser = this.browser.toLowerCase();

        if (this.browsers.indexOf(browser) == -1) {
            console.log('Invalid browser. Possible options are: ' + this.browsers.join(', '));
            process.exit(1);
        }

        process.env.BROWSER = browser;
    },

    run: function () {

        console.log('Running automation against environment: ' + process.env.URL_BASE);
        console.log('Running automation against browser: ' + process.env.BROWSER);

        if (this.format === 'html') {
            console.log('An HTML report will be generated when the tests are complete...');
        }

        // spawn a child process to run the automation
        var child = spawn('./node_modules/.bin/cucumber.js', this.cucumberArgs, {
            env: process.env
        });

        // set encoding of stdout
        child.stdout.setEncoding('utf8');

        // listen for output
        child.stdout.on('data', this.onStdOutData.bind(this));

        // listen for close
        child.on('close', this.onStdOutClose.bind(this));

    },

    onStdOutData: function (data) {

        // if format is html then capture the json output
        if (this.format === 'html') {
            this.jsonOutput += data;
            return;
        }

        // else output to console
        data.split('\n').forEach(function (line) {
            if (line.trim().length > 0) {

                if (line.indexOf('Feature:') !== -1 || line.indexOf('Scenario:') !== -1) {
                    console.log('');
                }

                console.log(line);

            }
        });

    },

    onStdOutClose: function (code) {

        if (this.format !== 'html') {
            process.exit(code);
        }

        this.exitCode = code;
        this.createHtmlReport();
    },

    readFile: function (fileName) {
        return fs.readFileSync(fileName, this.fileEncoding);
    },

    compileTemplate: function (name) {
        return mustache.compilePartial(name, this.readFile('templates/' + name + '.html'));
    },

    getDuration: function (ms) {

        var time = [];

        if (ms > 60000) {
            time.push(Math.floor((ms / 60000)) + ' minutes');
            ms = ms % 60000;
        }

        if (ms > 1000) {
            time.push(Math.floor(ms / 1000) + ' seconds');
        }

        return time.join(' and ');
    },

    getDate: function () {
        var d = new Date();
        return padded(d.getDate()) + '/' + padded(d.getMonth()) + '/' + d.getFullYear()
    },

    getCurrentTime: function () {
        var d = new Date();
        return padded(d.getHours()) + ':' + padded(d.getMinutes());
    },

    createHtmlReport: function (regenerate) {

        var saveJSON = true;

        try {

            // main template file
            var index = this.compileTemplate('index');

            // partials
            this.compileTemplate('feature');
            this.compileTemplate('scenario');
            this.compileTemplate('step');
            this.compileTemplate('tags');
            this.compileTemplate('totals');

            var context = regenerate ? JSON.parse(this.readFile('reports/results.json')) : this.parseJSON(this.jsonOutput);

            var output = index(context);

            // create 'reports' directory if it doesnt already exists
            if (!fs.existsSync('reports')) {
                fs.mkdirSync('reports');
            }

            // write html and json file
            fs.writeFileSync('reports/index.html', output);

            // write JSON file unless we were just re-generating the html report
            if (!regenerate) {
                fs.writeFileSync('reports/results.json', JSON.stringify(context));
            }

            console.log('');
            console.log('> JSON'.bold + ' output of tests available at ' + 'reports/results.json'.bold);
            console.log('> HTML'.bold + ' report created successfully at ' + 'reports/index.html'.bold);
            console.log('');
            process.exit(this.exitCode === null ? 0 : this.exitCode);
        }
        catch (e) {
            console.log('Error creating HTML report.'.red);
            console.log(e);
            process.exit(1);
        }
    },

    parseJSON: function (json) {

        json = typeof json === 'string' ? JSON.parse(json) : json;

        if (!Array.isArray(json)) {
            console.log('Invalid JSON format'.red);
            process.exit(1);
        }

        var scenarioId = 1;
        var totalSteps = 0;
        var passedSteps = 0;

        var features = json.map(function (feature, i) {

            // replace id with one we can use for anchor links
            feature.id = 'feature-' + (i + 1);
            feature.passedSteps = 0;
            feature.totalSteps = 0;

            feature.elements.forEach(function (scenario) {

                scenario.id = scenarioId++;

                // normalise tags to an empty array if they dont exist
                if (!scenario.tags) {
                    scenario.tags = [];
                }

                // the html page will only initially display the steps
                // of a Scenario where at least one step failed
                scenario.hasFailures = false;

                scenario.steps.forEach(function (step) {

                    // not all steps have a result object
                    // not sure if this is an error in cucumber or intentional
                    if (step.result) {
                        if (step.result.status === 'passed') {
                            totalSteps++;
                            passedSteps++;
                            feature.passedSteps++;
                            feature.totalSteps++;
                        }
                        else {
                            totalSteps++;
                            scenario.hasFailures = true;
                            feature.totalSteps++;
                        }

                        if (step.result.status === 'undefined') {
                            step.missingStepDefinition = true;
                        }
                    }

                });

            });

            // set boolean flag if there are errors
            feature.hasFailures = feature.passedSteps < feature.totalSteps;

            return feature;
        });

        return {
            passedSteps: passedSteps,
            totalSteps: totalSteps,
            hasFailures: passedSteps < totalSteps,
            features: features,
            browser: process.env.BROWSER,
            environment: this.environment,
            duration: this.getDuration(Date.now() - this.startTime),
            date: this.getDate(),
            time: this.getCurrentTime()
        };

    }

};

new Automation(process.argv.slice(2));