let Stream = require('mithril/stream')

export const State = () => ({
    pdf: null,
    setlist: Stream(null),
    songbook: Stream(null),
    playlist: Stream(null),
    index: Stream(0),


    annMode: Stream(false),
    pdfUrl: Stream(null),
    pdfPages: Stream(null),
    pdfPage: Stream(null),
    pdfLoading: Stream(false),
    setlist: Stream([]),
    menuActive: Stream(false),
    strokeColor: Stream('#3670ff'),
    strokeWidth: Stream(30),
    opacity: Stream(50),

})