### Badoo Webapp Automation

Using:
* [Cucumber.js](https://github.com/cucumber/cucumber-js)
* [Selenium Webdriver](https://npmjs.org/package/selenium-webdriver)
* [Node.js] (http://nodejs.org/)

#### Node.js

First you must make sure you Node.js installed. This is very quick and easy, instructions are [here](http://nodejs.org/).

#### Chromedriver

To run the tests against Chrome you need to have the **chromedriver** on your PATH. You can download the chromedriver binary from: http://chromedriver.storage.googleapis.com/index.html (we are currently using **2.6**). Once you have downloaded and unzipped it copy it to `/usr/bin/`, for example:
```sh
$ sudo cp ~/Downloads/chromedriver /usr/bin/chromedriver
```

#### Setting Up

First clone this repository:
```sh
$ git clone git@git.ukoffice:mobileweb/webapp-automation.git
```

Then install the dependencies:
```sh
$ cd webapp-automation
$ npm install
```

Run the tests:
```sh
$ ./run.js
```

#### Environments

There are 4 possible environments you can run the tests against:

* **LIVE**
* **MQA** (default)
* **SHOT**
* **LOCAL**

The environment is set by using the `--env` flag.

```sh
# runs the tests against m.badoo.com
$ ./run.js --env LIVE

# runs the tests against mqa.badoo.com
$ ./run.js --env MQA

# runs the tests against a shot - in this case http://mhf1281.mshot.badoo.com
$ ./run.js --env SHOT:mhf1281

# runs the tests against a local version
$ ./run.sh LOCAL
```

#### Tags

You can use tags to run only certain tests or exclude certain tests. Tags are set with the `--tags` flag.

```sh
# run only Feature's or Scenario's that are tagged with @Payments
$ ./run.js --tags @Payments

# run only Feature's or Scenario's that are tagged with @Payments or @Credits
$ ./run.js --tags @Payments,@Credits

# run only Feature's or Scenario's that are not tagged with @Development
$ ./run.js --tags ~@Payments

# run only Feature's or Scenario's that are tagged with @Credits or not tagged with @Development
$ ./run.js --tags @Credits,~@Payments
```

#### Output Formats

The output format is set using the `--format` flag. There are two main output formats you can use:

* **pretty** - will output each step to the command line as it is run.
* **html** - will generate an html file showing the output.

```sh
# get line by line output on the terminal
$ ./run.js --format pretty

# generate an html file showing the output
$ ./run.js --format html
```

#### Features
All features should be placed in **features/** and named like **"my-feature-name.feature"**. Features should be written in the Gherkin syntax.

#### Step Definitions
All step definitions should be placed in **features/step-definitions/**. Documentation for writing step definitions can be found [here](https://github.com/cucumber/cucumber-js).

