/** @module xide/mixins/EventedMixin **/
define([
    "dojo/_base/array",
    "dcl/dcl",
    "xdojo/declare",
    "xdojo/has",
    'xide/types',
    'xide/factory'
], function (array, dcl, declare, has, types, factory) {

    const toString = Object.prototype.toString;
    /**
     * Adds convenient functions for events to the consumer, generalizing dojo.subscribe/publish or dojo.on.
     * This mixin can be applied to anything dijit/_Widget based or custom functional classes(needs to call destroy!)
     *
     * Check online-documentation {@link http://rawgit.com/mc007/xjs/dgrid_update/src/lib/xide/out/xide/0.1.1-dev/EventedMixin.html|here}
     *
     * @class module:xide/mixins/EventedMixin
     */
    const Impl = {

        _didRegisterSubscribers: false,

        subscribers: null,
        /**
         * Subscription filter map
         * @type {Object.<string,boolean}
         */
        subscribes: {},
        /**
         * Emit filter map
         * @type {Object.<string,boolean}
         */
        emits: {},
        /**
         * Array of dojo subscribe/on handles, destroyed on this.destroy();
         * @private
         * @type {Object[]}
         */
        __events: null,
        /**
         * Add emit filter
         * @param type
         * @param data
         */
        addPublishFilter: function (type, data) {
            if (type) {
                if (data != null) {
                    this.emits[type] = data;
                } else if (type in this.emits) {
                    delete this.emits[type];
                }
            }
        },
        /**
         * Simple filter function to block subscriptions.
         * @param key
         * @returns {boolean}
         */
        filterSubscribe: function (key) {

            if (this.subscribes) {
                return this.subscribes[key] !== false;
            }
            return true;
        },
        /**
         * Simple filter function to block publishing.
         * @param key
         * @returns {boolean}
         */
        filterPublish: function (key) {
            if (this.emits) {
                return this.emits[key] !== false;
            }
            return true;
        },
        /**
         * Subscribe to an event or multiple events. Attention, this is NOT checking for duplicates!
         *
         * @example
         *
         * // widget case with event callback delegation to 'this', code is written inside a custom widget or whatever
         * // class subclassing from this mixin:
         * // pre-requisites for dijit/dojox widgets: lang.extend(dijit.Button,EventedMixin.prototype);
         *
         * //simple example #1
         * var button = new dijit.Button({});
         * button.subscribe('click',this.onButtonClick,this);//calls this.onButtonClick with scope this
         *
         * //simple example #2
         * var button = new dijit.Button({});
         * button.subscribe('click',null,this);//calls this.click with scope this
         *
         * //multi-event example #1
         * var button = new dijit.Button({});
         * button.subscribe(['click','dblclick'],null,this);//calls this.click and this.dblclick with scope this
         *
         * // custom events (using dojo-publish/subscribe or dojo.topic)
         * // assuming you want listen to the events of dijit/layout/TabContainer or any other StackContainer. Notice,
         * // that stack-containers will publish events like this: topic.publish(this.id + "-removeChild", page);
         *
         * var tabContainerId = 'tabContainer';
         *
         * this.subscribe(tabContainerId + 'addChild',this.childAdded);//notice that the scope is set here automatically!
         *
         * //multi-event version, this will call this['tabContainerId-addChild'] and this['tabContainerId-removeChild']
         *
         * this.subscribe([tabContainerId + 'addChild',tabContainerId + 'removeChild']);
         *
         *
         *
         *
         *
         *
         * @param keys {String|String[]} : The event key(s), given as single string or an array of strings, holding all
         * event keys for publishing multiple events in one row.
         *
         * @param cb {Function} : callback, by the default the callback's scope will 'this'
         *
         * @param to {Object} : override 'this' scope to something else
         */
        subscribe: function (keys, cb, to) {
            if (!this.__events) {
                this.__events = {};
            }
            const self = this;
            const events = factory.subscribe(keys, cb, to || self, self.filterSubscribe.bind(self));
            const container = self.__events;

            //replay on local tracking map
            for (let i = 0, l = events.length; i < l; i++) {
                const _type = events[i].type;
                if (!container[_type]) {
                    container[_type] = [];
                }
                container[_type].push(events[i]);
            }
            return events;
        },
        /**
         * Publish an event (uses dojo.publish)
         *
         * @param keys {String|String[]} : The event key, given as string or array for publishing multiple events in one row
         *
         * @param data {Object|null} : The actual event data.
         *
         * @param from {Object|null} : Send event 'as' this source. By default, its using 'this' as sender.
         *
         * @param delay {Number|null} : Send event with a delay, otherwise call now
         *
         */
        publish: function (keys, data, from, delay) {
            const self = this;
            if (delay > 0) {
                setTimeout(function () {
                    factory.publish(keys, data, from || self, self.filterPublish.bind(self));
                }.bind(self), delay);
            } else {
                factory.publish(keys, data, from || self, self.filterPublish.bind(self));
            }
        },
        /**
         * @TODO: deal with unsubscribe in _EventedMixin
         * @param key
         * @private
         */
        _destroyHandle: function (key) {},
        /**
         * Turns the lights off, kills all event handles.
         * @private
         * @returns void
         */
        _destroyHandles: function () {
            if (this.__events) {
                for (const type in this.__events) {
                    array.forEach(this.__events[type], function (item) {
                        if (item && item.remove) {
                            item.remove();
                        }
                    });
                }
                delete this.__events;
            }
        },
        /**
         * When using subscribe, all event subscription handles are stored in this.__events.
         * This function will remove all the event handles, using this._destroyHandles()
         */
        destroy: function () {
            this._emit('destroy');
            this.inherited && this.inherited(arguments);
            this._destroyHandles();
        },
        /**
         * Adds a one time listener for the event. This listener is invoked only the
         * next time the event is fired, after which it is removed.
         *
         * @name emitter.once(event, listener)
         * @param {String} event- The event name/id to listen for
         * @param {Function} listener - The function to bind to the event
         * @api public
         *
         * ```javascript
         * db.once('unauthorized', function (req) {
         *     // this event listener will fire once, then be unbound
         * });
         * ```
         */
        once: function (type, listener) {
            const self = this;

            function wrapped() {
                self.unsubscribe(type, listener);
                return listener.apply(self, arguments);
            }

            wrapped.listener = listener;
            self._on(type, wrapped);
            return this;
        },
        /*
         __emit:function(target,type,event){
         event = event || {};
         if (typeof target.emit === 'function' && !target.nodeType) {
         return target.emit(type, event);
         }
         if (target.dispatchEvent && target.ownerDocument && target.ownerDocument.createEvent) {
         var nativeEvent = target.ownerDocument.createEvent('HTMLEvents');
         nativeEvent.initEvent(type, Boolean(event.bubbles), Boolean(event.cancelable));
         for (var key in event) {
         if (!(key in nativeEvent)) {
         nativeEvent[key] = event[key];
         }
         }
         return target.dispatchEvent(nativeEvent);
         }
         throw new Error('Target must be an event emitter');
         },
         */
        /**
         * Execute each of the listeners in order with the supplied arguments.
         *
         * @name emitter.emit(event, [arg1], [arg2], [...])
         * @param {String} event - The event name/id to fire
         * @api public
         */
        _emit: function (type) {
            if (!this.__events)
                return;

            if (!this._didRegisterSubscribers && this.subscribers) {
                for (var i = 0; i < this.subscribers.length; i++) {
                    const subscriber = this.subscribers[i];
                    this._on(subscriber.event, subscriber.handler, subscriber.owner);
                }
                this._didRegisterSubscribers = true;
            }

            if (arguments[2] === true)
                throw new Error("Please use emit.sticky() instead of passing sticky=true for event: " + type);

            const handler = this.__events[type];
            const eventArgs = arguments.length > 1 ? arguments[2] : null;

            if (!handler)
                return;

            let returnValue;

            if (typeof handler == 'function') {
                switch (arguments.length) {
                    // fast cases
                    case 1:
                        return handler.call(this);
                    case 2:
                        return handler.call(this, arguments[1]);
                    case 3:
                        return handler.call(this, arguments[1], arguments[2]);
                        // slower
                    default:
                        var args = Array.prototype.slice.call(arguments, 1);
                        returnValue = handler.apply(this, args);
                }
            } else if (_.isArray(handler)) {
                var args = Array.prototype.slice.call(arguments, 1);
                const listeners = handler.slice();
                let temp;
                let _listener = null;
                let who = null;

                for (let i = 0, l = listeners.length; i < l; i++) {

                    _listener = listeners[i];
                    who = _listener.owner || this;

                    args && args[0] && (args[0].owner = args[0] ? args[0].owner || who : null);

                    _listener.handler && (temp = _listener.handler.apply(who, args));
                    if (temp !== undefined) {
                        returnValue = temp;
                    }

                    args && args[0] && args[0].owner && (args[0].owner = null);


                }
            }

            //forward to global
            eventArgs && eventArgs['public'] === true && this.publish(type, args);

            return returnValue;
        },
        /**
         * Remove a listener from the listener array for the specified event. Caution:
         * changes array indices in the listener array behind the listener.
         *
         * @name emitter.removeListener(event, listener)
         * @param {String} event - The event name/id to remove the listener from
         * @param {Function} listener - The listener function to remove
         * @api public
         *
         * ```javascript
         * var callback = function (init) {
         *     console.log('duality app loaded');
         * };
         * devents.on('init', callback);
         * // ...
         * devents.removeListener('init', callback);
         * ```
         */
        unsubscribe: function (type, listener) {

            // does not use listeners(), so no side effect of creating __events[type]
            if (!this.__events || !this.__events[type]) return this;

            // no listener given, unsubscribe all per type
            if (('function' !== typeof listener || !listener)) {
                array.forEach(this.__events[type], dojo.unsubscribe);
                delete this.__events[type];
                this.__events[type] = [];
                return this;
            }
            const list = this.__events[type];
            if (_.isArray(list)) {
                const _remove = [];
                _.each(list, function (handle, a, b) {
                    const which = handle.handler == listener ? handle.handler : handle.handler.listener == listener ? handle.handler.listener : null;
                    if (which) {
                        _remove.push(handle);
                    }
                });
                _.each(_remove, function (handler) {
                    handler.remove();
                });
                if (list.length === 0) {
                    delete this.__events[type];
                }
            } else if ((this.__events[type].listener || this.__events[type]) === listener) {
                delete this.__events[type];
            }
            return this;
        },
        /**
         * Returns an array of listeners for the specified event. This array can be
         * manipulated, e.g. to remove listeners.
         *
         * @name emitter.listeners(event)
         * @param {String} events - The event name/id to return listeners for
         * @api public
         *
         * ```javascript
         * session.on('change', function (stream) {
         *     console.log('session changed');
         * });
         * console.log(util.inspect(session.listeners('change'))); // [ [Function] ]
         * ```
         */
        listeners: function (type) {
            if (!this.__events) this.__events = {};
            if (!this.__events[type]) this.__events[type] = [];
            if (!isArray(this.__events[type])) {
                this.__events[type] = [this.__events[type]];
            }
            return this.__events[type];
        },
        /**
         *
         * @param type
         * @param handle
         * @returns {*}
         */
        addHandle: function (type, handle) {
            if (!this.__events) {
                this.__events = {}
            }
            if (!this.__events[type]) {
                this.__events[type] = [];
            }
            handle.type = type;
            this.__events[type].push(handle);
            return handle;
        },
        /**
         * jQuery sub
         * @param element
         * @param type
         * @param selector
         * @param handler
         * @returns {{handler: *, owner: (exports|module.exports|module:xide/mixins/EventedMixin), type: *, element: (*|jQuery|HTMLElement), selector: *, remove: _handle.remove}}
         */
        __on: function (element, type, selector, handler) {
            const _handler = handler;
            if (typeof selector == 'function' && !handler) {
                //no selector given
                handler = selector;
                selector = null;
            }

            element = element.jquery ? element : $(element);
            element.on(type, selector, handler);

            if (!this.__events) this.__events = {};
            if (!this.__events[type]) {
                this.__events[type] = [];
            }
            const eventList = this.__events[type];
            const _handle = {
                handler: _handler,
                owner: this,
                type: type,
                element: element,
                selector: selector,
                remove: function () {
                    eventList.remove(this);
                    this.element.off(this.type, this.selector, this.handler);
                }
            };
            eventList.push(_handle);
            return _handle;

        },
        _on_: function (type, listener, owner) {
            try {
                if (!this.__events) this.__events = {};

                if (!this.__events[type]) {
                    this.__events[type] = [];
                }

                const eventList = this.__events[type];
                if (!eventList) {
                    // Optimize the case of one listener. Don't need the extra array object.
                    this.__events[type] = listener;
                } else if (_.isArray(eventList)) {

                    if (eventList.indexOf(listener) != -1)
                        return console.warn("adding same listener twice", type);

                    // If we've already got an array, just append.
                    const _handle = {
                        handler: listener,
                        owner: owner || this,
                        type: type,
                        remove: function () {
                            eventList.remove(this);
                            owner && owner.__events && owner.__events[type] && owner.__events[type].remove(this);
                            this.owner = null;
                            this.handler = null;
                            delete this.type;
                        }
                    };
                    eventList.push(_handle);
                    return _handle;
                }
            } catch (e) {
                logError(e);
            }
            return this;
        },
        _on: function (type, listener, owner) {
            if (!_.isArray(type)) {
                type = [type];
            }
            type.forEach((evt) => {
                this._on_(evt, listener, owner);
            });
            return this;
        }
    };

    //package via declare
    const Module = declare(null, Impl);
    //static access to Impl.
    Module.Impl = Impl;
    Module.dcl = dcl(null, Impl);
    dcl.chainAfter(Module.dcl, 'destroy');
    return Module;
});