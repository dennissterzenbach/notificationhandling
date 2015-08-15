/**
 * @copyright (c) 2015 Dennis Sterzenbach.
 *
 * @author Dennis Sterzenbach <dennis.sterzenbach@gmail.com>
 */
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

// use this to send a testnotification to the DummyReceiver
function postDemoNotification() {
	var object = { sender: this, customdata: [ 'hello', 'test', 1, 2, 3 ] };

	console.log('post notification (should be received by DummyReceiver upon first call)');
	window.NotificationDispatcher.postNotification(window.NotificationDispatcher.Notifications.TestNotification, object);

	console.log('post notification again (DummyReceiver should no longer receive this, because it unregistered itself)');
	window.NotificationDispatcher.postNotification(window.NotificationDispatcher.Notifications.TestNotification, object);
}
