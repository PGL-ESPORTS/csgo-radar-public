// Websocket implementation
//
// Starts a connection to the server and emits events for other scripts to
// listen for.

let socket = {
	native: null,
	connected: false,
	connect: () =>  {
		// Check if we're in electron
		if (navigator.userAgent.toLowerCase().indexOf(" electron/") > -1) {
			// If we are, we can just import the config directly
			// Start the websocket and attach the event listeners
			let websocket = new WebSocket(`ws://127.0.0.1:4902`)
			attachEvents(websocket)
		}
		else {
			// We need to fetch the doorknock to get the socket port if we're in a browser
			fetch(window.location.origin + "/doorknock")
			.then(resp => resp.json())
			.then(data => {
				// Start a socket to the port we got from the doorknock
				let websocket = new WebSocket(`ws://${window.location.hostname}:${data.socket}`)
				attachEvents(websocket)

				// If we're on the waiting screen with a version element, insert the version we got
				if (document.getElementById("version") && document.getElementById("version").innerHTML == "") {
					document.getElementById("version").innerHTML = "version " + data.version
				}

				// Add a nice line in the console <3
				console.info(`%cBoltobserv %cv${data.version}%c, at your service ❤ `, "font-weight: bold", "font-weight: bold; color:red", "font-weight: bold", "https://github.com/boltgolt/boltobserv/")
			})
			.catch((err) => {
				console.error(err)

				// If something went wrong in the doorknock, try it again in 25ms
				socket.connected = false
				setTimeout(() => {
					socket.connect()
				}, 25)
			})
		}

		function attachEvents(websocket) {
			// Called when the socket is started
			socket.native = websocket;
			websocket.onopen = () => {
				socket.connected = true
				websocket.send("requestWelcome")
			}

			// Called when the server has pushed a message to us
			websocket.onmessage = event => {
				// Decode the message
				let incom = JSON.parse(event.data)
				// Create a new event with the given event type
				let outev = new Event(incom.type)
				// Add the data we got to the new event
				outev.data = incom.data
				// Send the event to other scripts
				socket.element.dispatchEvent(outev)
			}

			// Called when the socket is closed, try opening the socket again in 25ms
			websocket.onclose = event => {
				socket.connected = false
				setTimeout(() => {
					socket.connect()
				}, 25)
			}

			// Called when a handler errors out, close the socket and start clean
			websocket.onerror = err => {
				console.error(err)
				socket.close()
			}
		}
	},

	// Dummy element, events are fired from here
	element: document.createElement("div")
}

// Start the socket
socket.connect()
