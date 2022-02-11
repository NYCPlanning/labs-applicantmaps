'use strict';

module.exports = {
  test_page: 'tests/index.html?hidepassed&nocontainer',
  launch_in_ci: [
    'Chrome',
  ],
  launch_in_dev: [
    'Chrome',
  ],
  browser_args: {
    Chrome: {
      ci: [
        '--no-sandbox',
        '--disable-gpu',
        '--headless',
        '--remote-debugging-port=0',
        '--window-size=1440,900',
      ].filter(Boolean),
      dev: [
        '--disable-background-timer-throttling',
      ],
    },
  },
};
