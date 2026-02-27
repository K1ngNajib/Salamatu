const EventEmitter = require('events');

/**
 * Lightweight in-process event bus used to propagate
 * service-layer workflow changes to socket namespaces.
 */
const socketEventBus = new EventEmitter();

module.exports = socketEventBus;
