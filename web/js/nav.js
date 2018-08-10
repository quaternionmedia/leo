
var leo = paper.project;
leo.activate();

pdfCanvas = document.getElementById('pdfCanvas'),
navCanvas = document.getElementById('navCanvas'),

setTimeout(function(){console.log(numPages);}, 10000);

navContext = navCanvas.getContext('2d');

var penPath = new Path();

annotate = false;

function openPallate() {
	console.log('opening pallete');
}

var mc = new Hammer(navCanvas);
mc.on(new Hammer.Tap({event: 'doubletap', taps: 2}));
// let the pan gesture support all directions.
// this wil block the vertical scrolling on a touch-device while on the element
mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

mc.get('swipe').set({threshold:2, velocity:0.1});

mc.on("swipeleft", function(ev) {if(!annotate)onPrevPage();});
mc.on("swiperight", function(ev) { if(!annotate)onNextPage();});
//mc.on("swipeup", function(ev) { toggleAnnotate(); });
mc.on("doubletap", function(ev) { toggleAnnotate(); });
//mc.on("longpress", function(ev) { console.log("longtap");});

// listen to events...
mc.on("swipeleft swiperight swipeup swipedown tap tripletap", function(ev) {
  //  c.textContent = ev.type +" gesture detected.";
	console.log(ev.type +" gesture detected.");

});


function toggleAnnotate() {
	annotate = !annotate;
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




var annotations = new Group([]);

var annotationsLayer = new Layer([annotations]);

leo.addLayer(annotationsLayer);















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
	penPath.simplify(10);

	// Select the path, so we can see its segments:
	//penPath.fullySelected = true;
	annotations.addChild(penPath);
	penPath = new Path({
		elements : [],
		strokeWidth:4,
		//opacity:0.4;
		strokeColor: 'black'
	});
}

//drawButtons();
