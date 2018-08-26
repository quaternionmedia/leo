//Leo
var pdfDoc = null,
	numPages = null,
	pageNum = 1,
	pageRendering = false,
	pageNumPending = null,
	scale = 1,
	songURL = null,
	pdfCanvas = document.getElementById('pdfCanvas'),
	navCanvas = document.getElementById('navCanvas'),
	navContext = navCanvas.getContext('2d'),
	width = pdfCanvas.getSize,
	ctx = pdfCanvas.getContext('2d'),
	mc = new Hammer(navCanvas),
	leo = paper.project,
	penPath = new Path(),
	annotate = false,
	movePath = false,
	penColor = 'black',
	penStrokeSize = 5,
	strokeOpacity = 1,
	values = {
		paths: 50,
		minPoints: 5,
		maxPoints: 15,
		minRadius: 30,
		maxRadius: 90},
	hitOptions = {
		segments: true,
		stroke: true,
		fill: true,
		tolerance: 5},
	segment = null,
	path = null,
	wsuri = "wss://" + window.location.hostname + "/ws",
	connection = new autobahn.Connection({
		url: wsuri,
		realm: "realm1"
	}),
auth,
user;

PDFJS.workerSrc = 'js/pdfjs/pdf.worker.js';
leo.activate();

//hammer
mc.on(new Hammer.Tap({event: 'doubletap', taps: 2}));
mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
mc.get('swipe').set({threshold:2, velocity:0.1});
mc.on("swiperight", function(ev) {if(!annotate)onPrevPage();});
mc.on("swipeleft", function(ev) { if(!annotate)onNextPage();});
mc.on("doubletap", function(ev) { toggleAnnotate(); });
mc.on("swipeleft swiperight swipeup swipedown tap tripletap", function(ev) {
	console.log(ev.type +" gesture detected.");
});

//conductor
connection.onopen = function (session, details) {
	console.log("Connected: ", details);
	session.subscribe('local.conductor.songURL', loadPDFfromURL);
	session.subscribe('local.conductor.song', loadPDFfromBin);
	session.subscribe('local.conductor.page', queueRenderPage);
	session.subscribe('local.conductor.annotations', drawAnnotations);

	//retreive song from conductor
	setTimeout(function() {session.call('local.conductor.getSong').then(function(res) {firstLoad(res);});}, 1000);
};
connection.open();
firstLoad("The-Bebop-Bible.pdf");
setTimeout(function(){console.log(numPages);}, 1000);

//window
setTimeout(resizeCanvas, 1000);
window.addEventListener('resize', resizeCanvas, true);

var menu = new Layer().activate();
leo.layers['menu'] = menu;

var w = paper.view.size.width;
var h = paper.view.size.height;

var loginButton = new Path.Rectangle(new Point(w-40, 80), 40);
var loginText = new PointText(new Point(w-50, 40));
loginText.fillColor = 'black';
loginText.strokeColor = 'white';
loginText.content = 'Login';

var annotateButton = new Path.Rectangle(new Point(20, h-80), 40);
var annotateText = new PointText(new Point(0, h-80));
annotateText.fillColor = 'black';
annotateText.strokeColor = 'white';
annotateText.content = 'Annotate';

var strokeText = new PointText(new Point(10,10));
strokeText.fillColor = 'black';
strokeText.strokeColor = 'white';
strokeText.content = 'Stroke\nColor, Size, Opacity';

var redButton = new Path.Rectangle(new Point(20, 40), 20);
var blackButton = new Path.Rectangle(new Point(20, 60), 20);
var whiteButton = new Path.Rectangle(new Point(20, 80), 20);
var greenButton = new Path.Rectangle(new Point(20, 100), 20);
var blueButton = new Path.Rectangle(new Point(20, 120), 20);

var smallPenButton = new Path.Circle(new Point(70, 50), 7);
var mediumPenButton = new Path.Circle(new Point(70, 80), 14);
var largePenButton = new Path.Circle(new Point(70, 120), 21);

var opacityLowButton = new Path.Circle(new Point(120, 50), 7);
var opacityMidButton = new Path.Circle(new Point(120, 80), 14);
var opacityHighButton = new Path.Circle(new Point(120, 120), 21);


loginButton.fillColor = 'orange';
annotateButton.fillColor = 'pink';

redButton.fillColor = 'red';
blackButton.fillColor = 'black';
blackButton.strokeColor = 'white';
whiteButton.strokeColor = 'black';
whiteButton.fillColor = 'white';
greenButton.fillColor = 'green';
blueButton.fillColor = 'blue';

