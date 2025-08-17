var MyApp = App();

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