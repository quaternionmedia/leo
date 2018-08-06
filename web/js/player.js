PDFJS.workerSrc = 'js/pdfjs/pdf.worker.js';

var pdfDoc = null,
pageNum = 1,
pageRendering = false,
pageNumPending = null,
scale = 1,


pdfCanvas = document.getElementById('pdfCanvas'),
navCanvas = document.getElementById('navCanvas'),
// annCanvas = document.getElementById('annCanvas'),

width = pdfCanvas.getSize
ctx = pdfCanvas.getContext('2d');

function renderPage(num) {
	pageRendering = true;
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
function getPDFfromURL(which) {
	if (Array.isArray(which)) {
		console.log('changing type ', which);
		which = which[0];
	}
	console.log('getting new pdf doc from ', which);
	PDFJS.getDocument(which).then(function(pdfDoc_) {
		pdfDoc = pdfDoc_;
		document.getElementById('page_count').textContent = pdfDoc.numPages;

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

function changeSong(newSong) {
	console.log('new song', newSong);
	if (Array.isArray(newSong)) {
		console.log('converting from array ', newSong[0]);
		newSong = newSong[0];
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
	pdfDoc = PDFJS.getDocument({data:newSong}).then(function (pdf_) {
		console.log('pdf loaded! ', pdf_);
		pdfDoc = pdf_;
		document.getElementById('page_count').textContent = pdfDoc.numPages;
		queueRenderPage(1);
	});
}
