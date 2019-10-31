// exports.state = {annMode: false}

var Stream = require("mithril/stream")

exports.state = {
  annMode: Stream(false),
  pdfUrl: Stream('pdf/mylife.pdf'),
  pdfPages: Stream(null),
  pdfPage: Stream(null),
  setlist: Stream(null),
  setpos: Stream(null),
  menuActive: Stream(false),
  strokeColor: Stream('#3670ff'),
  strokeWidth: Stream(30),
  opacity: Stream(50),
}
