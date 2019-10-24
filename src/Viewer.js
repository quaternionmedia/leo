/* Any copyright is dedicated to the Public Domain.
* http://creativecommons.org/publicdomain/zero/1.0/ */

//
// Basic node example that prints document metadata and text content.
// Requires single file built version of PDF.js -- please run
// `gulp singlefile` before running the example.
//

// Run `gulp dist-install` to generate 'pdfjs-dist' npm package files.
import m from "mithril";

var pdfjsLib = require('pdfjs-dist');
// var worker = require('pdfjs-dist/build/pdf.worker');
// pdfjsLib.workerSrc = worker;

// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
var url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf';

// Loaded via <script> tag, create shortcut to access PDF.js exports.
// var pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc =  'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.2.228/build/pdf.worker.js'

// '//mozilla.github.io/pdf.js/build/pdf.worker.js';

var Viewer = {
  pdf: null,
  currentPage: null,
  loadPdf: function() {
    // Asynchronous download of PDF
    var loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(function(pdf) {
      console.log('PDF loaded');
      Viewer.pdf = pdf;
      // Fetch the first page
      Viewer.loadPage(1);
    }, function (reason) {
      // PDF loading error
      console.error(reason);
    });
  },
  loadPage: function(pageNumber) {

    Viewer.pdf.getPage(pageNumber).then(function(page) {
      console.log('Page loaded');
      Viewer.currentPage = pageNumber;
      var scale = 1;
      var viewport = page.getViewport({scale: scale});

      // Prepare canvas using PDF page dimensions
      var canvas = document.getElementById('pdf-canvas');
      var context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      var renderTask = page.render(renderContext);
      renderTask.promise.then(function () {
        console.log('Page rendered');
      });
    });
  },

};


module.exports = {
  view: function(vnode) {
    return m('canvas#pdf-canvas', {style: {width: "100%", height: "100%"}})
  },
  oninit: Viewer.loadPdf,
  nextPage: function() {
    Viewer.loadPage(Viewer.currentPage + 1);
  },
  prevPage: function() {
    Viewer.loadPage(Viewer.currentPage - 1 || 1);
  }
}
