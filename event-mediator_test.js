describe("Event Mediator", function() {
	'use strict';

	var mocks = window.angular.mock;
	var eventMediator = require('./event-mediator');

	var $rootScope;
	var $scope;
	var sut;
	var subscriptionSpy;
	var eventName;

	beforeEach(mocks.module(eventMediator.name));

	beforeEach(mocks.inject(function(_$rootScope_, $controller, _eventMediator_) {
		$rootScope = _$rootScope_;
		$scope = $rootScope.$new();
		sut = _eventMediator_;
	}));

	beforeEach(function() {
		subscriptionSpy = jasmine.createSpy('subscriptionSpy');
		eventName = 'MockEvent';
	});

	it("should subscribe a function with the eventName on the rootScope", function() {
		spyOn($rootScope, '$on');
		sut.subscribe($scope, eventName, subscriptionSpy);
		expect($rootScope.$on).toHaveBeenCalledWith(eventName, subscriptionSpy);
	});

	it("should call the event when the event name is sent to the mediator", function() {
		sut.subscribe($scope, eventName, subscriptionSpy);
		sut.emit(eventName);
		expect(subscriptionSpy).toHaveBeenCalled();
	});

	it("should call the event with the given arguments when the event is emmited", function() {
		sut.subscribe($scope, eventName, subscriptionSpy);
		sut.emit(eventName, "An Argument");
		expect(subscriptionSpy).toHaveBeenCalledWith(jasmine.any(Object), "An Argument");
	});

	it("should deregister the event from the subscribers object on deregister", function() {
		sut.subscribe($scope, eventName, subscriptionSpy);
		sut.unsubscribe($scope, eventName);
		sut.emit(eventName);
		expect(subscriptionSpy).not.toHaveBeenCalled();
	});

	it("should have one event in the subscribers object for the container", function() {
		sut.subscribe($scope, eventName, subscriptionSpy);
		expect(sut.subscribers[$scope.$id].length).toBe(1);
	});

	it("the event should not be in the subscribers anymore", function() {
		sut.subscribe($scope, eventName, subscriptionSpy);
		sut.unsubscribe($scope, eventName);
		expect(sut.subscribers[$scope.$id].length).toBe(0);
	});

	it("will deregister all events for a container on removeEventsForContainer", function() {
		sut.subscribe($scope, eventName, subscriptionSpy);
		sut.unsubscribeAllForScope($scope);
		expect(sut.subscribers[$scope.$id].length).toBe(0);
	});

	it("will automatically deregister all subscriptions on $destroy", function() {
		sut.subscribe($scope, eventName, subscriptionSpy);
		spyOn(sut.subscribers[$scope.$id][0], 'deregistration').and.callThrough();
		spyOn(sut, 'removeNullEvents'); // Need this to stop event from being removed and not lose the spy.
		$scope.$destroy();
		expect(sut.subscribers[$scope.$id][0].deregistration).toHaveBeenCalled();
	});

	it("will remove the events from the container", function() {
		sut.subscribe($scope, eventName, subscriptionSpy);
		$scope.$destroy();
		expect(sut.subscribers[$scope.$id].length).toBe(0);
	});

	it("should return the event deregistration function for the given scope and event name", function() {
		sut.subscribe($scope, eventName, subscriptionSpy);
		var expected = sut.getEventDeregistrator($scope, eventName);
		expect(expected).toBe(sut.subscribers[$scope.$id][0].deregistration);
	});

	describe('registering a custom destroy callback', function(){

		it('should call custom logic on destroy', function(){
			var destroyFn = jasmine.createSpy();
			sut.onDestroy($scope, destroyFn);
			$scope.$destroy();
			expect(destroyFn).toHaveBeenCalled();
		});

		it('should catch calls to bind a destroyFn through the subscribe method', function(){
			var destroyFn = jasmine.createSpy();
			sut.subscribe($scope, '$destroy', destroyFn);
			$scope.$destroy();
			expect(destroyFn).toHaveBeenCalled();
		});

		it('should call a custom destroy function AND clean up internal subscriptions', function(){
			var destroyFn = jasmine.createSpy();
			var handler = jasmine.createSpy();

			sut.onDestroy($scope, destroyFn);
			sut.subscribe($scope, 'eventName', handler);

			sut.emit('eventName');
			expect(handler).toHaveBeenCalled();
			handler.calls.reset();

			$scope.$destroy();

			sut.emit('eventName');
			expect(handler).not.toHaveBeenCalled();
			expect(destroyFn).toHaveBeenCalled();
		});

		it("should still call to deregister any custom events", function() {
			var subscriptionSpy = jasmine.createSpy();
			sut.subscribe($scope, 'eventName', subscriptionSpy);

			var destroyFn = jasmine.createSpy();
			sut.onDestroy($scope, destroyFn);

			spyOn(sut.subscribers[$scope.$id][0], 'deregistration').and.callThrough();
			spyOn(sut, 'removeNullEvents'); // Need this to stop event from being removed and not lose the spy.
			$scope.$destroy();

			expect(sut.subscribers[$scope.$id][0].deregistration).toHaveBeenCalled();
			expect(destroyFn).toHaveBeenCalled();
		});

	});

});
