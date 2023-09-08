import m from 'mithril'
var State = require('./Globals').state
var Annotation = require('./Annotation')
var pdfjsLib = require('pdfjs-dist')
import PDFJSWorker from 'pdfjs-dist/build/pdf.worker.entry'
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJSWorker

var Viewer = {
  pdf: null,
  loadSong: function (song) {
    m.request('/song/' + song).then(function (data) {
      console.log('data', data)
      Viewer.loadPdf(data)
    })
  },
  loadPdf: function (url) {
    // Asynchronous download of PDF
    if (Viewer.pdf) {
      Annotation.saveAnnotations()
    }
    var loadingTask = pdfjsLib.getDocument(url)
    loadingTask.promise.then(
      function (pdf) {
        console.log('PDF loaded')
        Viewer.pdf = pdf
        State.pdfPages(pdf.numPages)
        State.pdfUrl(url)
        // Fetch the first page
        Annotation.initAnnotations(State.pdfPages())
        // var result = Annotation.getAnnotations().then(res => {
        //   Annotation.loadAnnotations(res)
        //   console.log('loading annotations')
        // console.log('annotation result: ', result.length, result)
        // })
        Viewer.loadPage(1)
        State.annMode(false)
      },
      function (reason) {
        // PDF loading error
        console.error(reason)
      }
    )
  },
  loadPage: function (pageNumber) {
    if (!State.pdfLoading()) {
      State.pdfLoading(true)
      if (State.pdfPage()) {
        Annotation.hideAnnotations(State.pdfPage())
      }
      Viewer.pdf.getPage(pageNumber).then(function (page) {
        console.log('Page loaded')
        var scale = 1
        var viewport = page.getViewport({ scale: scale })

        // Prepare canvas using PDF page dimensions
        var canvas = document.getElementById('pdf-canvas')
        var context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width
        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: context,
          viewport: viewport,
        }
        var renderTask = page.render(renderContext)
        renderTask.promise.then(function () {
          console.log('Page rendered')
          Annotation.showAnnotations(pageNumber)
          State.pdfPage(pageNumber)
          State.pdfLoading(false)
        })
      })
    }
  },
  loadiReal: function (url) {
    console.log('loading ireal from', url)
  },
}

module.exports = {
  view: function (vnode) {
    return m('canvas#pdf-canvas', { style: { width: 'auto', height: '100%' } })
  },
  // oninit: Viewer.loadPdf,
  nextPage: function () {
    if (State.pdfPage() < State.pdfPages()) {
      Viewer.loadPage(State.pdfPage() + 1)
    }
  },
  prevPage: function () {
    if (State.pdfPage() > 1) {
      Viewer.loadPage(State.pdfPage() - 1)
    }
  },
  // loadPdf: Viewer.loadPdf,
  loadSong: Viewer.loadSong,
}
