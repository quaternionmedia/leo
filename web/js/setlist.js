
var menu = document.getElementById("sideNav");
var setlist = document.getElementById("setlist");
var nc = document.getElementById("navCanvas");
var pc = document.getElementById("pdfCanvas");
var scroll = document.getElementById("scrollbar");

scroll.oninput = function() {
  console.log('scrolling to page ', Number(scroll.value));
  queueRenderPage(Number(scroll.value));
}

function loadSetlist(songs) {
	clearSetlist();
	for (var i=0; i<songs.length; i++) {
		var e = document.createElement('a');
		e.id = encodeURIComponent('pdf/' + songs[i]);
		e.classList.add('w3-container');
		e.style.cursor = "pointer";
//		e.style.color = 'gray';
//		e.style.hover = 'white';
		e.setAttribute('onclick', 'downloadPDF("pdf/' + songs[i] + '")');
		e.innerHTML = songs[i];
		setlist.appendChild(e);
	}
	loadPDF("/pdf/" + setlist.firstChild.innerHTML);
}

function clearSetlist() {

	while (setlist.firstChild) {
			setlist.firstChild.remove();
	}
}



function openNav() {
    menu.style.width = "250px";
    setlist.style.width = "250px";

    nc.style.marginLeft = "250px";
    pc.style.marginLeft = "250px";
}

function closeNav() {
    menu.style.width = "0";
    setlist.style.width = "0";

    nc.style.marginLeft= "0";
    pc.style.marginLeft= "0";
}
