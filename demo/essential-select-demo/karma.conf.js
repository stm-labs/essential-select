// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  // const pa = require('puppeteer').executablePath();
  // process.env.CHROME_BIN = pa;
  // console.warn('use ' + pa)

  const isCi = process.env['CI_MODE'] && (process.env['CI_MODE'] === 'true' || process.env['CI_MODE'] === true);

  if (config.browsers && config.browsers.length > 0 && config.browsers.find(x => x === 'Chrome' != null)) {
    // ...
  } else {
    process.env.CHROME_BIN="/usr/bin/google-chrome-unstable";
  }

  config.set({
    browserNoActivityTimeout: 30000,
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-teamcity-reporter')
    ],
    client:{
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'coverage'), reports: [ 'html', 'lcovonly' ],
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'dev'
    },
    reporters: isCi === true ? ['progress', 'kjhtml', 'teamcity'] : ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['HeadlessChrome', 'Chrome'],
    customLaunchers:{
      HeadlessChrome:{
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    singleRun: false
  });
};
