const obj = {
	key: {
		k1: {
			l1: [2, 5],//{m1: 1, m11: 2,}
		}, 
	},

	one: {
		k1: {
			l1: {m1: 22, m11: 11},
			l2: {m1: 222, m11: 111},
		}
	},

	two: 5,
};

const myApp = App(App.eventTypeInput, (el, obj, prp) => el.value = obj[prp] + '#');
const appData = myApp.buildData(obj);

const y = appData.key;
const yy = appData.one;
var tt;

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

	console.time(1);
	for (let i = 1; i <= max; i++) {
		myApp.xrBind(`.i3${i}`, x => x.value = yy.k1.l1.m1, (el) => yy.k1.l1.m1 = el.value);
		myApp.bind(`.i1${i}`, yy.k1.l1.m1);
		myApp.repeat(`.i2${i}`, yy.k1, (el, k) => el.value = yy.k1[k].m1, (el, k) => yy.k1[k].m1 = el.value);
	}
	console.timeEnd(1)

	//setTimeout(() => { yy.k1 = {l1: {m1: 55}}; }, 2000);
	setTimeout(() => { yy.k1.l1.m111 = 3;/* myApp.unbind(`.i33`);*/}, 4000);
	setTimeout(() => {yy.k1.l1 = {m1: 65, m11: 31, m111: 4};}, 6000);
	setTimeout(() => {delete yy.k1; tt=1 }, 8000);
	//setTimeout(() => {yy.k1 = {l1: {m1: 77, m11: 88}}; }, 10_000);
	//setTimeout(() => yy.k1.l1.m1 = 100, 12_000);
}