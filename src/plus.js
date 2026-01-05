Object.defineProperty(HTMLElement.prototype, 'bind', {
	get: function() {
		var el = this;
		var props = {};
		var obj = null;
		var eventName = null;

		return obj = new Proxy({}, {
			set: (target, prop, value, receiver) => {
				if (eventName) props[prop] = true;

				(this.hndlrs = this.hndlrs || []).push(value);
				el.addEventListener(eventName || prop, value, props);
				props = {};
			},
			get: (target, prop, receiver) => {
				if (!eventName)
					eventName = prop;
				else
					props[prop] = true;
				
				return obj;
			}
		});
	},
	enumerable: false,
	configurable: true  // важно: чтобы можно было определить
});