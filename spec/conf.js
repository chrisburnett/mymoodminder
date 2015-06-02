exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['spec.js'],
    baseUrl: 'http://localhost:8100',
    onPrepare: function() {
        jasmine.createSpy('$window.plugins.pushNotification');
    }
    //baseUrl: 'http://localhost:4400/?enableripple=true',
    // onPrepare: function() {
    //     browser.driver.manage().window().maximize();
    //     browser.driver.get('http://localhost:4400/?enableripple=true');
    //     // Enable this if you get syntonization errors from protractor,
    //     // var ptor = protractor.getInstance();
    //     // ptor.ignoreSynchronization = true;

    //     // Allow ripple to load
    //     browser.driver.sleep(2000);
    //     browser.driver.switchTo().frame(0);

    //     browser.driver.switchTo().alert().then(
    //         function (alert) { alert.dismiss(); },
    //         function (err) { }
    //     );

    //}
};
