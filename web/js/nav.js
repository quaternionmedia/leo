
var leo = paper.project;
leo.activate();

pdfCanvas = document.getElementById('pdfCanvas'),
navCanvas = document.getElementById('navCanvas'),

navContext = navCanvas.getContext('2d');

var penPath;

function openPallate() {
	console.log('opening pallete');
}

function drawButtons() {
	console.log(leo);
	var c = navCanvas;
	var w = c.width;
	var h = c.height;

	var annotate = false;
	var annotateButton = new Path.Rectangle(w/3,h/10);

	var leftPoint = new Point(w/4, h/2);
	var rightPoint = new Point(3*w/4, h/2);
	var size = new Size(w/2, h);

	var leftHalf = new Path.Rectangle(leftPoint, size);
	var rightHalf = new Path.Rectangle(rightPoint, size);

	var pallate = new Path.Rectangle(w, h/10);



	pallate.strokeColor = 'blue';
	pallate.fillColor = '#0000aa';
	pallate.opacity = .5;


	annotateButton.strokeColor = 'blue';
	annotateButton.fillColor = '#000000';
	annotateButton.opacity = .5;

	leftHalf.opacity = 0;
	leftHalf.fillColor = '#0000FF';
	rightHalf.opacity = 0;
	rightHalf.fillColor = '#FFFF00';

	annotateButton.onClick = function (event) {
		console.log("annotate button clicked");
		this.fillColor = 'black';
		annotate = !annotate;
		leftHalf.visible = !annotate;
		rightHalf.visible = !annotate;
		console.log(annotate, leftHalf.visable);
		openPallate();

	}

	leftHalf.onClick = function (event) {
		onPrevPage();
		this.fillColor = 'blue';

	}
	rightHalf.onClick = function (event) {
		onNextPage();
		this.fillColor = 'red';

	}
	var navButtons = new Layer({
		children: [leftHalf, rightHalf],
		position: view.center
	} );




	leo.addLayer(navButtons);

	leo.addLayer(new Layer({
		children: [annotateButton],
		position: view.BottomCenter
	}));

	leo.addLayer(new Layer({
		children: [pallate],
		position: view.BottomCenter
	}));

	var pallate = new Path.Rectangle(new Point([0,h-5]), new Size([w,h]));

	var annotateButton = new Path.Circle({
		radius: w/16,
		center: [w/2, 9 * h/10]
		});

	leo.addLayer(new Layer({
		children: [blobs],
		position: view.BottomCenter
	}));

function drawButton() {

//TODO: move code from drawButtons

}

//TODO Buttons ['leftHalf', 'rightHalf', 'annotate', 'import', 'follow']


//	var myElement = document.getElementById('myElement');

// create a simple instance
// by default, it only adds horizontal recognizers
var mc = new Hammer(c);

// let the pan gesture support all directions.
// this will block the vertical scrolling on a touch-device while on the element
mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

// listen to events...
mc.on("panleft panright panup pandown tap press", function(ev) {
  //  c.textContent = ev.type +" gesture detected.";
	console.log(ev.type +" gesture detected.");

});
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
blobs = new Group([]);
createPaths();

function createPaths() {
	var radiusDelta = values.maxRadius - values.minRadius;
	var pointsDelta = values.maxPoints - values.minPoints;
	for (var i = 0; i < values.paths; i++) {
		var radius = values.minRadius + Math.random() * radiusDelta;
		var points = values.minPoints + Math.floor(Math.random() * pointsDelta);
		//var path = createBlob(view.size * Point.random(), radius, points);
		//blobs.addChild(createBlob(view.size * Point.random(), radius, points));
		// var lightness = (Math.random() - 0.5) * 0.4 + 0.4;
		// var hue = Math.random() * 360;
		//path.fillColor = { hue: hue, saturation: 1, lightness: lightness };
		//path.strokeColor = 'black';
	};
}

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
		penPath.add(event.point);
	}
}

function onMouseUp(event) {
	// When the mouse is released, simplify it:
	penPath.simplify(10);

	// Select the path, so we can see its segments:
	//penPath.fullySelected = true;
	blobs.addChild(penPath);
	penPath = new Path({
		elements : [],
		strokeWidth:4,
		//opacity:0.4;
		strokeColor: 'black'
	});
}

drawButtons();
