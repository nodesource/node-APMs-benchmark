# Benchmarking

## Setup

* `Node.js` should be installed in the system.
* `npm install`
* `npm run prod:build` to actually build the web page.
* run `npm run ignore-local`
* Update `agents/configs/*` to customize the configuration of the APM agents are to be tested.

## Run Benchmark Suite

* `npm run benchmark` which guide you through a series menus to configure exactly what benchmarks to run. Afterwards, the benchmarks will run, and finally the results will be displayed in a browser.

## Utilities

* `npm run clear` - to delete the results of all the benchmarks run.
* `npm run display` - to display a webpage where you can browse to all the benchmarks that have already run.
* `npm run ignore-local` - configure git to avoid tracking your local changes to the agents config
* `npm run track-local` - reconfigure git to go back tracking your local changes to the agents config

## Adding tests

* Add a script to the `test` folder. The name of the file will be used for reporting.
* Look to the other tests for boilerplate code.
