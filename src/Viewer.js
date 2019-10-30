import m from "mithril";
var State = require('./Globals').state
var Annotation = require('./Annotation')
var pdfjsLib = require('pdfjs-dist');
// var worker = require('pdfjs-dist/build/pdf.worker');
// pdfjsLib.workerSrc = worker;


pdfjsLib.GlobalWorkerOptions.workerSrc =  'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.2.228/build/pdf.worker.js'
// '//mozilla.github.io/pdf.js/build/pdf.worker.js';

var Viewer = {
  pdf: null,
  currentPage: null,
  loadPdf: function() {
    // Asynchronous download of PDF
    var loadingTask = pdfjsLib.getDocument(State.pdfUrl());
    loadingTask.promise.then(function(pdf) {
      console.log('PDF loaded');
      Viewer.pdf = pdf;
      State.pdfPages(pdf.numPages);
      // Fetch the first page
      Viewer.loadPage(1);
      Annotation.initAnnotations(State.pdfPages());
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
