'use strict';

var EventMediator = window.angular.module('GongEventMediator', []);

EventMediator.factory('eventMediator', ['$rootScope', function($rootScope) {
	var subscribers = {};

	var register = function(eventName, eventFunction) {
		return $rootScope.$on(eventName, eventFunction);
	};

	var addSubscription = function(scope, eventName, eventFunction){
		var deregistration = register(eventName, eventFunction);
		var eventInfo = {
			deregistration: deregistration,
            eventName: eventName,
            isLive: true
		};
		subscribers[scope.$id].push(eventInfo);
	};

	var removeEvent = function(eventObj) {
		eventObj.deregistration();
		eventObj.isLive = false;
	};

	var unsubscribeEvent = function(scope, eventName) {
		var containerEvents = subscribers[scope.$id];
		for (var i = 0; i < containerEvents.length; i++) {
			if (eventName === containerEvents[i].eventName) {
				removeEvent(containerEvents[i]);
			}
		}
	};

	var unsubscribeAllEvents = function (scope) {
		var containerEvents = subscribers[scope.$id];
		for (var i = 0; i < containerEvents.length; i++) {
			removeEvent(containerEvents[i]);
		}
	};

	return {

		subscribers: subscribers,

			subscribe: function(scope, eventName, eventFunction) {
				if(eventName === '$destroy') return this.onDestroy(scope, eventFunction);

				if (!subscribers.hasOwnProperty(scope.$id)) {
					subscribers[scope.$id] = [];
					this.addDestroyer(scope);
				}
				addSubscription(scope, eventName, eventFunction);
			},

			emit: function() {
				$rootScope.$emit.apply($rootScope, arguments);
			},

			unsubscribe: function(scope, eventName) {
				if (subscribers.hasOwnProperty(scope.$id)) {
					unsubscribeEvent(scope, eventName);
				}
				this.removeNullEvents(scope);
			},

			unsubscribeAllForScope: function (scope) {
				if (!subscribers.hasOwnProperty(scope.$id)) {
					return;
				}
				unsubscribeAllEvents(scope);
				this.removeNullEvents(scope);
			},

			onDestroy: function(scope, destroyFn){
				scope.$on('$destroy', destroyFn);
			},

			scopeDestroy: function(destroyedScope) {
				this.unsubscribeAllForScope(destroyedScope.currentScope);
			},

			addDestroyer: function(scope) {
				scope.$on('$destroy', angular.bind(this, this.scopeDestroy));
			},

			removeNullEvents: function(scope) {
				subscribers[scope.$id] = subscribers[scope.$id].filter(function(eventObj) {
					return eventObj.isLive;
				});
			},

			getEventDeregistrator: function(scope, eventName) {
				return subscribers[scope.$id].filter(function(eventObj) {
					return eventObj.eventName === eventName;
				})[0].deregistration;
			}

	};
}]);

module.exports = EventMediator.name;
