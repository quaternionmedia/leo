import m from "mithril";
var State = require('./Globals').state
var Annotation = require('./Annotation')
var pdfjsLib = require('pdfjs-dist');
import PDFJSWorker from 'pdfjs-dist/build/pdf.worker.entry'
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJSWorker;

var Viewer = {
  pdf: null,
  currentPage: null,
  loadPdf: function(url) {
    // Asynchronous download of PDF
    var loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(function(pdf) {
      console.log('PDF loaded');
      Viewer.pdf = pdf;
      State.pdfPages(pdf.numPages);
      State.pdfUrl(url)
      // Fetch the first page
      Viewer.loadPage(1);
      Annotation.initAnnotations(State.pdfPages());
    }, function (reason) {
      // PDF loading error
      console.error(reason);
    });
  },
  loadPage: function(pageNumber) {
    if (State.pdfPage()){
      Annotation.hideAnnotations(State.pdfPage());
    }
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
        Annotation.showAnnotations(pageNumber)
        State.pdfPage(pageNumber)
      });
    });
  },

};


module.exports = {
  view: function(vnode) {
    return m('canvas#pdf-canvas', {style: {width: "100%", height: "100%"}})
  },
  // oninit: Viewer.loadPdf,
  nextPage: function() {
    if (State.pdfPage() < State.pdfPages()) {
      Viewer.loadPage(State.pdfPage() + 1);
    }
  },
  prevPage: function() {
    Viewer.loadPage(State.pdfPage() - 1 || 1);
  },
  loadPdf: Viewer.loadPdf,
}
