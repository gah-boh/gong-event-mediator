# gong event mediator
An Event Mediator for Angular

This event mediator will handle subscriptions for you. It will also subscribe to a $scope's $destroy event to take care of unsubscribing all listeners to prevent errors. The event mediator should also be used to emit events, that way you don't have to inject $rootScope.

## Installation
`npm install gong-event-mediator`

## Basic Usage

To subscribe:
```
eventMediator.subscribe(<scope>, <event name>, <handler>);
```

To emit:
```
eventMediator.emit(<event name>, <data>);
```


