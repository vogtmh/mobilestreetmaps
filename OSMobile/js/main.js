function onLocationFound(e) {
    const radius = e.accuracy / 2;
    $("#loadingscreen").hide();

    if (!locationMarker) {
        locationMarker = L.marker(e.latlng).addTo(map);
        //locationCircle = L.circle(e.latlng, radius).addTo(map);
    }
    else {
        locationMarker.setLatLng(e.latlng);
        //locationCircle.setLatLng(e.latlng);
        //locationCircle.setRadius(radius);
    }
}

function onLocationError(e) {
    stopLocate()
}

function startLocate() {
    editmode = 'false'
    $(".ibutton").hide();
    map.locate({ setView: true, watch: true, enableHighAccuracy: true, maxZoom: maxautozoom });
}

function stopLocate() {
    editmode = 'true';
    $(".ibutton").show();
    map.stopLocate();
}

function showZoomlevel() {
    let zoomlevel = map.getZoom()
    $("#zoomlevel").html(zoomlevel);
    if (editmode == 'true') {
        maxautozoom = zoomlevel;
        localStorage.maxautozoom = zoomlevel;
    }
}

function zoomIn() {
    let zoomlevel = map.getZoom()
    if (zoomlevel < 19) {
        zoomlevel++
    }
    map.setZoom(zoomlevel);
}

function zoomOut() {
    let zoomlevel = map.getZoom()
    if (zoomlevel > 0) {
        zoomlevel--
    }
    map.setZoom(zoomlevel);
}

function showSettings() {
    let settingslist = 'tilebase: <br/>' + tilebase + ' <br/><br/> maxautozoom: <br/>' + maxautozoom
    $("#settingslist").html(settingslist);
    $("#settings_overlay").show();
}

const map = L.map('map', { "zoomControl": false }).fitWorld();
var locationMarker;
var locationCircle;
var maxautozoom;
var tilebase;
let editmode = 'false';

// initialize autozoom
if (localStorage.getItem("maxautozoom") === null) {
    localStorage.maxautozoom = 17;
    maxautozoom = localStorage.maxautozoom;
} else {
    maxautozoom = localStorage.maxautozoom;
}

// initialize tileset
if (localStorage.getItem("tilebase") === null) {
    localStorage.tilebase = 'https://a.tile.geofabrik.de/2b232a218fc74caab0859632066bb003';
    //localStorage.tilebase = 'https://tile.openstreetmap.org';
    tilebase = localStorage.tilebase;
} else {
    tilebase = localStorage.tilebase;
}

let tileurl = tilebase + '/{z}/{x}/{y}.png';

const tiles = L.tileLayer(tileurl, {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
map.on("click", function () { stopLocate() });
map.on("mousedown", function () { stopLocate() });
map.on("gesture", function () { stopLocate() });
map.on("zoomend", showZoomlevel)

startLocate()