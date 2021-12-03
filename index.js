// ================================================================================
//
//                              PLEASE READ:
// This project is under a GPL-3 license, you are REQUIRED to publicly publish any
// changes or upgrades you make to the codebase, it strengthens the community.
// Contact the maintainer if you have any questions regarding the license.
//
// ================================================================================

const path = require("path")
const child_process = require("child_process")

const config = require("./loadconfig")

let hasMap = false
let connTimeout = false
var win = false

let gsi = child_process.fork(`${__dirname}/gsi.js`)
let http = child_process.fork(`${__dirname}/http.js`)
let socket = child_process.fork(`${__dirname}/socket.js`)

function setActivePage(page) {
	http.send(page)
	socket.send({
		type: "pageUpdate"
	})
}

gsi.on("message", (message) => {
	socket.send(message)

	if (!hasMap) {
		if (message.type == "map") {
			setActivePage("map")
			hasMap = true

			console.info(`Map ${message.data} selected`)
		}
	}
})

function cleanup() {
	gsi.kill()
	http.kill()
	socket.kill()
}

for (let signal of ["exit", "SIGINT", "SIGUSR1", "SIGUSR2"]) {
	process.on(signal, cleanup)
}
