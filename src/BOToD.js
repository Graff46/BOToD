self.App = (() => {
	var getEl = el => (el instanceof Element) ? el : document.querySelector(el);
	var IS_PROXY = Symbol('isProxy');
	var MASK = Symbol('mask');
	var MAP = Symbol('map');

	return (settingBits = 0) => {
		var EVENT_TYPE = settingBits & 0b1 ? 'input' : 'change';
		var BINDING_PROPERTY = settingBits & 0b10 ? 'textContent' : 'value';

		var rootObj			= null;
		var currentObjProp	= null;

		var el2handlerBind	= new WeakMap();
		var el2handlerRept	= new WeakMap();
		var El2group		= new WeakMap();
		var el2eventHandler	= new WeakMap();

		var repeatStore    	= Object.create(null);
		var bindReset		= Object.create(null);
		var bindUpd			= Object.create(null);

		var obj2prox		= new WeakMap();

		var skipProxyGetFlg = false;
		var tmp = null;
		var maxCode = 1;

		var _eachBit = (code, collector, el) => {
			var insert = bcode => (collector[bcode] || (collector[bcode] = new Set())).add(el);
			insert(code);

			var nullCnt = 0;
			if (code < 1) return console.error(code);
			while(code !== 1) {
				code >>= 1;
				if (code % 2) {
					if ((code === 1) && (nullCnt))
						insert(code << nullCnt);
					else
						insert(code);

					nullCnt = 0;
				} else
					nullCnt++;
			}
		}

		var addBind = (handler, resHandler, el) => {
			let story = Object.create(null);
			story.upd = handler;
			story.res = resHandler;

			el2handlerBind.set(el, story);

			var code = currentObjProp.obj[MASK];

			(tmp = bindUpd[code]) || (tmp = bindUpd[code] = Object.create(null));
			(tmp[currentObjProp.prop] = (tmp[currentObjProp.prop] || new Set())).add(el);

			currentObjProp = null;

			return _eachBit(code, bindReset, el);
		}

		var addRepeat = (handler, el, group) => {
			el2handlerRept.set(el, handler);
			El2group.set(el, group);

			skipProxyGetFlg = true;
			const msk = currentObjProp.obj[currentObjProp.prop][MASK];
			skipProxyGetFlg = false;

			currentObjProp = null;

			return _eachBit(msk, repeatStore, el);
		}

		var updRepeat = (el, group) => El2group.set(el, group);

		var _unbind = (el, onlyBind) => {
			if (el[IS_PROXY]) return _unbindObj(el);

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
			(tmp = el2eventHandler.get(elm)) && (elm.removeEventListener(EVENT_TYPE, tmp));
			el2eventHandler.delete(elm);
		}

		var _unbindObj = (obj) => {
			for (var code = obj[MASK]; code <= maxCode; code++) {
				[bindReset, bindUpd, repeatStore].forEach(acc => {
					if (tmp = acc[code] && Object.values(acc[code])) {
						tmp.forEach(el => _unbind(el, true)); 
						delete bindReset[code];
						delete bindUpd[code];
						delete repeatStore[code];
					}
				});
			}

			return obj;
		}

		var needStoredGetterFlg = false;
		var skipProxySetFlg = false;

		var buildData = (obj, code = 1, oldMap = Object.create(null)) => {
			var mask = code;
			var props = Object.create(null);

			return new Proxy(obj, {
				get: function(target, prop, receiver) {
					if (prop === IS_PROXY) return true;
					if (prop === MASK) return mask;
					if (prop === MAP) return props;

					if (!skipProxyGetFlg) {
						if (!props[prop]) {
							if (oldMap[prop])
								props[prop] = mask = oldMap[prop];
							else {
								mask <<= Object.keys(props).length;
								props[prop] = mask;
							}
								
							maxCode = Math.max(maxCode, mask);
						}

						if ((target[prop] instanceof Object) && !(target[prop][IS_PROXY])) {
							skipProxySetFlg = true;
							receiver[prop] = buildData(target[prop], ((mask << 1) | 1), props);
							skipProxySetFlg = false;
						} else if (!obj2prox.has(target))
							obj2prox.set(target, receiver);

						if (needStoredGetterFlg) {
							currentObjProp 		= Object.create(null);
							currentObjProp.obj 	= receiver;
							currentObjProp.prop	= prop;
						}
					}

					return Reflect.get(target, prop, receiver);
				},

				set: function(target, prop, val, receiver)  {
					var storebinds = null;
					var storeRepeats = null;

					if ((!skipProxySetFlg) && (val instanceof Object) && (!val[IS_PROXY]))
						val = buildData(val, ((mask << 1) | 1), target[prop][MAP]);

					const result = Reflect.set(target, prop, val, receiver);

					if (skipProxySetFlg) return result;

					if (storeRepeats = repeatStore[mask]) storeRepeats.forEach(el => (tmp = el2handlerRept.get(el)) && tmp(El2group.get(el)));

					if (storebinds = bindReset[mask]) storebinds.forEach(el => (tmp = el2handlerBind.get(el)) && tmp.res());

					if ((storebinds = bindUpd[mask]) && (storebinds = storebinds[prop]))
						storebinds.forEach(el => (tmp = el2handlerBind.get(el)) && tmp.upd());

					return result;
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
					if (repeatStore[currentObjProp.obj[MASK]])
						updRepeat(elm, group);
					else
						addRepeat(extInterface.repeat.bind(null, elm, iterHandle, bindHandle, xrBindCallbackOrFlag), elm, group);
				}

				var newEl = null
				var fragment = new DocumentFragment();

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

				if (fragment.childElementCount) {
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