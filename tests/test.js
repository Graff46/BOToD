const obj = {
    key: {
        k1: {
            l1: {m1: 1, m11: 2,}
        }, 
    },

    one: {
        k2: {
            l2: {m2: 22,}
        }
    },

    two: 5,
};

const myApp = App(obj, App.eventTypeInput);
const appData = myApp.buildData(obj);

const y = appData.key;
const yy = appData.one.k2;

console.time(1);
for (let i = 0; i < 1000; i++) {
    myApp.xrBind('.i3', x => x.value = y.k1.l1.m1, (el) => y.k1.l1.m1 = el.value);
    myApp.bind('.i1', x => y.k1.l1.m1);

    myApp.repeat('.i2', x => y.k1.l1, (el, k) => el.value = y.k1.l1[k], (el, k) => y.k1.l1[k] = el.value);
    //myApp.repeat('.i2', x => appData, (k) => appData[k] ? k: 0);
    var tt;
    setTimeout(() => { y.k1 = {l1:{ m1: 55 }}; }, 20);
    setTimeout(() => { self.tt= 1; y.k1.l1.m111 = 3; /*App.bind('.i3', x => yy.l2.m2)*/;}, 30);
    setTimeout(() => {y.k1.l1 = {m1: 4, m11: 5, m1111: 6 };}, 40);
    //setTimeout(() => delete y.k1, 50);
    setTimeout(() => y.k1 = {l1: { m1: 66, m11: 77}}, 60);
}
console.timeEnd(1)