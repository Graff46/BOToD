self.App = (() => {
	var getEl = el => (el instanceof Element) ? el : document.querySelector(el);
	var _IS_PROXY = Symbol('isProxy');
	var _MASK = Symbol('mask');
	var _DEEP = Symbol('deep');
	var _PRNTS = Symbol('prnts');

	return (settingBits = 0) => {
		var EVENT_TYPE = settingBits & 0b1 ? 'input' : 'change';
		var BINDING_PROPERTY = settingBits & 0b10 ? 'textContent' : 'value';

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

		var rootObj = Object.create(null);

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
			if (el instanceof Function) return _unbindObj(el);

			const elm = getEl(el);

			el2handlerBind.delete(elm);

			elm[BINDING_PROPERTY] = null;

			if (onlyBind) return;

			el2handlerRept.delete(elm);

			return resetEl(elm);
		}

		var _unbindObj = (obj, prop, onlyReset) => {
			if (obj instanceof Function) {
				needStoredGetterFlg = true;
				obj = obj();
				needStoredGetterFlg = false;
			} else
				obj = obj[prop];

			var ldeep = obj[_DEEP];
			if ((!onlyReset) && (tmp = matrix[ldeep - 1])) delete tmp[prop || currentObjProp.prop];
			currentObjProp = null;

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

				[repeatStore, bindReset].forEach(acc => {
					if ((acc[code]) && (tmp = acc[code])) {
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
							if (prnts[deepLvl] !== prop) prnts[prnts] = prop;
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
						_unbindObj(target, prop, true);

					return Reflect.deleteProperty(target, prop);
				},
			});
		}

		bind = (elSel, val, key) => {
			const callback = (el, cop) => cop.obj[cop.prop] = el[BINDING_PROPERTY];
			var parents = Array.from(currentObjProp.obj[_PRNTS]), prp = currentObjProp.prop;
			const handler = el => el[BINDING_PROPERTY] = parents.reduce((acc, p) => acc[p], rootObj)[key || prp];

			return extInterface.xrBind(elSel, handler, callback, true);
		}

		xrBind = (el, handler, callback, __needCurrObj = false, rptKey, storyCall) => {
			const elm = getEl(el);

			if (handler instanceof Function) {
				needStoredGetterFlg = true;
				handler(elm, rptKey);
			} else {
				var parents = Array.from(currentObjProp.obj[_PRNTS]), prp = currentObjProp.prop;
				handler = el => el[BINDING_PROPERTY] = parents.reduce((acc, p) => acc[p], rootObj)[prp];
			}
			needStoredGetterFlg = false;

			var cObjProp = __needCurrObj ? Object.create(null) : null;
			if (__needCurrObj) {
				cObjProp.obj = currentObjProp.obj;
				cObjProp.prop = currentObjProp.prop;
			}

			if ( (currentObjProp) && !(storyCall && bindUpd[currentObjProp.mask]) )
				addBind(handler.bind(null, elm, rptKey), extInterface.xrBind.bind(null, elm, handler, callback, __needCurrObj, rptKey), elm);

			elm.removeEventListener(EVENT_TYPE, el2eventHandler.get(elm));
			if (callback) {
				const eventHandler = event => callback(event.currentTarget, cObjProp || rptKey);
				el2eventHandler.set(elm, eventHandler);
				elm.addEventListener(EVENT_TYPE, eventHandler);
			}
		}

		repeat = (el, iterObj, bindHandle, xrBindCallbackOrFlag = true, storyCall) => {
			var elm = getEl(el);

			needStoredGetterFlg = true;
			let parents = storyCall ? iterObj : Array.from(currentObjProp.obj[_PRNTS]);
			let iter = storyCall ? parents.reduce((acc, p) => acc[p], rootObj) : iterObj;
			needStoredGetterFlg = false;

			var group = Object.create(null);
			var updGroup = El2group.get(elm) || Object.create(null);

			if ((currentObjProp) && (xrBindCallbackOrFlag != null)) {
				if (!(storyCall && repeatStore[iter[_MASK]]))	
					addRepeat(extInterface.repeat.bind(null, elm, parents, bindHandle, xrBindCallbackOrFlag), elm, group);

				El2group.set(elm, group);
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

			for (let k in updGroup) {
				fragment.append(tmp = updGroup[k]);
				
				tmp.removeEventListener(EVENT_TYPE, el2eventHandler.get(tmp));
				el2eventHandler.delete(tmp);
				el2handlerBind.delete(tmp);
				el2handlerRept.delete(tmp);
				El2group.delete(tmp);
			};
		}

		return extInterface = Object.create(null, {
			buildData: {value: obj => rootObj = buildData(obj)},
			unbind: {value: _unbind},
			bind: {get: () => needStoredGetterFlg = true && bind},
			xrBind: {get: () => needStoredGetterFlg = true && xrBind},
			repeat: {get: () => needStoredGetterFlg = true && repeat},
		});
	};
})();

App.eventTypeInput = 0b1;
App.textContentBinding = 0b10;