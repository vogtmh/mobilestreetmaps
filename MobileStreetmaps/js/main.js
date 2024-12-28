var tilebase;
var tileurl;
var appVersion;
var appString;

const map = L.map('map', { "zoomControl": false }).fitWorld();
var locationMarker;
var locationCircle;
var maxautozoom;
let editmode = 'false';

function loadSettings() {
    if (localStorage.getItem("tilebase") === null) {
        console.log("Tilebase does not exist in localstorage. Creating ..");
        localStorage.tilebase = "https://a.tile.geofabrik.de/2b232a218fc74caab0859632066bb003";
        //localStorage.tilebase = "https://tile.openstreetmap.org";
        tilebase = localStorage.tilebase;
    } else {
        tilebase = localStorage.tilebase;
        console.log("Tilebase from localstorage: " + tilebase);
    }

    // initialize autozoom
    if (localStorage.getItem("maxautozoom") === null) {
        localStorage.maxautozoom = 17;
        maxautozoom = localStorage.maxautozoom;
    } else {
        maxautozoom = localStorage.maxautozoom;
    }

    tileurl = tilebase + '/{z}/{x}/{y}.png';

    var tiles = L.tileLayer(tileurl, {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

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
    let settingslist = 'MobileStreetmaps <br/>' + appString + '<br/><br/>' + `tilebase: <br/><a onclick="inputTilebase();return false;">` + tilebase + '</a><br/><br/> maxautozoom: <br/>' + maxautozoom
    $("#settingslist").html(settingslist);
    $("#settings_overlay").show();
}

function showInputDialog() {
    return new Promise((resolve) => {
        // Show the dialog and overlay
        document.getElementById("dialogOverlay").style.display = "block";
        document.getElementById("inputDialog").style.display = "block";

        // Handle the OK button
        document.getElementById("okButton").onclick = function () {
            const input = document.getElementById("userInput").value;
            hideInputDialog();
            resolve(input); // Pass the input back
        };

        // Handle the Cancel button
        document.getElementById("cancelButton").onclick = function () {
            hideInputDialog();
            resolve(null); // Resolve with null if canceled
        };
    });
}

// Function to hide the dialog
function hideInputDialog() {
    document.getElementById("dialogOverlay").style.display = "none";
    document.getElementById("inputDialog").style.display = "none";
}

function checkURL(base) {
    let image_url = base + '/1/1/1.png';
    var http = new XMLHttpRequest();

    http.open('HEAD', image_url, false);
    try {
        http.send();
    }
    catch (e) {
        console.log(e.message)
    }
    let status = http.status;
    console.log(status);
    return status;
}

function inputTilebase() {
    $("#userInput").val(tilebase);
    showInputDialog().then((result) => {
        if (result !== null) {
            /* not working yet, needs to be reviewed
            if (checkURL(result) == '200') {
                console.log("Successfully checked the resource.")
                console.log("Switching tilebase to " + result);
            }
            else {
                console.log("There was an error requesting the resource.")
                $("#infobox").html("There was an error requesting the new resource.");
            }
            */
            localStorage.tilebase = result;
            loadSettings();
            showSettings();
        } else {
            console.log("Tilebase dialog canceled.");
        }
    });
}

loadSettings();

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
map.on("click", function () { stopLocate() });
map.on("mousedown", function () { stopLocate() });
map.on("gesture", function () { stopLocate() });
map.on("zoomend", showZoomlevel)

$(document).ready(function () {
    try {
        appVersion = Windows.ApplicationModel.Package.current.id.version;
        appString = `v${appVersion.major}.${appVersion.minor}.${appVersion.build}`;
        var currentView = Windows.UI.Core.SystemNavigationManager.getForCurrentView();
        currentView.appViewBackButtonVisibility = Windows.UI.Core.AppViewBackButtonVisibility.visible;
    }
    catch (e) {
        console.log('Windows namespace not available, backbutton listener and versioninfo skipped.')
        appString = '';
    }

    document.onselectstart = new Function("return false")

    startLocate()
});