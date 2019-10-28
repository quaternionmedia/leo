// exports.state = {annMode: false}

var Stream = require("mithril/stream")

exports.state = {
  annMode: Stream(false),
  pdfUrl: Stream('pdf/mylife.pdf'),
  strokeColor: Stream('#000000'),
  strokeWidth: Stream(20),
  opacity: Stream(50)
}
