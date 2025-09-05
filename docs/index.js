const bkg = self.backgroundListing;

const resize = () => bkg.style.fontSize = (1 / (window.devicePixelRatio || 1)) * 11 + 'px';

if (bkg) {
	fetch('https://cdn.jsdelivr.net/gh/Graff46/BOToD@latest/src/BOToD.js').then(x => x.text())
	.then(x => {
		bkg.textContent = x.repeat(Math.ceil( window.innerWidth * window.innerHeight / 2073600 ) * 4);
		hljs.highlightElement(bkg);
		resize();
	}); 
}

window.addEventListener('resize', resize);

const mouseleave = document.querySelector('#cpt section');
mouseleave.addEventListener('mouseenter', () => bkg.style.filter = "blur(0.85px)");
mouseleave.addEventListener('mouseleave', () => bkg.style.filter = "blur(0px)");

