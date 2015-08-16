/**
 * @copyright (c) 2015 Dennis Sterzenbach.
 *
 * @author Dennis Sterzenbach <dennis.sterzenbach@gmail.com>
 */

// TODO combine this with the EventSourcing implementation (sync EventSourcing/AppEvent to Notification)

var radds = radds || {};

////////////////////////////////////////////////////////////////////////////////////////////////////
///// NotificationDispatcher BASE IMPLEMENTATION

/// SETUP CONFIGURATION
radds.notificationCenterConf = {
};

var ConfiguredNotifications = {
	TestNotification: 'testnotification'
};

/// CREATE INSTANCES
window.NotificationDispatcher = radds.NotificationDispatcher = new NotificationDispatcher(ConfiguredNotifications);

var dummyReceiver = new DummyReceiver();

// create a second dispatcher for demonstration purpose
window.NotificationDispatcher.createDispatcher('secondDispatcher');


// use this to send a testnotification to the DummyReceiver
function postDemoNotification() {
	var object = { sender: this, customdata: [ 'hello', 'test', 1, 2, 3 ] };

	console.group('DefaultDispatcher | DummyReceiver');
		console.log('post notification (should be received by DummyReceiver upon first call)');
		window.NotificationDispatcher.defaultDispatcher.postNotification(window.NotificationDispatcher.defaultDispatcher.Notifications.TestNotification, object);

		console.log('post notification again (DummyReceiver should no longer receive this, because it unregistered itself)');
		window.NotificationDispatcher.defaultDispatcher.postNotification(window.NotificationDispatcher.defaultDispatcher.Notifications.TestNotification, object);
	console.groupEnd();

	console.info('posting notification to second dispatcher. this should not be received by any observer registered to defaultDispatcher...');
	window.NotificationDispatcher.secondDispatcher.postNotification('mytest', {hallo: 'ballo'});
}

// console.log( window.NotificationDispatcher.secondDispatcher );
