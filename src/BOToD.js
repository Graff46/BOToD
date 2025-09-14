self.App = (() => {
	var getEl = el => (el instanceof Element) ? el : document.querySelector(el);
	var _IS_PROXY = Symbol('isProxy');
	var _PARENTS = Symbol('parents');
	var _SET_EL = Symbol('setEl');
	var _GET_EL = Symbol('getEl');

	return (settingBits = 0) => {
		var EVENT_TYPE = settingBits & 0b1 ? 'input' : 'change';
		var BINDING_PROPERTY = settingBits & 0b10 ? 'textContent' : 'value';

		var rootObj = null;
		var currentObjProp = null;

		var el2binds = new WeakMap();
		var el2bindsUpd = new WeakMap();
		var el2repeats = new WeakMap();
		var El2group = new WeakMap();
		var el2eventHandler	= new WeakMap();

		var obj2prox = new WeakMap();

		var skipProxyGetFlg = false;
		var tmp;

		var addBind = (handler, resHandler, el) => {
			(tmp = el2bindsUpd.get(el)) || (el2bindsUpd.set(el, tmp = Object.create(null)));
			tmp[currentObjProp.prop] = handler;

			if (tmp = currentObjProp.obj[_PARENTS]) {
				tmp.forEach(obj => {
					obj[_SET_EL](el);
					el2binds.set(el, resHandler);
				});
			}

			currentObjProp.obj[_SET_EL](el);

			currentObjProp = null;
		}

		var addRepeat = (handler, el) => {
			el2repeats.set(el, handler);

			if (!currentObjProp)
				return rootObj && rootObj[_SET_EL](el);

			const insertHandler = obj => {
				obj[_SET_EL](el);
				el2repeats.set(el, handler);
				return obj;
			}

			insertHandler(currentObjProp.val)[_PARENTS].forEach(insertHandler);

			currentObjProp = null;
		}

		var resetEl = elm => {
			elm.value = null;

			const group = El2group.get(elm);
			if (group) {
				const fragment = document.createDocumentFragment();
				Object.values(group).forEach(el => fragment.append(el));
				elm.hidden = false;
			};

			El2group.delete(elm);
			(tmp = el2eventHandler.get(elm)) && (elm.removeEventListener(EVENT_TYPE, tmp));
			el2eventHandler.delete(elm);
		}

		var _unbind = (el, onlyBind) => {
			const elm = getEl(el);
	
			el2binds.delete(elm);
			el2bindsUpd.delete(elm);

			elm.value = null;

			if (onlyBind) return;

			el2repeats.delete(elm);

			return resetEl(elm);
		}

		var needStoredGetterFlg = false;
		var skipProxySetFlg = false;

		var buildData = (obj, prnt, els) => {
			var parents = prnt;
			var elms = els || new Set();

			return new Proxy(obj, {
				get: (target, prop, receiver) => {
					if (prop === _IS_PROXY) return true;
					if (prop === _PARENTS) return parents;
					if (prop === _SET_EL) return e => elms.add(e);
					if (prop === _GET_EL) return elms;

					if (!skipProxyGetFlg) {
						if (needStoredGetterFlg) {
							currentObjProp 		= Object.create(null);
							currentObjProp.obj 	= receiver;
							currentObjProp.prop	= prop;
						}

						if (typeof(target[prop]) === 'object') {
							if (!(target[prop][_IS_PROXY])) {
								skipProxySetFlg = true;
								receiver[prop] = buildData(target[prop], new Set(parents).add(receiver), elms);
								skipProxySetFlg = false;
							}

							(currentObjProp) && (currentObjProp.val = target[prop]);
						} else if (!(obj2prox.has(target)))
							obj2prox.set(target, receiver);
					}

					return Reflect.get(target, prop, receiver);
				},

				set: (target, prop, val, receiver) => {

					if (!skipProxySetFlg) {
						if ((Array.isArray(target)) && (!((prop === 'length') || isFinite(prop))))
							return Reflect.set(target, prop, val, receiver);
						else if ((typeof(val) === 'object') && (!val[_IS_PROXY]))
							val = buildData(val, new Set(parents).add(receiver), elms);
					}

					const result = Reflect.set(target, prop, val, receiver);

					if (skipProxySetFlg) return result;

					elms.forEach(e => {
						if (tmp = el2binds.get(e)) tmp(true);
						if (tmp = el2repeats.get(e)) tmp(true);
						if ((tmp = el2bindsUpd.get(e)) && (tmp = tmp[prop])) tmp(true);
					});

					return result;
				},

				deleteProperty: (target, prop, receiver) => {
					if (target[prop] && target[prop][_IS_PROXY])
						target[prop][_GET_EL].forEach(e => resetEl(e));

					return Reflect.deleteProperty(target, prop, receiver);
				}
			});
		}

		var extInterface = {
			buildData: obj => rootObj = buildData(obj),

			bind: (elSel, hndl, args) => {
				const callback = (el, cop) => cop.obj[cop.prop] = el[BINDING_PROPERTY];
				const handler = el => el[BINDING_PROPERTY] = hndl(args);

				return extInterface.xrBind(elSel, handler, callback, true);
			},

			xrBind: (el, handler, callback, __needCurrObj = false, rptKey, storyFlag) => {
				const elm = getEl(el);

				needStoredGetterFlg = true;
				handler(elm, rptKey);
				needStoredGetterFlg = false;

				var cObjProp = __needCurrObj ? Object.assign(Object.create(null), currentObjProp) : null;

				if ((currentObjProp) && !(storyFlag && el2bindsUpd.has(elm)))
					addBind(handler.bind(null, elm, rptKey), extInterface.xrBind.bind(null, elm, handler, callback, __needCurrObj, rptKey), elm);

				if ((callback) && !(storyFlag && el2eventHandler.has(elm))) {
					elm.removeEventListener(EVENT_TYPE, el2eventHandler.get(elm));
					const eventHandler = event => callback(event.currentTarget, cObjProp || rptKey);
					el2eventHandler.set(elm, eventHandler);
					elm.addEventListener(EVENT_TYPE, eventHandler);
				}
			},

			repeat: (el, iterHandle, bindHandle, xrBindCallbackOrFlag = true, storyFlag) => {
				var elm = getEl(el);

				needStoredGetterFlg = true;
				var iter = iterHandle();
				needStoredGetterFlg = false;

				var group = Object.create(null);
				updGroup = El2group.get(elm) || Object.create(null);

				if ((currentObjProp) && (xrBindCallbackOrFlag != null) && !(storyFlag && el2repeats.has(elm)) )
					addRepeat(extInterface.repeat.bind(null, elm, iterHandle, bindHandle, xrBindCallbackOrFlag), elm);

				var fragment = document.createDocumentFragment();
				var newEl = null;

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

				El2group.set(elm, group);

				if (fragment.childElementCount) {
					elm.hidden = true;
					elm.after(fragment);
				}

				let delel;
				for (let k in updGroup) {
					delel = updGroup[k];

					el2repeats.delete(delel);
					el2binds.delete(delel);
					el2bindsUpd.delete(delel);
					iter[_GET_EL].delete(delel);
					el2eventHandler.delete(delel);

					fragment.append(delel);
				};
			},

			unbind: _unbind,
		};

		return extInterface;
	};
})();

App.eventTypeInput = 0b1;
App.textContentBinding = 0b10;