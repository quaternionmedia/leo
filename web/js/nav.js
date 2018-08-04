
var leo = paper.project;
leo.activate();

pdfCanvas = document.getElementById('pdfCanvas'),
navCanvas = document.getElementById('navCanvas'),
// annCanvas = document.getElementById('annCanvas'),

navContext = navCanvas.getContext('2d');
// navContext.globalAlpha = 0;

// function drawAnnotations(ann) {
// 	console.log("drawing new annotation");
// 	console.log(ann);
// 	project.activeLayer.importJSON(ann);
//
// }


function openPallate() {
	var pallate = document.getElementById('pallate');
	pallate.style.position = "absolute";
	var pos = 0;
	var id = setInterval(frame, 10)
	function frame() {
		if (pos == 100) {
			clearInterval(id);
		} else {
			pos++;
			pallate.style.top = pos + 'px';
		}
	}
}

function drawButtons() {
	console.log(leo);
	var c = navCanvas;
	var w = c.width;
	var h = c.height;


	var leftPoint = new Point(w/4, h/2);
	var rightPoint = new Point(3*w/4, h/2);
	var size = new Size(w/2, h);

	var leftHalf = new Path.Rectangle(leftPoint, size);
	var rightHalf = new Path.Rectangle(rightPoint, size);

	var annotateButton = new Path.Circle({
		radius: w/16,
		center: [w/2, 9 * h/10]
		});

	var pallate = new Path.Rectangle(new Point([0,h-5]), new Size([w,h]));

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

	leo.addLayer(new Layer({
		children: [blobs],
		position: view.BottomCenter
	}));
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
		blobs.addChild(createBlob(view.size * Point.random(), radius, points));
		// var lightness = (Math.random() - 0.5) * 0.4 + 0.4;
		// var hue = Math.random() * 360;
		//path.fillColor = { hue: hue, saturation: 1, lightness: lightness };
		//path.strokeColor = 'black';
	};
}

function createBlob(center, maxRadius, points) {
	var path = new Path();
	path.closed = true;
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
	path.fillColor = { hue: hue, saturation: 1, lightness: lightness };
	path.strokeColor = 'black';
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
		}
	}
	movePath = hitResult.type == 'fill';
	if (movePath)
		project.activeLayer.addChild(hitResult.item);
}

function onMouseMove(event) {
	project.activeLayer.selected = false;
	if (event.item)
		event.item.selected = true;
}

function onMouseDrag(event) {
	if (segment) {
		segment.point += event.delta;
		path.smooth();
	} else if (path) {
		path.position += event.delta;
	}
}

drawButtons();
