const obj = {
	key: {
		k1: {
			l1: {m1: 1, m11: 2,},
			l2: {m1: 3, m11: 33},
		},

		k112: {
			l1: {m1: 33, m11: 44},
			l2: {m1: 333, m11: 444},
		}
	},

	one: {
		k1: {
			l1: {m1: 55, m11: 55},
			l2: {m1: 555, m11: 555},
		}
	},

	//two: 5,
};

const myApp = App(App.eventTypeInput);
const appData = myApp.buildData(obj);

const y = appData.key;
const yy = appData.one;
var tt;

const nestedLoops = () => {
	y.k1.l1 = {m1: 1, m11: 2,};

	myApp.repeat(
		'.i3',
		appData,
		(el, k) => myApp.repeat(el, appData[k],
			(ell, kk, data) => ell.value = appData[k][kk].l1.m1),
		false
	);

	setTimeout(() => { y.k1.l1 = {m1: 4, m11: 5,}; }, 1000);
	setTimeout(() => { y.k1 = {l1: {m1: 47, m11: 69,}}; }, 2000);
};

var max = 3;
async function render() {
	let str = '';
	for (let i = 1; i <= max; i++) {
		str += `<div>
			<hr>
			<input type="text" class="i1${i}"> <br>
			<input type="text" class="i2${i}"> <br>
			<input type="text" class="i3${i}">
		</div>`;
	}

	document.body.innerHTML += str;
}

async function runTestArray() {
	await render();
	y.k1.l1 = [2, 5];

	console.time(1);
	for (let i = 1; i <= max; i++) {
		myApp.xrBind(`.i3${i}`, x => x.value = y.k1.l1[0], (el) => y.k1.l1[0] = el.value);
		myApp.bind(`.i1${i}`, y.k1.l1[0]);
		myApp.repeat(`.i2${i}`, y.k1.l1, true);
	}
	console.timeEnd(1)

	setTimeout(() => { y.k1 = {l1:[6, 8]}; }, 2000);
	setTimeout(() => { y.k1.l1[3] = 11; myApp.unbind(`.i33`);}, 4000);
	setTimeout(() => {y.k1.l1 = [12, 15, 17 ];}, 6000);
	setTimeout(() => delete y.k1, 8000);
	setTimeout(() => y.k1 = {l1: [ 66, 77]}, 10_000);
	setTimeout(() => y.k1.l1[0] = 100, 12_000);
}

async function runTestObject() {
	await render();
	y.k1.l1 = {m1: 1, m11: 2,};

	console.time(1);
	for (let i = 1; i <= max; i++) {
		/*myApp.xrBind(`.i3${i}`, x => x.value = yy.k1.l1.m1, (el) => yy.k1.l1.m1 = el.value);
		myApp.bind(`.i1${i}`, yy.k1.l1.m1);*/
		myApp.repeat(`.i2${i}`, yy.k1.l1, (el, k) => el.value = yy.k1.l1[k], (el, k) => yy.k1.l1[k] = el.value);
	}
	console.timeEnd(1)

	setTimeout(() => { yy.k1 = {l1: {m1: 58}}; }, 2000);
	setTimeout(() => { yy.k1.l1.m111 = 3;/* myApp.unbind(`.i33`);*/}, 4000);
	setTimeout(() => {yy.k1.l1 = {m1: 65, m11: 31, m111: 4};}, 6000);
	setTimeout(() => {delete yy.k1; tt=1 }, 8000);
	setTimeout(() => {yy.k1 = {l1: {m1: 77, m11: 88}}; }, 10_000);
	setTimeout(() => yy.k1.l1.m1 = 100, 12_000);
}

const nestedTest = () => {
	document.body.innerHTML += '<div class="d"><span class="s"><div class="q"> <p class="p"></p> </div></span></div>';

	const appData = myApp.buildData({
		one: {
			11: {
				111: {
					1111: 1111,
					1112: 1112,
				}
			},
			12: {
				121: {
					1211: 1211,
					1212: 1212,
				}
			},
		},
		two: {
			21: {
				212: {
					2121: 2121,
					2122: 2122,
				}
			},
			22: {
				222: {
					2221: 2221,
					2222: 2222,
				}
			},
		},
	});

	/*myApp.repeat(
		'.d',
		appData, 
		(el, k) => myApp.repeat(
			el.querySelector('.s'),
			appData[k],
			(el2, k2) => myApp.repeat(
				el2.querySelector('.p'),
				appData[k][k2],
				(el3, k3)=> el3.textContent = appData[k][k2][k3]) 
		)
	)*/

	const f1 = (el, k, data) => el.myprop2 = data[k];
	const f2 = (el, k, data) => el.textContent = data[k];
	const f3 = (el, k) => el.myprop = appData[k];

	myApp.nestedRepeat('.d', appData, 
		f3
	)
		('.s', f1)
		('.q', (el, k, data) => data[k])
		('.p', f2)();
}