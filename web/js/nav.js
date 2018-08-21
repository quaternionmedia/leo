var leo = paper.project;
leo.activate();

var pdfCanvas = document.getElementById('pdfCanvas'),
navCanvas = document.getElementById('navCanvas');

setTimeout(function(){console.log(numPages);}, 1000);

navContext = navCanvas.getContext('2d');

var penPath = new Path();

var annotate = false;

function openPallate() {
	console.log('opening pallete');
}


function toggleAnnotate() {
	annotate = !annotate;
	if (!annotate) {
		saveAnnotations();
	}
}

globals['toggleAnnotate'] = toggleAnnotate;
globals['annotate'] = annotate;
globals['leo'] = leo;

function saveAnnotations() {
	// export paper project and save to db
	var proj = leo.exportJSON();
	wampCall('local.wolf.saveAnnotations', [songURL, 'username', proj]);
	console.log("saved annotation file!", proj);
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
	drawAnnotations()
}

var values = {
	paths: 50,
	minPoints: 5,
	maxPoints: 15,
	minRadius: 30,
	maxRadius: 90
};

var hitOptions = {
	segments: true,
	stroke: true,
	fill: true,
	tolerance: 5
};


function showAnnotations(p) {
if (leo.layers.length > p) {
		leo.layers[p].visible = true;
	}
}

function hideAnnotations(p) {
	if (leo.layers.length > p) {
		leo.layers[p].visible = false;
	}

}
globals['showAnnotations'] = showAnnotations;
globals['hideAnnotations'] = hideAnnotations;

function initAnnotations() {
	for (var i = 0; i < numPages; i++) {

		var annotations = new Group([]);
		var annotationsLayer = new Layer([annotations]);
	if (i == 3 ) {annotations.addChild(new Path.Circle(new Point(1,2), 30));}
		leo.insertLayer(i, annotationsLayer);

	}
	leo.insertLayer(2, new Layer([]));

}


globals['saveAnnotations'] = saveAnnotations;
globals['getAnnotations'] = getAnnotations;
globals['loadAnnotations'] = loadAnnotations;
globals['showAnnotations'] = showAnnotations;
globals['hideAnnotations'] = hideAnnotations;


function createBlob(center, maxRadius, points) {
	var path = new Path();
	path.closed = false;
	for (var i = 0; i < points; i++) {
		var delta = new Point({
			length: (maxRadius * 0.5) + (Math.random() * maxRadius * 0.5),
			angle: (360 / points) * i
		});
		path.add(center + delta);
	}
	path.smooth();
	var lightness = (Math.random() - 0.5) * 0.4 + 0.4;
	var hue = Math.random() * 360;
	path.strokeColor = { opacity: 0.4, hue: hue, saturation: 1, lightness: lightness };
	//path.strokeColor = 'black';
	path.strokeWidth = 4;
	return path;
}

var segment, path;
var movePath = false;
function onMouseDown(event) {
	segment = path = null;
	var hitResult = project.hitTest(event.point, hitOptions);
	if (!hitResult)
		return;

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
	if (movePath)
		project.activeLayer.addChild(hitResult.item);

	// If we produced a path before, deselect it:
	// if (path) {
	// 	path.selected = false;
	// }

	// Create a new path and set its stroke color to black:
	penPath = new Path({
		segments: [event.point],
		strokeColor: 'black',
		strokeWidth:4,
		//opacity: 0.4,
		// Select the path, so we can see its segment points:
		fullySelected: false
	});
}

function onMouseMove(event) {
	project.activeLayer.selected = false;
	if (event.item)
		event.item.selected = true;
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

	// Select the path, so we can see its segments:
	//penPath.fullySelected = true;
	if (leo.layers <= )
	leo.layers[pageNum].addChild(penPath);
	penPath = new Path({
		elements : [],
		strokeWidth:4,
		//opacity:0.4;
		strokeColor: 'black'
	});
}
}

//drawButtons();
