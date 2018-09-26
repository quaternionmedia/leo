var g = {
	"object":["{",["string:value"],"}"],
	"array":["[",["value"],"]"],
	"value":["string","number", "object", "array", "true", "false", "null"],
	"string":["\"", ["unicode"], ["\\", ["\"", "\\", "\/", "\b", "\f", "\n", "\r", "\t", "\u0000"]], "\""],
	"number":[["-"],[0],["."],["digit"], ["e", "E", ["+","-"], "digit"]],
	"digit":[0,1,2,3,4,5,6,7,8,9]
}
var camera, scene, renderer, controls, geometry, root;
var info = document.getElementById("myCanvas");

var objects = [];

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

function drawObject(obj) {
	var x=0, y=0, z=0, i=0;
	var object = new THREE.Shape();
	for (var variable in obj) {
		if (obj.hasOwnProperty(variable)) {
			object.bezierCurveTo(x+5000,y+5000,z+5000,x*i*100,y*i*100,z);
			console.log(variable, obj[variable]);
			info.innerHTML += " " + variable;
			i++;
		}

}
	var objGeo = new THREE.ShapeGeometry(object);
	var objMat = new THREE.MeshBasicMaterial({color:0x00ff00});
	var objMesh = new THREE.Mesh(objGeo, objMat);
	scene.add(objMesh);
}


function init() {

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 150000 );
	camera.position.set(10000,10000,500);

	controls = new THREE.OrbitControls(camera);
	controls.update();

	// controls = new THREE.TrackballControls(camera);
	// controls.rotateSpeed = 1.0;
	// controls.zoomSpeed = 1.7;
	// controls.panSpeed = 1.0;
	// controls.noZoom = false;
	// controls.staticMoving = true;
	// controls.dynamicDampingFactor = 0.3;



	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x333333 );

	drawObject(g);

//Need to load font, but cant from local, needs http
	 var loader = new THREE.FontLoader();
	 			loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
	 				var xMid, text;
	 				var color = 0x006699;
	 				var matDark = new THREE.LineBasicMaterial( {
	 					color: color,
	 					side: THREE.DoubleSide
	 				} );
	 				var matLite = new THREE.MeshBasicMaterial( {
	 					color: color,
	 					transparent: true,
	 					opacity: 0.4,
	 					side: THREE.DoubleSide
	 				} );
	 				var message = "   Three.js\nSimple text.";
	 				var shapes = font.generateShapes( message, 100 );
	 				var geometry = new THREE.ShapeBufferGeometry( shapes );
	 				geometry.computeBoundingBox();
	 				xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
	 				geometry.translate( xMid, 0, 0 );
	 				// make shape ( N.B. edge view not visible )
	 				text = new THREE.Mesh( geometry, matLite );
	 				text.position.z = - 150;
	 				scene.add( text );
	 				// make line shape ( N.B. edge view remains visible )
	 				var holeShapes = [];
	 				for ( var i = 0; i < shapes.length; i ++ ) {
	 					var shape = shapes[ i ];
	 					if ( shape.holes && shape.holes.length > 0 ) {
	 						for ( var j = 0; j < shape.holes.length; j ++ ) {
	 							var hole = shape.holes[ j ];
	 							holeShapes.push( hole );
	 						}
	 					}
	 				}
	 				shapes.push.apply( shapes, holeShapes );
	 				var lineText = new THREE.Object3D();
	 				for ( var i = 0; i < shapes.length; i ++ ) {
	 					var shape = shapes[ i ];
	 					var points = shape.getPoints();
	 					var geometry = new THREE.BufferGeometry().setFromPoints( points );
	 					geometry.translate( xMid, 0, 0 );
	 					var lineMesh = new THREE.Line( geometry, matDark );
	 					lineText.add( lineMesh );
	 				}
	 				scene.add( lineText );
	 			} ); //end load function

	var geometry = new THREE.BoxBufferGeometry( 100, 100, 100 );
	// var material = new THREE.MeshNormalMaterial();
	var material = new THREE.MeshNormalMaterial({"wireframe":true});
	// material.flatshading = true;

	root = new THREE.Mesh( geometry, material );
	root.position.x = 1000;
	scene.add( root );

	var amount = 200, object, parent = root;

	for ( var i = 0; i < amount; i ++ ) {

		object = new THREE.Mesh( geometry, material );
		object.position.x = 100;

		parent.add( object );
		objects.push(object);
		parent = object;

	}

	parent = root;

	for ( var i = 0; i < amount; i ++ ) {

		object = new THREE.Mesh( geometry, material );
		object.position.x = - 100;

		parent.add( object );
		objects.push(object);
		parent = object;

	}

	parent = root;

	for ( var i = 0; i < amount; i ++ ) {

		object = new THREE.Mesh( geometry, material );
		object.position.y = - 100;

		parent.add( object );
		objects.push(object);
		parent = object;

	}

	parent = root;

	for ( var i = 0; i < amount; i ++ ) {

		object = new THREE.Mesh( geometry, material );
		object.position.y = 100;

		parent.add( object );
		objects.push(object);
		parent = object;

	}

	parent = root;

	for ( var i = 0; i < amount; i ++ ) {

		object = new THREE.Mesh( geometry, material );
		object.position.z = - 100;

		parent.add( object );
		objects.push(object);
		parent = object;

	}

	parent = root;

	for ( var i = 0; i < amount; i ++ ) {

		object = new THREE.Mesh( geometry, material );
		object.position.z = 100;

		parent.add( object );
		objects.push(object);
		parent = object;

	}



	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );




	var dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
	dragControls.addEventListener( 'dragstart', function ( event ) { controls.enabled = false; } );
	dragControls.addEventListener( 'dragend', function ( event ) { controls.enabled = true; } );


	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}


//

function animate() {

	requestAnimationFrame( animate );

	render();

}

function render() {

	var time = Date.now() * 0.0001;

	var rx = Math.sin( time * 0.7 ) * 0.2;
	var ry = Math.sin( time * 0.3 ) * 0.1;
	var rz = Math.sin( time * 0.2 ) * 0.1;

	//camera.position.x += ( mouseX - camera.position.x ) * 0.05;
	//camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

	camera.lookAt( scene.position );

	root.traverse( function ( object ) {

		object.rotation.x = rx;
		object.rotation.y = ry;
		object.rotation.z = rz;

	} );

	controls.update();

	renderer.render( scene, camera );

}
