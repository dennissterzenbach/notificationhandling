function DummyReceiver() {
	var self = this;

	initialize();

	function initialize() {
		_registerObserver();
	}

	function _registerObserver() {
		// console.info(this.name, 'registers as observer');
		window.NotificationDispatcher.registerObserverForName('testnotification', self, onTestNotification);
	}

	function onTestNotification(notification) {
		if (notification && notification.name && notification.name === 'testnotification') {
			console.log('DummyReceiver received notification: ', notification);
			window.NotificationDispatcher.removeObserver(self);
			window.NotificationDispatcher.removeObserver(self);
			return;
		}
		console.log('DummyReceiver received unknown notification: ', notification);
	}
}
