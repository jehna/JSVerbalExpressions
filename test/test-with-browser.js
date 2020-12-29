const webdriver = require('selenium-webdriver');
const path = require('path');

function getCapabilities() {
    switch (process.env.BROWSER || 'chrome') {
        case 'ie': {
            require('iedriver');
            return webdriver.Capabilities.ie();
        }
        case 'safari': {
            return webdriver.Capabilities.safari();
        }
        case 'firefox': {
            require('geckodriver');
            return webdriver.Capabilities.firefox();
        }
        case 'chrome': {
            require('chromedriver');
            const capabilities = webdriver.Capabilities.chrome();
            capabilities.set('chromeOptions', {
                args: [
                    '--headless',
                    '--no-sandbox',
                    '--disable-gpu',
                    '--window-size=1980,1200',
                ],
            });
            return capabilities;
        }
    }
}

(async () => {
    const driver = await new webdriver.Builder()
        .withCapabilities(getCapabilities())
        .build();

    await driver.get('file:///' + path.join(__dirname, 'index.html'));

    let results;
    do {
        results = await driver.executeScript('return testsResult');
    } while (!results);

    await driver.quit();

    console.log('Test results:');
    console.log('-------------');
    for (const result of results) {
        console.log(
            `${result.err?.expected !== 'false' ? '✅' : '❌'} ${result.title}`
        );
    }
    console.log('');

    if (results.some((result) => result.err?.expected === 'false'))
        process.exit(1);
})();
