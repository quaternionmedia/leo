function firstLoad(song) {
	console.log("loading initial song", song);
	try {loadPDFfromURL(song);}
	catch(err) {
		console.log("can't load song because", err);
		loadPDFfromBin(song);}
	}

	var wsuri = "ws://" + window.location.hostname + ":7777/ws";
	var connection = new autobahn.Connection({
		url: wsuri,
		realm: "realm1"
	});
	connection.onopen = function (session, details) {
		console.log("Connected: ", details);



		session.subscribe('local.conductor.songURL', loadPDFfromURL);

		session.subscribe('local.conductor.song', loadPDFfromBin);

		session.subscribe('local.conductor.page', queueRenderPage);
		session.subscribe('local.conductor.annotations', drawAnnotations);

		//retreive song from conductor
		setTimeout(function() {session.call('local.conductor.getSong').then(function(res) {firstLoad(res);});}, 1000);
		//session.call('local.conductor.getSong').then(function(res) {loadPDFfromURL(res);});
	};


	connection.open();
	// document.getElementById('next').addEventListener('click', onNextPage, false);
	// document.getElementById('prev').addEventListener('click', onPrevPage, false);


firstLoad("The-Bebop-Bible.pdf");

function wampCall(where, args) {
	connection.session.call(where, args).then(function(res) {console.log(res);});
}
