const Translate = {
	doc: ['Документация', 'Documentation'],
	cap1: [
		' — Библиотека для двустороннего реактивного связывания JavaScript данных c DOM элементами. Для отслеживания Object он лениво-рекурсивно оборачивается в Proxy.',
		' — A library for two-way reactive data binding between JavaScript data and DOM elements. To track Objects, it lazily and recursively wraps them in Proxy.'
	],
	sum1: [
		'Лениво-рекурсивное обёртывание',
		"Lazy recursive wrapping",
		],
	det1: [
		"Object на нулевой вложенности оборачивается в Proxy обычным способом. Далее, дочерние Object'ы оборачиваются в Proxy, если их пытались читать, причём именно при установке связываний. И так далее по вложенным объектам.",
		"The root-level Object is wrapped in a Proxy in the standard way. Then, child Objects are lazily wrapped in Proxies only when they are accessed during binding setup. This process continues recursively for all nested objects.",
	],
	cap2: [
		'Вы скажите: "Таких фреймворков и библиотек достаточно много". И будете правы, но во всём есть нюансы... Во многих фрейворках биндинг данных с DOM элементами задаётся в вёрстке. В данной же библиотеке всё манипуляции происходят исключительно в коде JavaScript.',
		`You might say: "There are plenty of frameworks and libraries like this." And you’d be right-but the devil’s in the details...
In many frameworks, data binding with DOM elements is defined in the markup. This library, however, handles all manipulations purely in JavaScript code.`,
	],
}

function setLang(idx = 0) {
	for (const k in Translate)
		self[k].textContent = Translate[k][idx];
}

(() => {
	var idsLang = ['🇷🇺', '🇬🇧'];

	changeTranslate.addEventListener(
		'click', 
		event => {
			let lid = idsLang.indexOf(event.currentTarget.textContent);
			event.currentTarget.textContent = idsLang[lid ^= 1];
			localStorage.setItem('langId', lid);
			return setLang(lid);
		}
	);

	const langId = localStorage.getItem('langId') || 0;
	changeTranslate.textContent = idsLang[langId];
	setLang(langId);
})();