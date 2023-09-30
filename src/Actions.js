import m from 'mithril'
import { Playlist } from 'ireal-renderer'
// import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'

export const Actions = (state, actions) => ({
    loadSetlist: () => {
        console.log('setlist init!')

        m.request('/setlist').then(setlist => {
            console.log('setlist', setlist)
            state.setlist = setlist
            state.index(0)
            actions.loadSong(setlist[state.index()])
        })
        },
    loadSong: song => {
        m.request('/song/' + song).then(function (data) {
            console.log('data', data)
            if (data.startsWith('pdf')) {
            actions.loadPdf(data)
            } else if (data.startsWith('ireal')) {
            actions.loadiReal(data)
            }
        })
        },
    loadPdf: function (url) {
        // Asynchronous download of PDF
        // if (state.pdf) {
        //     Annotation.saveAnnotations()
        // }
        const container = document.getElementById('ireal-container')
        // container.innerHTML = ''; // TODO: remove this after m(iReal)
        var loadingTask = getDocument(url)
        loadingTask.promise.then(
            function (pdf) {
            console.log('PDF loaded')
            state.pdf = pdf
            state.pdfPages(pdf.numPages)
            state.pdfUrl(url)
            // Fetch the first page
            // Annotation.initAnnotations(state.pdfPages())
            // var result = Annotation.getAnnotations().then(res => {
            //   Annotation.loadAnnotations(res)
            //   console.log('loading annotations')
            // console.log('annotation result: ', result.length, result)
            // })
            actions.loadPage(1)
            state.annMode(false)
            },
            function (reason) {
            // PDF loading error
            console.error(reason)
            }
        )
    },
    loadPage: function (pageNumber) {
        if (!state.pdfLoading()) {
            state.pdfLoading(true)
            // if (state.pdfPage()) {
            // Annotation.hideAnnotations(state.pdfPage())
            // }
            state.pdf.getPage(pageNumber).then(function (page) {
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
                // Annotation.showAnnotations(pageNumber)
                state.pdfPage(pageNumber)
                state.pdfLoading(false)
            })
            })
        }
    },
    loadiReal: function (url) {
        console.log('loading ireal from', url)
        m.request(url).then(function (data) {
            console.log('got ireal', data)
            state.playlist(new Playlist(data));
            state.songbook(state.playlist().songs.map(s => s.title))
            console.log('playlist', state.playlist())
        })
    }, 
    loadSetlistIndex: index => {
        console.log('loading setlist index', index)
        state.index(index)
        actions.loadSong(state.setlist[state.index()])
    },
    songs: () => {
        if (state.search()) {
            return state.songbook().filter(s => s.title.toLowerCase().includes(state.search().toLowerCase()))
        } else {
            return state.songbook()
        }
    },
})