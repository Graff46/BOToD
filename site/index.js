const MyApp = App();

var idsLang = {['🇷🇺']: 0, ['🇬🇧']: 1}
changeTranslate.addEventListener('click', event => {
	event.currentTarget.textContent =
		idsLang[event.currentTarget.textContent] == 0 ? '🇬🇧' : '🇷🇺';
	
	return setLang(idsLang[event.currentTarget.textContent]);
});

setLang();