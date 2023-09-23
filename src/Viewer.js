import m from 'mithril'
import PDFJSWorker from 'pdfjs-dist/build/pdf.worker.entry'
import { Playlist, iRealRenderer } from "ireal-renderer";
import 'ireal-renderer/css/ireal-renderer.css'
import 'ireal-renderer/src/ireal-renderer.js'

var State = require('./Globals').state
var Annotation = require('./Annotation')
var pdfjsLib = require('pdfjs-dist')
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJSWorker

function getLines(ctx, text, maxWidth) {
  var words = text.split(' ')
  var lines = []
  var currentLine = words[0]

  for (var i = 1; i < words.length; i++) {
    var word = words[i]
    var width = ctx.measureText(currentLine + ' ' + word).width
    if (width < maxWidth) {
      currentLine += ' ' + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)
  return lines
}

var Viewer = {
  pdf: null,
  loadSong: function (song) {
    m.request('/song/' + song).then(function (data) {
      console.log('data', data)
      if (data.startsWith('pdf')) {
        Viewer.loadPdf(data)
      } else if (data.startsWith('ireal')) {
        Viewer.loadiReal(data)
      }
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
    m.request(url).then(function (data) {
      console.log('got ireal', data)
      Viewer.pdf = null
      const canvas = document.getElementById('pdf-canvas')
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const container = document.getElementById('ireal-container')
      const playlist = new Playlist(data);
      console.log('playlist', playlist)
      const song = playlist.songs[0];
      console.log('song', song)
      const renderer = new iRealRenderer(playlist);

      renderer.parse(song)
      container.append(`<h3>${song.title} (${song.key})</h3>`);
      renderer.render(song, container);
    })
  },
}

module.exports = {
  view: function (vnode) {
    return [
      m('#ireal-container'), 
      m('canvas#pdf-canvas', { style: { width: 'auto', height: '100%' } })
    ]
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
