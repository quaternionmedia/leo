// exports.state = {annMode: false}

var Stream = require("mithril/stream")

exports.state = {
  annMode: Stream(false),
  pdfUrl: Stream(null),
  pdfPages: Stream(null),
  pdfPage: Stream(null),
  pdfLoading: Stream(false),
  setlist: Stream([]),
  setIndex: Stream(null),
  menuActive: Stream(false),
  strokeColor: Stream('#3670ff'),
  strokeWidth: Stream(30),
  opacity: Stream(50),
}
