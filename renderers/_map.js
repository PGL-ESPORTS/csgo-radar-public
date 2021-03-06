// Initial map rendering
//
// Responsible for changing radar background on map change, loading map
// metadata and applying some general config values.

// Catch map data send by the game
socket.element.addEventListener("map", event => {
	/**
	 * Show a map error and quit
	 * @param  {String} text What error message to show
	 */
	function throwMapError(text) {
		document.getElementById("unknownMap").style.display = "flex"
		document.getElementById("unknownMap").children[0].innerHTML = text
	}

	// If map is unchanged we do not need to do anything
	if (global.currentMap == event.data) return

	let mapName = event.data
	if (mapName.indexOf("/") != -1) {
		mapName = mapName.split("/")[mapName.split("/").length - 1]
	}

	fetch(window.location.origin + `/maps/${mapName}/meta.json5`)
	.then(resp => resp.text())
	.then(data => {
		data = data.replace(/^\s*?\/\/.*?$/gm, "")
		global.mapData = JSON.parse(data)

		// Check if the map uses the expected meta format
		if (global.mapData.version.format != 2) {
			return throwMapError(`Outdated map file for ${mapName}`)
		}

		// Make sure that the "unknown map" message is turned off for valid maps
		document.getElementById("unknownMap").style.display = "none"

		// Show the radar backdrop
		document.getElementById("radar").src = `/maps/${mapName}/radar.png`

		// Set the map as the current map and in the window title
		global.currentMap = mapName
		document.title = "Boltobserv - " + mapName

		// Allow init to load other scripts
		hasMap = true
		importScripts()
	})
	.catch(() => {
		return throwMapError(`Error reading the ${mapName} map file :(`)
	})
})
