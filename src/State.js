import Stream from 'mithril/stream'

export const State = () => ({
    pdf: null,
    setlist: Stream(null),
    songbook: Stream([]),
    playlist: Stream(null),
    song: Stream(null),
    index: Stream(0),
    key: Stream(null),


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

    search: Stream(''),

})