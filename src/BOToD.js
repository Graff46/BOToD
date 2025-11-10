self.App = (() => {
	var getEl = el => (el instanceof Element) ? el : document.querySelector(el);
	var parseSelector = (el, selector) => selector.isEl ? 
		el.insertAdjacentElement('beforeend', selector.getEl[0].cloneNode(true)):
		el.querySelector(selector);

	var _IS_PROXY = Symbol('isProxy');
	var _MASK = Symbol('mask');
	var _DEEP = Symbol('deep');
	var _PRNTS = Symbol('prnts');

	var Core = (settingBits = 0, globalHandler, globalCallback) => {
		var EVENT_TYPE = settingBits & 0b1 ? 'input' : 'change';
		var BINDING_PROPERTY = settingBits & 0b10 ? 'textContent' : 'value';

		globalHandler = (globalHandler) || ((el, key, data) => el[BINDING_PROPERTY] = data[key]);
		globalCallback = (globalCallback) || ((el, cop) => cop.obj[cop.prop] = el[BINDING_PROPERTY]);

		var currentObjProp = null;

		var el2handlerBind	= new WeakMap();
		var el2handlerRept	= new WeakMap();
		var El2group		= new WeakMap();
		var el2eventHandler	= new WeakMap();

		var repeatStore    	= Object.create(null);
		var bindReset		= Object.create(null);
		var bindUpd			= Object.create(null);

		var obj2prox		= new WeakMap();

		var tmp = null;
		var maxCode = 1;
		var matrix = Object.create(null);

		var extInterface = null;
		var rootObj = null;

		var fromParents = parents => parents.reduce((acc, p) => acc[p], rootObj);

		var _eachBit = (code, collector, el, needAddSelf) => {
			var insert = bcode => (collector[bcode] || (collector[bcode] = new Set())).add(el);
			needAddSelf && insert(code);

			var nullCnt = 0;
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
			var code = currentObjProp.mask;

			let story = Object.create(null);
			story.upd = handler;
			story.res = resHandler;

			el2handlerBind.set(el, story);

			(tmp = bindUpd[code]) || (tmp = bindUpd[code] = Object.create(null));
			(tmp[currentObjProp.prop] = (tmp[currentObjProp.prop] || new Set())).add(el);

			currentObjProp = null;

			return _eachBit(code, bindReset, el);
		}

		var addRepeat = (handler, el, group) => {
			const msk = currentObjProp.childMask;

			el2handlerRept.set(el, handler);

			currentObjProp = null;

			return _eachBit(msk, repeatStore, el, true);
		}

		var resetEl = elm => {
			if (globalHandler) globalHandler(elm, [null], 0);

			elm[BINDING_PROPERTY] = null;

			const group = El2group.get(elm);
			if (group) {
				var fragment = document.createDocumentFragment();
				Object.values(group).forEach(el => fragment.append(el));
				elm.hidden = false;
			};

			El2group.delete(elm);
			(tmp = el2eventHandler.get(elm)) && (elm.removeEventListener(EVENT_TYPE, tmp));
			el2eventHandler.delete(elm);
		};

		var _unbind = (el, onlyBind) => {
			const elm = getEl(el);

			el2handlerBind.delete(elm);

			elm[BINDING_PROPERTY] = null;

			if (onlyBind) return;

			el2handlerRept.delete(elm);

			return resetEl(elm);
		}

		var _unbindObj = (obj, onlyReset, prop) => {
			obj = prop ? obj[prop] : currentObjProp.obj;

			var ldeep = obj[_DEEP];
			if ((!onlyReset) && (tmp = matrix[ldeep - 1])) delete tmp[prop || currentObjProp.prop];
			currentObjProp = null;
			needStoredGetterFlg = false;

			var handler = onlyReset ? resetEl : _unbind;
			var row = null;

			const msk = obj[_MASK];
			var code = msk;
			for (let i = 1, pow2 = 1; code <= maxCode; i++) {
				(i === pow2) ? (code = msk * i) && (pow2 *= 2) : code++;

				if (!onlyReset) {
					if (code % 2)
						row = matrix[ldeep++];
					else
						for (let prp in row) if (row[prp] === code) delete row[prp];
				}

				[repeatStore, bindReset].forEach(stor => {
					if ((stor[code]) && (tmp = stor[code])) {
						tmp.forEach(el => handler(el));
						if (!onlyReset) delete acc[code];
					}
				});

				if ((tmp = bindUpd[code]) && (tmp = Object.values(tmp))) {
					Object.values(tmp).forEach(itm => itm.forEach(el => handler(el)));
					if (!onlyReset) delete bindUpd[code];
				}
			}

			return obj;
		}

		var needStoredGetterFlg = false;
		var skipProxySetFlg = false;

		var buildData = (obj, code = 1, deepLvl = 0, prnts = [], afProp) => {
			var matRow = matrix[deepLvl] = Object.create(null);

			const cond = prnts[deepLvl - 1] != afProp;  
			prnts = (prnts[deepLvl - 1]) && cond ? Array.from(prnts) : prnts;
			if (afProp && cond) prnts[deepLvl - 1] = afProp;

			return new Proxy(obj, {
				mask: code,
				nextCode: code,
				get parents() {return prnts.slice(0, deepLvl + 1)},

				get: function(target, prop, receiver) {
					if (prop === _IS_PROXY) return true;
					if (prop === _MASK) return code;
					if (prop === _DEEP) return deepLvl;
					if (prop === _PRNTS) return this.parents;

					let childCode = ((this.nextCode << 1) | 1);
					if ((typeof(target[prop]) === 'object') && !(target[prop][_IS_PROXY])) {
						skipProxySetFlg = true;
						this.nextCode = (matRow[prop]) || (matRow[prop] = this.nextCode << 1);
						receiver[prop] = buildData(target[prop], childCode = ((this.nextCode << 1) | 1), deepLvl + 1, prnts, prop);
						skipProxySetFlg = false;

						maxCode = Math.max(maxCode, childCode);
					} else if (!obj2prox.has(target))
						obj2prox.set(target, receiver);

					if (needStoredGetterFlg) {
						currentObjProp = Object.create(null);
						currentObjProp.mask = code;
						currentObjProp.prop	= prop;
						currentObjProp.obj = receiver;
						currentObjProp.childMask = childCode;
						Object.freeze(currentObjProp);
					}

					return Reflect.get(target, prop, receiver);
				},

				set: function(target, prop, val, receiver) {
					if (!skipProxySetFlg) {
						if (Array.isArray(target) && (!((prop === 'length') || isFinite(prop))))
							return Reflect.set(target, prop, val, receiver);
						else if ((typeof(val) === 'object') && (!val[_IS_PROXY])) {
							this.nextCode = (matRow[prop]) || (matRow[prop] = this.nextCode << 1);
							val = buildData(val, ((this.nextCode << 1) | 1), deepLvl + 1, prnts);
							if (prnts[deepLvl] !== prop) prnts[deepLvl] = prop;
						}
					}

					const result = Reflect.set(target, prop, val, receiver);
					if (skipProxySetFlg) return result;

					var storebinds = null, storeRepeats = null;

					if (storeRepeats = repeatStore[code]) storeRepeats.forEach(el => (tmp = el2handlerRept.get(el)) && tmp(true));

					if (storebinds = bindReset[code]) storebinds.forEach(el => (tmp = el2handlerBind.get(el)) && tmp.res(true));

					if ((storebinds = bindUpd[code]) && (storebinds = storebinds[prop]))
						storebinds.forEach(el => (tmp = el2handlerBind.get(el)) && tmp.upd(true));

					return result;
				},

				deleteProperty: function(target, prop) {
					if ((target[prop] instanceof Object) && target[prop][_IS_PROXY]) 
						_unbindObj(target, true, prop);

					return Reflect.deleteProperty(target, prop);
				},
			});
		}

		var bind = (elSel, val, key) => {
			var parents = Array.from(currentObjProp.obj[_PRNTS]), prp = currentObjProp.prop;
			const handler = (el, k) => globalHandler(el, k || prp, fromParents(parents));

			return xrBind(elSel, handler, globalCallback, key, true, 0);
		}

		var xrBind = (el, handler, callback, rptKey, __needCurrObj = false, stateCall) => {
			const elm = getEl(el);

			needStoredGetterFlg = stateCall !== 0;
			handler(elm, rptKey);
			needStoredGetterFlg = false;

			var cObjProp = __needCurrObj ? Object.create(null) : null;
			if (__needCurrObj) {
				cObjProp.obj = currentObjProp.obj;
				cObjProp.prop = currentObjProp.prop;
			}

			if ( (currentObjProp) && !(stateCall && bindUpd[currentObjProp.mask]) )
				addBind(handler.bind(null, elm, rptKey), xrBind.bind(null, elm, handler, callback, rptKey, __needCurrObj), elm);

			if (tmp = el2eventHandler.get(elm)) elm.removeEventListener(EVENT_TYPE, tmp);
			if (callback) {
				const eventHandler = event => callback(event.currentTarget, cObjProp || rptKey);
				el2eventHandler.set(elm, eventHandler);
				elm.addEventListener(EVENT_TYPE, eventHandler);
			}
		}

		var frmNested = false;
		var repeat = (el, iterObj, bindHandle, xrBindCallbackOrFlag = true, storyCall) => {
			var elm = getEl(el);

			if (bindHandle === true)
				bindHandle = globalHandler;

			needStoredGetterFlg = true;
			const parents = (storyCall) || (iterObj === rootObj) || (!currentObjProp) || frmNested ? iterObj : Array.from(currentObjProp.obj[_PRNTS]);
			const iter = (storyCall) || ((iterObj !== rootObj) && currentObjProp && !frmNested) ? fromParents(parents) : iterObj;
			needStoredGetterFlg = false;

			var group = Object.create(null);
			var updGroup = El2group.get(elm) || Object.create(null);

			if ((currentObjProp) && (xrBindCallbackOrFlag != null) && bindHandle) {
				if (!(storyCall && repeatStore[iter[_MASK]]))	
					addRepeat(extInterface.repeat.bind(null, elm, parents, bindHandle, xrBindCallbackOrFlag), elm, group);

				currentObjProp = null;
				El2group.set(elm, group);
			}

			var newEl = null;
			for (const key in iter) {
				if (!(key in updGroup)) {
					newEl = elm.cloneNode(true);
					newEl.hidden = false;
					newEl.setAttribute('__key', key);

					group[key] = newEl;

					elm.before(newEl);

					if ((xrBindCallbackOrFlag) || (xrBindCallbackOrFlag === null)) {
						xrBind(
							newEl,
							(el, k) => bindHandle(el, k, fromParents(iter[_PRNTS])),
							xrBindCallbackOrFlag instanceof Function ? xrBindCallbackOrFlag : xrBindCallbackOrFlag === null ? null : globalCallback,
							key,
						);
					} else if (bindHandle)
						bindHandle(newEl, key);
				} else
					group[key] = updGroup[key];

				delete updGroup[key];
			}

			if (newEl) elm.hidden = true;

			for (let k in updGroup) {
				tmp = updGroup[k];
				tmp.remove();
				
				tmp.removeEventListener(EVENT_TYPE, el2eventHandler.get(tmp));
				el2eventHandler.delete(tmp);
				el2handlerBind.delete(tmp);
				el2handlerRept.delete(tmp);
				El2group.delete(tmp);
			};
		}

		var handlerNestedRepeat = (listParam, args) => {
			var defFn = (el, k, data) => data[k];
			var stack = [];
			
			frmNested = true;
			var itm = listParam[0];
			stack[0] = (el, data) => repeat(
				parseSelector(el, itm[0]),
				data,
				(e, k) => itm[1](e, k, data),
				...(itm.slice(2))
			);

			listParam.forEach((itm, i) => {
				if (i === 0) return;

				stack[i] = (afEl, data) => {
					repeat(
						parseSelector(afEl, itm[0]),
						data,
						(el, k) => {
							const newData = (itm[1] || defFn)(el, k, data);
							stack[i - 1](el, newData);
						},
						...(itm.slice(2))
					);
				}
			});
			
			var afterStack = args[2];
			args[2] = (el, k) => {
				const newData = afterStack(el, k, args[1]);
				stack[stack.length - 1](el, newData);
			};
			
			repeat.apply(null, args);
			frmNested = false;
		};

		var nestedRepeat = (...args) => {
			var listParam = [];

			var nested = (...a) => {
				if (a.length)
					listParam.unshift(a);
				else
					return handlerNestedRepeat(listParam, args);

				return (...b) => {
					needStoredGetterFlg = true;
					return nested(...b);
				};
			};

			return nested;
		}

		return extInterface = Object.create(null, {
			buildData: {value: obj => rootObj = buildData(obj)},
			unbind: {value: _unbind},
			xrBind: {value: xrBind},
			bind: {get: () => needStoredGetterFlg = true && bind},
			repeat: {get: () => needStoredGetterFlg = true && repeat},
			nestedRepeat: {get: () => needStoredGetterFlg = true && nestedRepeat},
			unbindObj: {get: () => needStoredGetterFlg = true && _unbindObj},
		});
	};

	Core.eventTypeInput = 0b1;
	Core.textContentBinding = 0b10;
	Core.DOMBuilder = (docFragment, lastEl) => {
		return new Proxy((...args) => {
			if (!args[0].isEl) {
				var props = args.shift();
				for (const k in props)
					lastEl.setAttribute(k, props[k]);
			}

			if (args.length)
				args.shift().getEl.forEach(el => lastEl.append(el.cloneNode(true)));

			return Core.DOMBuilder(docFragment);
		}, {
			get: (target, prop, receiver) => {
				if (typeof prop === 'string') {
					if (prop === 'isEl') return true;
					if (prop === 'getEl') return docFragment.childNodes;

					const newEl = document.createElement(prop);
					const df = docFragment || document.createDocumentFragment();
					df.append(newEl);

					return Core.DOMBuilder(df, newEl);
				} else
					return Reflect.get(target, prop, receiver);
			},

			set: () => {throw new SyntaxError("Don't set values!")},
		});
	}

	return Core;
})();