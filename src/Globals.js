// exports.state = {annMode: false}

var Stream = require("mithril/stream")

exports.state = {
  annMode: Stream(false),
  pdfUrl: Stream('pdf/mylife.pdf')
}
