
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
	var c = pdfCanvas;
	var w = c.getBoundingClientRect().width;
	var h = c.getBoundingClientRect().height;

	var annotate = false;


	var leftPoint = new Point(w/4, h/2);
	var rightPoint = new Point(3*w/4, h/2);
	var size = new Size(w/2, h);

	var leftHalf = new Path.Rectangle(leftPoint, size);
	var rightHalf = new Path.Rectangle(rightPoint, size);

	
	var annotateButton = new Path.Rectangle({
		point: [0, 49*h/50],
		size: [w/3, 49*h/50],
		strokeColor: 'blue',
		fillColor: '#000077',
		opacity: 0.8
	});

	var annotateText = new PointText({
		point: [w/6, 99*h/100],
		content: 'annotate',
		fillColor: '#FFFFFF',
		fontFamily: 'Helvetica',
		fontWeight: 'bold',
		fontSize: 12
	});

	var navButton = new Path.Rectangle({
		point: [w/3, 49*h/50],
		size: [w/3, 49*h/50],
		fillColor: '#000000',
		opacity: 0.8
	});

	var navText = new PointText({
		point: [w/2, 99*h/100],
		content: 'navigation',
		fillColor: '#FFFFFF',
		fontFamily: 'Helvetica',
		fontWeight: 'bold',
		fontSize: 12
	});
	var followButton = new Path.Rectangle({
		point: [2*w/3, 49*h/50],
		size: [w/3, 49*h/50],
		fillColor: '#777700',
		opacity: 0.8
	});

	var followText = new PointText({
		point: [5*w/6, 99*h/100],
		content: 'follow',
		fillColor: '#FFFFFF',
		fontFamily: 'Helvetica',
		fontWeight: 'bold',
		fontSize: 12
	});


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

	var LRButtons = new Layer({children: [leftHalf, rightHalf],position: view.center} );

	var navButtons = new Layer({children:[annotateButton,navButton,followButton],position:view.BottomCenter});
	var annotations = new Layer({children:[annotations],position:view.BottomCenter});
	var text = new Layer({children:[annotateText,followText,navText],position:view.BottomCenter});
	


	
	
	leo.addLayer(navButtons);
	leo.addLayer(LRButtons);

	leo.addLayer(annotations);
	leo.addLayer(text);
	
	console.log(leo.activeLayer);
}





//TODO: move code from drawButtons



//TODO Buttons ['leftHalf', 'rightHalf', 'annotate', 'import', 'follow']


//	var myElement = document.getElementById('myElement');

// create a simple instance
// by default, it only adds horizontal recognizers
var mc = new Hammer(navCanvas);

// let the pan gesture support all directions.
// this will block the vertical scrolling on a touch-device while on the element
mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

mc.on("panleft", function(ev) {onPrevPage();});
mc.on("panright", function(ev) { onNextPage();});

// listen to events...
mc.on("panleft panright panup pandown tap press", function(ev) {
  //  c.textContent = ev.type +" gesture detected.";
	console.log(ev.type +" gesture detected.");

});









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
annotations = new Group([]);
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
	annotations.addChild(penPath);
	penPath = new Path({
		elements : [],
		strokeWidth:4,
		//opacity:0.4;
		strokeColor: 'black'
	});
}

drawButtons();