smallPenButton.strokeColor = 'white';
smallPenButton.fillColor = penColor;
mediumPenButton.strokeColor = 'white';
mediumPenButton.fillColor = penColor;
largePenButton.strokeColor = 'white';
largePenButton.fillColor = penColor;

opacityLowButton.fillColor = 'yellow';
opacityLowButton.opacity = 0.2;
opacityMidButton.fillColor = 'yellow';
opacityMidButton.opacity = 0.6;
opacityHighButton.fillColor = 'yellow';
opacityHighButton.opacity = 1;

redButton.on('click', function(event) {penColor = 'red';});
blackButton.on('click', function(event) {penColor = 'black';});
whiteButton.on('click', function(event) {penColor = 'white';});
greenButton.on('click', function(event) {penColor = 'green';});
blueButton.on('click', function(event) {penColor = 'blue';});
smallPenButton.on('click', function(event){penStrokeSize = 5;});
mediumPenButton.on('click', function(event){penStrokeSize = 20;});
largePenButton.on('click', function(event){penStrokeSize = 50;});
opacityLowButton.on('click', function(event){strokeOpacity = 0.2;});
opacityMidButton.on('click', function(event){strokeOpacity = 0.6;});
opacityHighButton.on('click', function(event){strokeOpacity = 1;});


function initSignIn() {
	gapi.load('auth2', function() {
		console.log("auth library loaded");

	auth = gapi.auth2.getAuthInstance({
			client_id: "773135597766-ofk2e5lehiv3tabtmppq7prutqaifgbj.apps.googleusercontent.com",
			fetch_basic_profile: true,
			scope: 'profile email'
	});
		console.log('login clicked');

		if (!auth.isSignedIn.get()) {
			auth.signIn().then(function(googleUser) {
		console.log("login completed. ", googleUser);
		var profile = googleUser.getBasicProfile();
		console.log("ID: " + profile.getId());
		console.log('Full Name: ' + profile.getName());
		console.log('Given Name: ' + profile.getGivenName());
		console.log('Family Name: ' + profile.getFamilyName());
		console.log("Image URL: " + profile.getImageUrl());
		console.log("Email: " + profile.getEmail());
		user = profile.getId();
				});
			};
		});

}

loginButton.on('click', function(event){
	initSignIn();
});

annotateButton.on('click', function(event){toggleAnnotate();});

tool.onKeyDown = function(event) {
	if (event.key == 'space') {
		toggleAnnotate();
		return false;
	}
	if (event.key == 'right') {
		if(!annotate)onNextPage();
		return false;
	}
	if (event.key == 'left') {
		if(!annotate)onPrevPage();
		return false;
	}
	if (event.key == 'up') {
		console.log('conduct toggle');
	}
	if (event.key == 'down') {
		console.log('menu toggle')
	}

	//if (event.key == 'u') {
		//leo.activeLayer.lastChild.remove();
	//}
}


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

function renderPage(num) {
	pageRendering = true;
	hideAnnotations(pageNum);

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
			showAnnotations(pageNum);
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

}

/** If another page rendering in progress, waits until the rendering is
* finised. Otherwise, executes rendering immediately.*/
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
			renderPage(num);
		}
	}
}

// Displays previous page.
function onPrevPage() {
	if (pageNum <= 1) {
		queueRenderPage(pdfDoc && pdfDoc.numPages);
	} else {
		queueRenderPage(pageNum - 1);
	}

}

//Displays next page.
function onNextPage() {
	// pageNum = (pageNum + 1) % pdfDoc.numPages;
	if (pdfDoc && pageNum >= pdfDoc.numPages) {
		queueRenderPage(1);
	} else {
		queueRenderPage(pageNum + 1);
	}
}

//Asynchronously downloads PDF.
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

		// create blank layers for annotations
		initAnnotations();

		// finally, load first page
		queueRenderPage(1);
	});
}

function loadPDFfromBin(pdfBin) {
	console.log('new song', pdfBin);
	if (Array.isArray(pdfBin)) {
		console.log('converting from array ', pdfBin[0]);
		pdfBin = pdfBin[0];
	}
	pdfDoc = PDFJS.getDocument({data:pdfBin}).then(function (pdf_) {
		console.log('pdf loaded! ', pdf_);
		pdfDoc = pdf_;
		numPages = pdfDoc.numPages;
		document.getElementById('page_count').textContent = pdfDoc.numPages;
		queueRenderPage(1);
	});
}

