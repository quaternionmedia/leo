paper.install(window);

PDFJS.workerSrc = 'js/pdfjs/pdf.worker.js';

window.globals = {};

window.onload = function() {
	// Setup directly from canvas id:
	paper.setup('navCanvas');
	var path = new Path();
	path.strokeColor = 'black';
	var start = new Point(100, 100);
	path.moveTo(start);
	path.lineTo(start.add([ 200, -50 ]));
	paper.view.draw();
}



/*
var storage = window.localStorage;
console.log(storage);
var json = JSON.parse(storage);

function localFileSearch() {
	var results = [];
for (var obj in json) {
	results.append(json[obj].name);
}
return results
}

console.log("local files: ", localFileSearch());
*/

var pdfDoc = null,
numPages = null,
pageNum = 1,
pageRendering = false,
pageNumPending = null,
scale = 1,
songURL = null,

pdfCanvas = document.getElementById('pdfCanvas'),
navCanvas = document.getElementById('navCanvas'),
// annCanvas = document.getElementById('annCanvas'),

width = pdfCanvas.getSize,
ctx = pdfCanvas.getContext('2d');


var mc = new Hammer(navCanvas);
mc.on(new Hammer.Tap({event: 'doubletap', taps: 2}));
// let the pan gesture support all directions.
// this wil block the vertical scrolling on a touch-device while on the element
mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

mc.get('swipe').set({threshold:2, velocity:0.1});

mc.on("swipeleft", function(ev) {if(!globals['annotate'])onPrevPage();});
mc.on("swiperight", function(ev) { if(!globals['annotate'])onNextPage();});
//mc.on("swipeup", function(ev) { toggleAnnotate(); });
mc.on("doubletap", function(ev) { globals['toggleAnnotate'](); });
//mc.on("longpress", function(ev) { console.log("longtap");});

// listen to events...
mc.on("swipeleft swiperight swipeup swipedown tap tripletap", function(ev) {
  //  c.textContent = ev.type +" gesture detected.";
	console.log(ev.type +" gesture detected.");

});


//pdfCanvas.style.marginLeft = 100;
//console.log(window.innerWidth);
setTimeout(resizeCanvas, 1000);

function resizeCanvas() {
	var ww = window.innerWidth;
	var pw = pdfCanvas.getBoundingClientRect().width;
	console.log(pdfCanvas.style.marginLeft);
	if(pw<ww){
		pdfCanvas.style.marginLeft = (window.innerWidth - pdfCanvas.getBoundingClientRect().width)/2;
	} else {
		pdfCanvas.style.marginLeft = 0;
	}
}
window.addEventListener('resize', resizeCanvas, true);

function renderPage(num) {
	pageRendering = true;
	// globals['hideAnnotations'](pageNum);
	// Using promise to fetch the page
	if (num.constructor === Array) {

		num = num[0];
		console.log("converting from array", num);

	}
	pdfDoc.getPage(num).then(function(page) {
		var viewport = page.getViewport(scale);
		pdfCanvas.height = viewport.height;
		pdfCanvas.width = viewport.width;

		// Render PDF page into canvas context
		var renderContext = {
			canvasContext: ctx,
			viewport: viewport
		};
		var renderTask = page.render(renderContext);

		// Wait for rendering to finish
		renderTask.promise.then(function() {
			pageRendering = false;
			pageNum = num;
			if (pageNumPending !== null) {
				// New page rendering is pending
				renderPage(pageNumPending);
				pageNumPending = null;
			}
		});
	});

	// Update page counters
	document.getElementById('page_num').textContent = num;
	resizeCanvas();
	// globals['showAnnotations'](pageNum);
}

/**
* If another page rendering in progress, waits until the rendering is
* finised. Otherwise, executes rendering immediately.
*/
function queueRenderPage(num) {

	console.log("about to render page ", num)
	if (Array.isArray(num)) {
		num = num[0];
		console.log("converting from array ", num);

	}
	if (pageRendering) {
		console.log('another page rendering ', num);
		pageNumPending = num;

	} else {
		console.log('rendering page ', num);
		if(pdfDoc) {
			renderPage(num);}
	}
}

/**
* Displays previous page.
*/
function onPrevPage() {
	if (pageNum <= 1) {
		queueRenderPage(pdfDoc && pdfDoc.numPages);
	} else {
		queueRenderPage(pageNum - 1);
	}

}

/**
* Displays next page.
*/
function onNextPage() {
	// pageNum = (pageNum + 1) % pdfDoc.numPages;
	if (pdfDoc && pageNum >= pdfDoc.numPages) {
		queueRenderPage(1);
	} else {
queueRenderPage(pageNum + 1);
	}
}


/**
* Asynchronously downloads PDF.
*/
function loadPDFfromURL(which) {
	if (Array.isArray(which)) {
		console.log('changing type ', which);
		which = which[0];
	}
	songURL = which;
	console.log('getting new pdf doc from ', songURL);
	PDFJS.getDocument(songURL).then(function(pdfDoc_) {
		pdfDoc = pdfDoc_;
		numPages = pdfDoc.numPages;
		document.getElementById('page_count').textContent = numPages;
		// globals['initAnnotations']();
		// Initial/first page rendering
		queueRenderPage(1);
	});
}
//
// function getPDFfromBin(pdfDoc_) {
// 	console.log('new binary pdf doc ', pdfDoc_);
// 	// if(Array.isArray(pdfDoc_)) {
// 	// 	pdfDoc = pdfDoc_[0];
// 	// } else {
// 		// pdfDoc = PDFJS. pdfDoc_;
// 	// }
// 	document.getElementById('page_count').textContent = pdfDoc.numPages;
// 	// Initial/first page rendering
// 	queueRenderPage(1);
// }

function loadPDFfromBin(pdfBin) {
	console.log('new song', pdfBin);
	if (Array.isArray(pdfBin)) {
		console.log('converting from array ', pdfBin[0]);
		pdfBin = pdfBin[0];
	}
	// currentSong = newSong;

	// var decoded = new TextDecoder();
	// var _pdf = new UintBArray(decoded.decode(newSong));
	// var _pdf = new Uint8Array(newSong);
	// console.log('newsong ', newSong);
	// var _pdf = new Uint8Array (ArrayBuffer(newSong));
  //
	// for (var i = 0; i <= _pdf.length - 1; i++) {
	// 	_pdf[i] = newSong[i];
	// }
	// console.log('from bin ', _pdf);
	pdfDoc = PDFJS.getDocument({data:pdfBin}).then(function (pdf_) {
		console.log('pdf loaded! ', pdf_);
		pdfDoc = pdf_;
		numPages = pdfDoc.numPages;
		document.getElementById('page_count').textContent = pdfDoc.numPages;
		queueRenderPage(1);
	});
}
