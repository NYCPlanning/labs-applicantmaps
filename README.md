# labs-applicant-maps

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

## Prerequisites 

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with npm)
  * This installation was tested using Node v14.19.1
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

## Installation

* `git clone <repository-url>` this repository
* `cd labs-applicant-maps`
* `yarn`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

To run the app against a local development API (labs-applicantmaps-api), make sure the API is running and serve the Ember app in the `devlocal` environment:

`ember s --environment=devlocal`

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Browserstack testing

See full documentation here: https://github.com/kategengler/ember-cli-browserstack#how-to-set-up-automated-testing-with-browserstack-using-this-addon

* Setup your .env with browserstack information
* Run `ember browserstack:connect`
* Run your test server `ember test`
* Run `ember browserstack:disconnect` When done

### Linting

* `npm run lint:hbs`
* `npm run lint:js`
* `npm run lint:js -- --fix`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