function firstLoad(song) {
	console.log("loading initial song", song);
	try {
		loadPDFfromURL(song);

		wampCall('local.wolf.getAnnotations', [username])
	}
	catch(err) {
		console.log("can't load song because", err);
		loadPDFfromBin(song);
	}

}

function wampCall(where, args) {
	connection.session.call(where, args).then(function(res) {console.log(res);});
}

function openPallate() {
	console.log('opening pallete');
}

function toggleAnnotate() {
	annotate = !annotate;
	//leo.layers['menu'].visible = annotate;
	if (!annotate) {
		saveAnnotations();
	}
}

function saveAnnotations() {
	// export paper project and save to db
	var proj = leo.exportJSON();
	if (user) {
		wampCall('local.wolf.saveAnnotations', [songURL, user, proj]);
		console.log("saved annotation file!", proj);
	} else {
		console.log("Can't save, because user is not logged in");
	}
}

function getAnnotations(song, user) {
	console.log("getting annotations for ", song, user);
	wampCall('local.wolf.getAnnotations', [song, user]).then(function(res) {
		loadAnnotations(res);
	});
}

function loadAnnotations(annotationFile) {
	leo.clear();
	leo.importJSON(annotationFile);
	console.log("imported annotation file!", annotationFile);
	showAnnotations(pageNum);
}

function showAnnotations(p) {
	// if (leo.layers.length > p) {
		leo.layers[p - 1].visible = true;
		// }
	}

	function hideAnnotations(p) {
		// if (leo.layers.length > p) {
			leo.layers[p - 1].visible = false;
			// }

		}

		function initAnnotations() {
			for (var i = 0; i < numPages; i++) {
				var annotations = new Group([]);
				var annotationsLayer = new Layer([annotations]);
				leo.insertLayer(i, annotationsLayer);
			}
		}

		function onMouseDown(event) {
			if(annotate){
				console.log("mouse down on layer ", pageNum, leo.activeLayer.index);
				segment = path = null;
				var hitResult = project.hitTest(event.point, hitOptions);
				if (!hitResult) {
					return;
				}
				if (event.modifiers.shift) {
					if (hitResult.type == 'segment') {
						hitResult.segment.remove();
					};
					return;
				}

				if (hitResult) {
					path = hitResult.item;
					if (hitResult.type == 'segment') {
						segment = hitResult.segment;
					} else if (hitResult.type == 'stroke') {
						var location = hitResult.location;
						segment = path.insert(location.index + 1, event.point);
						path.smooth();
					} else {

					}
				}

				movePath = hitResult.type == 'fill';
					penPath = new Path({
						segments: [event.point],
						strokeColor: penColor,
						strokeWidth:penStrokeSize,
						opacity: strokeOpacity,
						selected: false
					});
				}
			}

			function onMouseMove(event) {
				project.activeLayer.selected = false;
				if (event.item)
				event.item.selected = false;
			}

			function onMouseDrag(event) {
				if (segment) {
					segment.point += event.delta;
					penPath.smooth();
				} else if (path) {
					penPath.position += event.delta;
				}
				else {
					//draw line
					if(annotate) {penPath.add(event.point);}
				}
			}

			function onMouseUp(event) {
				// When the mouse is released, simplify it:
				if (annotate) {
					penPath.simplify(10);

					// add path as child to current layer
					leo.layers[pageNum - 1].addChild(penPath);

					// clear penPath for next annotation
					penPath = new Path({
						elements : [],
						strokeWidth:penStrokeSize,
						opacity:strokeOpacity,
						strokeColor: penColor,
						selected: false
					});
				}
			}

//
// function onSignIn(googleUser) {
// 	// Useful data for your client-side scripts:
// 	var profile = googleUser.getBasicProfile();
// 	console.log("ID: " + profile.getId()); // Don't send this directly to your server!
// 	console.log('Full Name: ' + profile.getName());
// 	console.log('Given Name: ' + profile.getGivenName());
// 	console.log('Family Name: ' + profile.getFamilyName());
// 	console.log("Image URL: " + profile.getImageUrl());
// 	console.log("Email: " + profile.getEmail());
//
// 	// The ID token you need to pass to your backend:
// 	var id_token = googleUser.getAuthResponse().id_token;
// 	console.log("ID Token: " + id_token);
//
// };

function signOut() {
var auth2 = gapi.auth2.getAuthInstance();
auth2.signOut().then(function () {
console.log('User signed out.');
});
}
