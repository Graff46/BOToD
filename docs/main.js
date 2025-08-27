self.domenApp = 'BOToD';

async function setLang(idx = 0) {
	for (const k in Translate)
		self[k].textContent = Translate[k][idx];
}

var idsLang = ['🇷🇺', '🇬🇧'];

changeTranslate.addEventListener('click', event => {
	let lid = idsLang.indexOf(event.currentTarget.textContent);
	event.currentTarget.textContent = idsLang[lid ^= 1];
	localStorage.setItem('langId', lid);
	return setLang(lid);
})

const langId = localStorage.getItem('langId') || 0;
changeTranslate.textContent = idsLang[langId];
setLang(langId);