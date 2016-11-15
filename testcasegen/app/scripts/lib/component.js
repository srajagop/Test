import objectAssign from 'object-assign';

/**
 * Component Base Class
 * 
 * Sets all arguments passed in to constructor from ComponentLoader
 *
 * Exposes pub/sub methods for triggering events to other components
 *
 */
export default class Component {


	/**
	 * Return optional default values for DOM data attributes
	 * 
	 * @protected
	 */
	defaultData() {
		return {
			// camelCased list of data attribute keys and default values
			// myParam: 'myDefaultValue' <- data-my-param="myOverrideValue"
		}
	}


	/**
	 * Constructor for the Component
	 *
	 * Call `super(...arguments);` in the base class constructor
	 *
	 * @public
	 * @param {Node} context - DOM node that contains the component markup
	 * @param {Object} data - Optional data object from ComponentLoader.scan()
	 * @param {Object} mediator - instance of ComponentLoader for pub/sub
	 */
	constructor() {
		this.el = arguments[0]
		if (typeof jQuery !== 'undefined') this.$el = jQuery(this.el);
		this.data = arguments[1];
		this.__mediator = arguments[2];

		this._configureData();
	}


	/**
	 * Parses the DOM for all data attributes, converts them to camelCase,
	 * and applies defaults before storing them in `this.data`
	 * 
	 * Order of importance of data is as follows:
	 * 1. Data passed to constructor using ComponentLoader.scan({})
	 * 2. DOM data attributes
	 * 3. defaulData() 
     *
	 * I.e:
	 *  - defaultData() will always be applied if 1) or 2) does not overide the key
	 *  - Any data passed to `scan()` will win over DOM attributes or defaultData with same key
	 * 
	 * @private
	 */ 
	_configureData() {
		const DOMData = {};
		[].forEach.call(this.el.attributes, (attr) => {
			if (/^data-/.test(attr.name)) {
				var camelCaseName = attr.name.substr(5).replace(/-(.)/g, ($0, $1) => {
					return $1.toUpperCase();
				});
				DOMData[camelCaseName] = attr.value;
			}
		});
		// extend defaults
		this.data = objectAssign(this.defaultData?this.defaultData():{}, DOMData, this.data);
	}


	/**
	 * Shorthand for binding multiple functions to `this` in one go
	 * @param {...String} functionName Variable number of function names to bind to this context.
	 * @protected
	 */
	bind() {
		for (var i = 0; i < arguments.length; i++) {
			const funcName = arguments[i];
			this[funcName] = this[funcName].bind(this);
		}
	}


	/**
	 * Publish an event for other components
	 * @protected
	 * @param {String} topic - Event name
	 * @param {Object} data - Optional params to pass with the event
	 */
	publish() {
		this.__mediator.publish(...arguments);
	}


	/**
	 * Subscribe to an event from another component
	 * @protected
	 * @param {String} topic - Event name
	 * @param {Function} callback - Function to bind
	 */
	subscribe(topic, callback) {
		this.__mediator.subscribe(topic, callback, this);
	}


	/**
	 * Unsubscribe from an event from another component
	 * @protected
	 * @param {String} topic - Event name
	 * @param {Function} callback - Function to unbind
	 */
	unsubscribe(topic, callback) {
		this.__mediator.unsubscribe(topic, callback, this);
	}


	/**
	 * Utility method for triggering the ComponentLoader to scan the markup for new components
	 * @protected
	 * @param {Object} data - Optional data to pass to the constructor of any Component initialized by this scan
	 */
	scan(data) {
		this.__mediator.scan(data);
	}


	/**
	 * Utility method for defering a function call
	 * @protected
	 * @param {Function} callback - Function to call
	 * @param {Number} ms - Optional ms to delay, defaults to 17ms (just over 1 frame at 60fps)
	 */
	defer(callback, ms = 17) {
		setTimeout(callback, ms);
	}


	/**
	 * Called by ComponentLoader when component is no longer found in the markup
	 * usually happens as a result of replacing the markup using AJAX
	 *	
	 * Override in subclass and make sure to clean up event handlers etc
	 *
	 * @protected
	 */
	destroy() {

	}
}