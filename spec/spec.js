// var getPastAlerts = function(path) {
//     browser.driver.get('http://localhost:4400' + path);
//     // Enable this if you get syntonization errors from protractor,
//     //var ptor = protractor.getInstance();
//     //ptor.ignoreSynchronization = true;

//     browser.driver.switchTo().alert().then(
//         function (alert) { alert.accept(); },
//         function (err) { }
//     );
//     // Allow ripple to load
//     browser.driver.sleep(2000);
//     browser.driver.switchTo().frame(0);

// }


describe('Dashboard', function() {

    //it('should display received messages', function(){});
    //it('should remove unpreferred messages', function(){});
});


describe('Login', function() {
    beforeEach(function() {
        jasmine.create
        jasmine.createSpy('$window.plugins.pushNotification');
    });

    it('should redirect to the dashboard on success', function() {
        browser.get('/#/login');
        element(by.model('credentials.username')).sendKeys('dave');
        element(by.model('credentials.password')).sendKeys('davedave');
        element(by.id('login-button')).click();

        expect(browser.getCurrentUrl()).toBe('/tab/dash');
    });

    it('should display a message on wrong credentials', function(){

    });

    it('should display a message on server communication error', function() {

    });

});
