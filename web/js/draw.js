var myPath;
var project;

function initProject() {
project = paper.project.activate();
// project = new Project();
// project.activate();
}
initProject();
function onMouseDown(event) {
	myPath = new Path();
	// project.activeLayer.push(myPath);
	myPath.strokeColor = 'black';
}

function onMouseDrag(event) {
	myPath.add(event.point);
}

function onMouseUp(event) {
	var myCircle = new Path.Circle({
		center: event.point,function () {

		}
		radius: 10
	});
	myCircle.strokeColor = 'black';
	myCircle.fillColor = 'white';

	var log = paper.project.activeLayer.exportJSON();
	console.log("sending drawing");
	// console.log(log);// connection.session.publish("local.conductor.annotations", ["test"], {}, {exclude_me:false});
	connection.session.publish("local.conductor.annotations", [log], {}, {exclude_me:false});
}
