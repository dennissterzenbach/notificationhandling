/**
 * NotificationDispatcher - broadcasting messages around the app with central responbility
 *
 * @author  Dennis Sterzenbach <dennis.sterzenbach@gmail.com>
 */

function NotificationDispatcher(configuredNotifications) {
	var _observers = {};
	var _channels = {};
	var _loghandler = null;

	var service = {};
	var returnServices = {};

	// SEND
	service.postNotification = postNotification.bind(this);
	// MANAGE OBSERVERS
	service.registerObserverForName = registerObserver.bind(this);
	service.removeObserver = removeObserver.bind(this);
	// CONFIGURATION AND TOOLS
	service.Notifications = configuredNotifications;
	service.registerLogHandler = registerLogHandler;
	// Channels
	service.channel = channel;
	// Dispatcher
	returnServices.createDispatcher = createDispatcher;
	returnServices.defaultDispatcher = service;

	initialize();
	// return service;
	return returnServices;

	////////////////////////////////////////////////////////////////////////////////////////////////

	function Channel(name) {
		var _channelObservers = {};

		var service = {};

		service.reset = resetChannel;
		service.getObservers = getObservers;
		service.registerObserver = registerObserver;
		service.removeObserver = removeObserver;
		return service;

		function resetChannel() {
			_channelObservers = {};
		}

		function getObservers() {
			return _channelObservers;
		}

		function registerObserver(receiverName, callback) {
			_channelObservers[receiverName] = callback;
		}

		function removeObserver(receiverName) {
			delete _channelObservers[receiverName];
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////

	function createDispatcher(dispatcherName) {
		returnServices[dispatcherName] = service;
	}

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

	function registerObserver(notificationName, receiverName, callback) {
		if (!notificationName) {
			return this;
		}
		if (!receiverName) {
			return this;
		}
		if (!_isChannelDefined(notificationName)) {
			_resetChannel(notificationName);
		}
		if (!_observers) {
			_resetObservers();
		}
		receiverName = _adjustReceiverName(receiverName);

		// add the callback to the channel, for posting notifications lateron
		_registerObserverForChannel(notificationName, receiverName, callback);

		// add new observer for this channel (name)
		// or update the existing registration and add the channel + callback
		_registerNewOrUpdateExistingObserver(notificationName, receiverName, callback);

		_notifyObserverDidRegister(receiverName);

		// console.info('registeredObserver: ', notificationName, receiverName, callback);
		return this;
	}

	function _registerNewOrUpdateExistingObserver(notificationName, receiverName, callback) {
		if (!_observers[receiverName]) {
			_observers[receiverName] = {
				 callbackForChannel: []
			};
		}
		_observers[receiverName].callbackForChannel[notificationName] = callback;
	}

	/**
	 * Remove the observer identified with given receiverName from all channels or notifications
	 * it has registered before.
	 *
	 * @param observerName string|function
	 */
	function removeObserver(observerName) {
        if (observerName) {
            observerName = _adjustObserverName(observerName);

            if (_isObserverRegistered(observerName)) {
                // do unregister all handlers registered with this observer:
                // iterate through all channels added to the observer during registration and delete it from there
                for (var notificationName in _observers[observerName].callbackForChannel) {
                    // delete the callback from the notification channel
                    // this should stop it from receiving notifications of this name.
                    _removeObserverFromChannel(notificationName, observerName);
                }

                // now that we have removed the observer from any channel
                // we finally clear the list to avoid leaving any links or
                // references
                _observers[observerName].callbackForChannel.length = 0;

                // now remove the observer completely
                delete _observers[observerName];
                _notifyObserverDidUnregister(observerName);
            } else {
                _notifyObserverNotRegistered(observerName);
            }
        }

        return this;
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
	 * @param notificationName string
	 * @param payload mixed|null
	 */
	function postNotification(notificationName, payload) {
		var receiverList = _getReceiversForChannel(notificationName);
		var receiverNo;
		var receiver;
		var notification;

		notification = _createNotification(notificationName, payload);

		for (receiverNo in receiverList) {
			receiver = receiverList[receiverNo];
			// console.log('receiver: ', receiver, 'notification: ', notification);
			receiver(notification);
		}

		return this;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////
	// INTERNAL TOOL FUNCTIONS

	function _createNotification(notificationName, payload) {
		return new Notification(notificationName, payload);
	}

	function _resetObservers() {
		_registeredObservers = {};
	}
	function _resetChannel(notificationName) {
		_channels[notificationName] = new Channel();
	}

	function _adjustReceiverName(receiverName) {
		if (typeof receiverName === 'function' && !!receiverName.name) {
			return receiverName.name;
		}
		return receiverName;
	}

	function _isChannelDefined(notificationName) {
		return !!_channels[notificationName];
	}

	function _registerObserverForChannel(notificationName, receiverName, callback) {
		// _channels[name][receiverName] = callback;
		channel(notificationName).registerObserver(receiverName, callback);
	}

	function _removeObserverFromChannel(notificationName, receiverName) {
		// delete _channels[notificationName][receiverName];
		channel(notificationName).removeObserver(receiverName);
	}

	/**
	 * returns the channel instance for given name
	 */
	function channel(notificationName) {
		// console.log('channel:', notificationName);
		if (!_isChannelDefined(notificationName)) {
			// console.log('null');
			return null;
		}
		// console.log(_channels[notificationName]);
		return _channels[notificationName];
	}

	/**
	 * Returns the list of receivers which like to be informed about notification with given name.
	 * @returns array
	 */
	function _getReceiversForChannel(notificationName) {
		// return _channels[notificationName];
		var c = channel(notificationName);
		if (!!c) {
			return c.getObservers();
		}
		return [];
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
