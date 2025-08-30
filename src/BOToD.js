self.App = (() => {
	var getEl = el => (el instanceof Element) ? el : document.querySelector(el);
	var IS_PROXY = Symbol('isProxy');

	return (settingBits = 0) => {
		var EVENT_TYPE = settingBits & 0b1 ? 'input' : 'change';
		var BINDING_PROPERTY = settingBits & 0b10 ? 'textContent' : 'value';

		var rootObj			= null;
		var currentObjProp	= null;

		var repeatStore    	= new WeakMap();

		var el2handlerBind	= new WeakMap();
		var el2handlerRept	= new WeakMap();
		var El2group		= new WeakMap();
		var el2eventHandler	= new WeakMap();

		var bindReset		= new WeakMap();
		var bindUpd			= new WeakMap();

		var parents			= new WeakMap();
		var obj2prox		= new WeakMap();

		var skipProxyGetFlg = false;
		var tmp = null;

		var addBind = (handler, resHandler, el) => {
			let story = Object.create(null);
			story.upd = handler;
			story.res = resHandler;

			el2handlerBind.set(el, story);

			if (story = parents.get(currentObjProp.obj))
				story.forEach(obj => {
					(tmp = bindReset.get(obj)) || bindReset.set(obj, tmp = new Set());
					tmp.add(el);
				});

			(story = bindUpd.get(currentObjProp.obj)) || (bindUpd.set(currentObjProp.obj, story = Object.create(null)));
			story[currentObjProp.prop] = (story[currentObjProp.prop] || new Set()).add(el);

			currentObjProp = null;
		}

		var addRepeat = (handler, el, group) => {
			el2handlerRept.set(el, handler);
			El2group.set(el, group);

			const insertHandler = obj => {
				((tmp = repeatStore.get(obj)) || repeatStore.set(obj, tmp = new Set()));
				tmp.add(el);
				return obj;
			}

			if (!currentObjProp)
				return rootObj && repeatStore.set(rootObj, new Set().add(el));

			parents.get( insertHandler(currentObjProp.val) ).forEach(insertHandler);

			currentObjProp = null;
		}

		var updRepeat = (el, group) => El2group.set(el, group);

		var _unbind = (el, onlyBind) => {
			const elm = getEl(el);

			el2handlerBind.delete(elm);

			elm.value = null;

			if (onlyBind) return;

			el2handlerRept.delete(elm);

			const group = El2group.get(elm);
			if (group) {
				var fragment = document.createDocumentFragment();
				Object.values(group).forEach(el => fragment.append(el));
				elm.hidden = false;
			};

			El2group.delete(elm);
			el2eventHandler.delete(elm);
		}

		var needStoredGetterFlg = false;
		var skipProxySetFlg = false;

		var buildData = (obj, prnt) => {
			return new Proxy(obj, {
				get: (target, prop, receiver) => {
					if (prop === IS_PROXY) return true;

					if (!skipProxyGetFlg) {
						if (needStoredGetterFlg) {
							currentObjProp 		= Object.create(null);
							currentObjProp.obj 	= receiver;
							currentObjProp.prop	= prop;
						}

						if (target[prop] instanceof Object) {
							if (!(target[prop][IS_PROXY])) {
								skipProxySetFlg = true;
								const newVal = receiver[prop] = buildData(target[prop], receiver);
								skipProxySetFlg = false;

								parents.set(newVal, (new Set( parents.get(receiver) )).add(receiver));
								if (prnt) parents.set(receiver, (new Set(parents.get(prnt) )).add(prnt));
							}

							(currentObjProp) && (currentObjProp.val = target[prop]);
						} else if (!(obj2prox.has(target)))
							obj2prox.set(target, receiver);
					}

					return Reflect.get(target, prop, receiver);
				},

				set: (target, prop, val, receiver) => { 
					if ((!skipProxySetFlg) && (val instanceof Object) && (!val[IS_PROXY])) {
						val = buildData(val, receiver);
						parents.set(val, (new Set(parents.get(receiver) )).add(receiver));
					}
					const result = Reflect.set(target, prop, val, receiver);

					if (skipProxySetFlg) return result;

					let storeProps = bindReset.get(receiver);

					if (storeProps) storeProps.forEach(el => (tmp = el2handlerBind.get(el)) && tmp.res());

					if ((storeProps = bindUpd.get(receiver)) && (storeProps = storeProps[prop])) 
						storeProps.forEach(el => (tmp = el2handlerBind.get(el)) && tmp.upd());

					if (repeatStore.has(receiver)) {
						storeProps = new Set(repeatStore.get(receiver));
						repeatStore.delete(receiver);
						storeProps.forEach(el => (tmp = el2handlerRept.get(el)) && tmp(El2group.get(el)));
					}

					return result;
				},

				deleteProperty: (target, prop) => {
					var obj = null;
					var store;
					var removed = target[prop];

					if (removed instanceof Object) {
						if ((removed[IS_PROXY]) && (obj = parents.get(removed).keys().toArray())) 
							obj = obj[obj.length - 1];
					} else
						obj = obj2prox.get(target);

					if (store = repeatStore.get(obj)) store.forEach(el => _unbind(el));

					if (store = bindReset.get(obj)) store.forEach(el => _unbind(el, true));
					
					if ((store = bindUpd.get(obj)) && (store = store[prop])) store.forEach(el => _unbind(el, true));

					repeatStore.delete(removed);
					bindReset.delete(removed);
					bindUpd.delete(removed);
					
					return Reflect.deleteProperty(target, prop);
				},
			});
		}

		var extInterface = {
			buildData: obj => rootObj = buildData(obj),

			bind: (elSel, hndl, args) => {
				const callback = (el, cop) => cop.obj[cop.prop] = el[BINDING_PROPERTY];
				const handler = el => el[BINDING_PROPERTY] = hndl(args);

				return extInterface.xrBind(elSel, handler, callback, true);
			},

			xrBind: (el, handler, callback, __needCurrObj = false, rptKey) => {
				const elm = getEl(el);

				needStoredGetterFlg = true;
				handler(elm, rptKey);
				needStoredGetterFlg = false;

				var cObjProp = __needCurrObj ? Object.assign(Object.create(null), currentObjProp) : null;

				if (currentObjProp)
					addBind(handler.bind(null, elm, rptKey), extInterface.xrBind.bind(null, elm, handler, callback, __needCurrObj, rptKey), elm);

				elm.removeEventListener(EVENT_TYPE, el2eventHandler.get(elm));

				if (callback) {
					const eventHandler = event => callback(event.currentTarget, cObjProp || rptKey);
					el2eventHandler.set(elm, eventHandler);
					elm.addEventListener(EVENT_TYPE, eventHandler);
				}
			},

			repeat: (el, iterHandle, bindHandle, xrBindCallbackOrFlag = true, updGroup = Object.create(null)) => {
				var elm = getEl(el);

				needStoredGetterFlg = true;
				var iter = iterHandle();
				needStoredGetterFlg = false;

				var group = Object.create(null);

				if ((currentObjProp) && (xrBindCallbackOrFlag != null)) {
					if (repeatStore.has(currentObjProp.obj))
						updRepeat(elm, group);
					else
						addRepeat(extInterface.repeat.bind(null, elm, iterHandle, bindHandle, xrBindCallbackOrFlag), elm, group);
				}

				var fragment = document.createDocumentFragment();
				var newEl = null
				for (const key in iter) {
					if (!(key in updGroup)) {
						newEl = elm.cloneNode(true);
						newEl.hidden = false;
						newEl.setAttribute('__key', key);

						group[key] = newEl;

						if (xrBindCallbackOrFlag instanceof Function)
							extInterface.xrBind(newEl, bindHandle, xrBindCallbackOrFlag, false, key);
						else if (xrBindCallbackOrFlag && bindHandle)
							extInterface.bind(newEl, bindHandle, key);
						else if (bindHandle)
							bindHandle(newEl, key);

						fragment.append(newEl);
					} else
						group[key] = updGroup[key];

					delete updGroup[key];
				}

				if (fragment.firstChild) {
					elm.hidden = true;
					elm.after(fragment);
				}

				for (k in updGroup) fragment.append(updGroup[k]);
			},

			unbind: _unbind,
		};

		return extInterface;
	};
})();

App.eventTypeInput = 0b1;
App.textContentBinding = 0b10;