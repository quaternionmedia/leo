import Stream from 'mithril/stream'

export const KEYS_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
export const KEYS_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export const State = () => ({
    pdf: null,
    setlist: Stream(null),
    songbook: Stream([]),
    playlist: Stream(null),
    song: Stream(null),
    index: Stream(0),

    key: Stream(null),
    style: Stream(null),
    title: Stream(null),
    bpm: Stream(null),
    transpose: Stream(0),

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