/**
 * NotificationDispatcher - broadcasting messages around the app with central responbility
 *
 * @author  Dennis Sterzenbach <dennis.sterzenbach@gmail.com>
 */

function NotificationDispatcher(configuredNotifications) {
	var _observers = {};
	var _channels = {};
	var _loghandler = null;

	var service = {},
		self = this;

	// SEND
	service.postNotification = postNotification;
	// MANAGE OBSERVERS
	service.registerObserverForName = registerObserver;
	service.removeObserver = removeObserver;
	// CONFIGURATION AND TOOLS
	service.Notifications = configuredNotifications;
	service.registerLogHandler = registerLogHandler;

	initialize();
	return service;

	////////////////////////////////////////////////////////////////////////////////////////////////

	function initialize() {
		registerLogHandler();
	}

	function registerLogHandler(handler) {
		if (handler && handler.error && handler.info && handler.log) {
			// normally nothing to do here, because the handler is okay...
		} else {
			handler = console;
		}
		_loghandler = handler;
	}

	function registerObserver(name, receiverName, callback) {
		if (!name) {
			return self;
		}
		if (!receiverName) {
			 return self;
		}
		if (!_channels[name]) {
			_resetChannel(name);
		}
		if (!_observers) {
			_resetObservers();
		}
		receiverName = _adjustReceiverName(receiverName);

		// add the callback to the channel, for posting notifications lateron
		_registerObserverForChannel(name, receiverName, callback);

		// add new observer for this channel (name)
		// or update the existing registration and add the channel + callback
		_registerNewOrUpdateExistingObserver(name, receiverName, callback);

		_notifyObserverDidRegister(receiverName);

		// console.info('registeredObserver: ', name, receiverName, callback);
		return self;
	}

	function _registerObserverForChannel(name, receiverName, callback) {
		_channels[name][receiverName] = callback;
	}

	function _registerNewOrUpdateExistingObserver(name, receiverName, callback) {
		if (!_observers[receiverName]) {
			_observers[receiverName] = {
				 callbackForChannel: []
			};
		}
		_observers[receiverName].callbackForChannel[name] = callback;
	}

	/**
	 * Remove the observer identified with given receiverName from all channels or notifications
	 * it has registered before.
	 *
	 * @param receiverName string|function
	 */
	function removeObserver(receiverName) {
		if (receiverName) {
			receiverName = _adjustReceiverName(receiverName);

			if (_isObserverRegistered(receiverName)) {
				// do unregister all handlers registered with this observer:
				// iterate through all channels added to the observer during registration and delete it from there
				for (var notificationName in _observers[receiverName].callbackForChannel) {
					// remove the callback from observer
					delete _observers[receiverName].callbackForChannel[notificationName];
					// delete the callback from the notification channel
					// this should stop it from receiving notifications of this name.
					delete _channels[notificationName][receiverName];
				}
				// now remove the observer completely
				delete _observers[receiverName];
				_notifyObserverDidUnregister(receiverName);
			} else {
				_notifyObserverNotRegistered(receiverName);
			}
		}

		return self;
	}

	/**
	 * Checks if the given observer is registered or not.
	 *
	 * @param receiverName string|function
	 * @return boolean
	 */
	function _isObserverRegistered(receiverName) {
		receiverName = _adjustReceiverName(receiverName);

		return _observers && (receiverName in _observers);
	}

	/**
	 * Send a notification of given name to all observers who manifested interest by registering
	 * and attach the [optional] information given as payload.
	 *
	 * @param name string
	 * @param payload mixed|null
	 */
	function postNotification(name, payload) {
		var receiverList = _getReceiversForChannel(name),
			receiverNo,
			receiver,
			notification;

		notification = _createNotification(name, payload);

		for (receiverNo in receiverList) {
			receiver = receiverList[receiverNo];
			// console.log('receiver: ', receiver, 'notification: ', notification);
			receiver(notification);
		}

		return self;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////
	// INTERNAL TOOL FUNCTIONS

	/**
	 * Returns the list of receivers which like to be informed about notification with given name.
	 * @returns array
	 */
	function _getReceiversForChannel(name) {
		return _channels[name];
	}

	function _createNotification(name, payload) {
		return new Notification(name, payload);
	}

	function _resetObservers() {
		_registeredObservers = {};
	}
	function _resetChannel(name) {
		_channels[name] = {};
	}

	function _adjustReceiverName(receiverName) {
		if (typeof receiverName === 'function' && !!receiverName.name) {
			return receiverName.name;
		}
		return receiverName;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////
	// Notifications for tracking, logging, debugging

	function _notifyObserverNotRegistered(receiverName) {
		_loghandler.error('observer unknown or not registered: ', receiverName);
	}

	function _notifyObserverDidRegister(receiverName) {
		_loghandler.info('observer registered: ', receiverName);
	}

	function _notifyObserverDidUnregister(receiverName) {
		_loghandler.info('observer was unregistered: ', receiverName);
	}
}
