//Sean O'Keefe

//Give credit where credit is due: The context menu code I got from http://googleapitips.blogspot.com/p/google-maps-api-v3-context-menu-example.html
//That includes the following functions [and maybe some more code, I apologize if I miss it]: getCanvasXY, setMenuXY, showContextMenu, and some styles.

var map;
var kmz_Layer;
var addressMarker = null;
var startMarker = null;
var endMarker = null;
var dataURL;
var posPointLatLng = null;
var startPointIcon = "images/sp32.png";
var endPointIcon = "images/ep32.png";
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var myDialog;
var showDDDialog;
var startingAddress = true;
var directionsHTML = "";
var contextMenuHTML = "" +
    "<div id='DivContextMenu' onmouseleave='CloseContextMenu();'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Directions<br />" +
    "<a id='CMStart'><div id='DivCMStart' class='cMenuItem' onmouseover='Highlight(this, \"on\");' onmouseleave='Highlight(this, \"off\");' onclick='SetPoint(this);'><img src='images/sp22.png' />&nbsp;&nbsp;&nbsp;Start Point<\/div><\/a>" +
    "<a id='CMEnd'><div id='DivCMEnd' class='cMenuItem' onmouseover='Highlight(this, \"on\");' onmouseleave='Highlight(this, \"off\");' onclick='SetPoint(this);'><img src='images/ep22.png' />&nbsp;&nbsp;&nbsp;End Point<\/div><\/a>" +
"<a id='CMStop'><div id='DivCMDirections' class='cMenuItem' onmouseover='Highlight(this, \"on\");' onmouseleave='Highlight(this, \"off\");' onclick='CheckForPoints();'><img src='images/wheel22.png' />&nbsp;&nbsp;&nbsp;Get Directions<\/div><\/a>" +
    "<a id='CMStop'><div id='DivCMClear' class='cMenuItem' onmouseover='Highlight(this, \"on\");' onmouseleave='Highlight(this, \"off\");' onclick='SetPoint(this);'><img src='images/stop22.png' />&nbsp;&nbsp;&nbsp;Clear All<\/div><\/a>" +
    "</div>";

//Gets URL variable from URL, for KML
function GetUrlValue(VarSearch) {
    var SearchString = window.location.search.substring(1);
    var VariableArray = SearchString.split('&'); //Split URL string on '&' symbol
    for (var i = 0; i < VariableArray.length; i++) {
        var KeyValuePair = VariableArray[i].split('='); //Loop through and split substrings on '=' symbol.
        if (KeyValuePair[0] == VarSearch) { //If substring category is progno then return the value in the URL.
            return KeyValuePair[1]; //return found value.
        }
    }
}

dataURL = GetUrlValue('url');

//Initializes the map
function InitializeMap() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: new google.maps.LatLng(43.0, -76.1890),
        zoom: 7,
    });
    google.maps.event.addListener(map, 'rightclick', function (event) {
        showContextMenu(event.latLng);
    });
    try {
        if ((dataURL != null) && (dataURL.length > 0)) {
            kmz_Layer = new google.maps.KmlLayer({
                url: dataURL
            });
            kmz_Layer.setMap(map);
            $("#SpanCB").show();
        }
    } catch (ex) {
        alert(ex);
    }
}

//Geocoder, Google Maps
function GMCodeAddress(address) {
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var r = results[0];
            $("#TBLocation").val(r.formatted_address);
            var pos = new google.maps.LatLng(r.geometry.location.lat(), r.geometry.location.lng());
            if (startingAddress) {
                RemoveStartMarker();
                RemoveEndMarker();
                AddMarker("start", pos, r.formatted_address);
                map.setZoom(19);
                map.setCenter(pos);
                ToggleAddressLabel("end");
            } else {
                RemoveEndMarker();
                AddMarker("end", pos, r.formatted_address);
            }
            GetDirections();
        } else {
            alert("That address returned no results.");
        }
    });
}

function ResizeDiv() {
    vpw = $(window).width();
    vph = $(window).height();
    var h = vph - 52; 
    var newHeight = h + "px";
    $('#map-canvas').css({ 'height': newHeight });
}

//JQuery Functions
$("#BtnLocate").click(function () {
    if ($("#TBLocation").val().length > 0)
        GMCodeAddress($("#TBLocation").val());
});
$("#BtnClear").click(function () {
    ClearRoute();
    RemoveStartMarker();
    RemoveEndMarker();
    ToggleAddressLabel("start");
});
$("#CBkml").change(function () {
    if (this.checked) {
        kmz_Layer.setMap(map);
    } else {
        kmz_Layer.setMap(null);
    }
});
function Highlight(which, state) {
    if (state == "on")
        $("#" + which.id).css("background-color", "lightgreen");
    else
        $("#" + which.id).css("background-color", "white");
}
function CloseContextMenu() {
    $('.contextmenu').remove();
}
function SetPoint(which) {
    $('.contextmenu').remove();
    if (which.id == "DivCMStart") {
        if (startMarker != null)
            RemoveStartMarker();
        AddMarker("start", posPointLatLng, "Directions Start");
    } else if (which.id == "DivCMEnd") {
        if (endMarker != null)
            RemoveEndMarker()
        AddMarker("end", posPointLatLng, "Directions End");
    } else if (which.id == "DivCMClear") {
        ClearRoute();
    }
    GetDirections();
}

function CheckForPoints() {
    if ((startMarker != null) && (endMarker != null)) {
        GetDirections();
    } else {
        alert("You'll need to set a Start and End point to calculate directions.");
    }
}

function GetDirections() {
    if ((startMarker != null) && (endMarker != null)) {
        var startPos = new google.maps.LatLng(startMarker.getPosition().lat(), startMarker.getPosition().lng());
        var endPos = new google.maps.LatLng(endMarker.getPosition().lat(), endMarker.getPosition().lng());
        var request = {
            origin: startPos,
            destination: endPos,
            travelMode: google.maps.TravelMode.DRIVING
        };
        directionsDisplay.setMap(map);
        directionsDisplay.setOptions({ suppressMarkers: true });
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
                ToggleAddressLabel("start");
                DisplayDirections(response.routes[0]);
            }
        });
    } 
}

function DisplayDirections(route) {
    var tripInfo = route.legs[0];
    directionsHTML = "<table id='TblDirections'>";
    directionsHTML += "<tr><td colspan='7'><b>Start Address:</b> " + tripInfo.start_address + "</td></tr>";
    directionsHTML += "<tr><td colspan='7'><br /></td></tr>";
    for (var i = 0; i < tripInfo.steps.length; i++) {
        var leg = tripInfo.steps[i];
        directionsHTML += "<tr>";
        directionsHTML += "<td valign='top'>" + (i + 1) + "</td>";
        directionsHTML += "<td>&nbsp;&nbsp;&nbsp;</td>";
        directionsHTML += "<td valign='top'>" + leg.instructions + "</td>";
        directionsHTML += "<td>&nbsp;&nbsp;&nbsp;</td>";
        directionsHTML += "<td valign='top'>" + leg.distance.text + "</td>";
        directionsHTML += "<td>&nbsp;&nbsp;&nbsp;</td>";
        directionsHTML += "<td valign='top'>" + leg.duration.text + "</td>";
        directionsHTML += "</tr>";
        if (i < (tripInfo.steps.length - 1)) {
            directionsHTML += "<tr>";
            directionsHTML += "<td colspan='7'><hr /></td>";
            directionsHTML += "</tr>";
        }
    }
    directionsHTML += "<tr><td colspan='7'>&nbsp;</td></tr>";
    directionsHTML += "<tr><td colspan='7'><b>End Address:</b> " + tripInfo.end_address + "</td></tr>";
    directionsHTML += "<tr><td colspan='7'>&nbsp;</td></tr>";
    directionsHTML += "<tr><td colspan='7'><b>Trip Distance:</b> " + tripInfo.distance.text + "<br /><b>Trip Duration:</b> " + tripInfo.duration.text + "</td></tr>"
    directionsHTML += "</table>";
    var printLink = "<br /><p class='center'><input type='button' onclick='OpenPrintWindow();' value='print' /><br /><br /></p>";
    showDDDialog(directionsHTML + printLink);
}

function OpenPrintWindow() {
    var printWindow = window.open('', 'drivingDirectionsWindow', 'width=800,height=700');
    printWindow.document.title = "DrivingDirections";
    printWindow.document.writeln('<!DOCTYPE html>');
    printWindow.document.writeln('<html>');
    printWindow.document.writeln('<head>');
    printWindow.document.writeln('    <title>Driving Directions</title>');
    printWindow.document.writeln('    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">');
    printWindow.document.writeln('    <meta charset="utf-8">');
    printWindow.document.writeln('    <link href="styles/styles.css" rel="stylesheet" />');
    printWindow.document.writeln('</head>');
    printWindow.document.writeln('<body style="background-color:whitesmoke;">');
    printWindow.document.writeln("<h2 class='center'>Driving Directions</h2>");
    printWindow.document.write(directionsHTML);
    printWindow.document.writeln('</body>');
    printWindow.document.writeln('</html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

function ClearRoute() {
    if ((startMarker != null) && (endMarker != null)) {
        directionsDisplay.setMap(null);
    }
    ToggleAddressLabel("start");
    RemoveStartMarker();
    RemoveEndMarker();
}

function AddMarker(which, pos, label) {
    if (which == "start") {
        startMarker = new google.maps.Marker({
            position: pos,
            map: map,
            icon: startPointIcon,
            title: label
        });
        ToggleAddressLabel("end");
    } else if (which == "end") {
        endMarker = new google.maps.Marker({
            position: pos,
            map: map,
            icon: endPointIcon,
            title: label
        });
        ToggleAddressLabel("start");
    }
}

function ToggleAddressLabel(which) {
    $("#TBLocation").val("");
    if (which == "start") {
        $("#SpanAddress").html("Enter a Starting Address:");
        startingAddress = true;
    } else {
        $("#SpanAddress").html("Enter an Ending Address:");
        startingAddress = false;
    }
}

function RemoveStartMarker() {
    if (startMarker != null) {
        startMarker.setMap(null);
        startMarker = null;
    }
}
function RemoveEndMarker() {
    if (endMarker != null) {
        endMarker.setMap(null);
        endMarker = null;
    }
}
//On page load, 
$(document).ready(function () {
    ResizeDiv();
    InitializeMap();
    $(function () {
        //myDialog;
        showDDDialog = function (html) {
            //dialog options
            var wWidth = $(window).width() * .55;
            var wHeight = $(window).height() * .75;
            var dialogOptions = {
                "title": "Driving Directions",
                "width": wWidth,
                "height": wHeight,
                "modal": true,
                "resizable": true,
                "draggable": true
            };
            // dialog-extend options
            var dialogExtendOptions = {
                "closable": true,
                "maximizable": true,
                "minimizable": true,
                "minimizeLocation": "right",
                "collapsable": true,
                "dblclick": "collapse"
            };
            // open dialog
            myDialog = $("<div id='DivDirections'>" + html + "</div>").dialog(dialogOptions).dialogExtend(dialogExtendOptions);
        }
    });
});

//When page is resized, resize window
window.onresize = function (event) {
    try {
        ResizeDiv();
    } catch (ex) {
        //alert(ex.message);
    }
}

// -------------------------- Beginning of code from: ........ http://googleapitips.blogspot.com/p/google-maps-api-v3-context-menu-example.html
function getCanvasXY(currentLatLng) {
    var scale = Math.pow(2, map.getZoom());
    var nw = new google.maps.LatLng(
        map.getBounds().getNorthEast().lat(),
        map.getBounds().getSouthWest().lng()
    );
    var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
    var worldCoordinate = map.getProjection().fromLatLngToPoint(currentLatLng);
    var currentLatLngOffset = new google.maps.Point(
        Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
        Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
    );
    return currentLatLngOffset;
}

function setMenuXY(currentLatLng) {
    var mapWidth = $('#map_canvas').width();
    var mapHeight = $('#map_canvas').height();
    var menuWidth = $('.contextmenu').width();
    var menuHeight = $('.contextmenu').height();
    var clickedPosition = getCanvasXY(currentLatLng);
    var x = clickedPosition.x;
    var y = clickedPosition.y;

    if ((mapWidth - x) < menuWidth)
        x = x - menuWidth;
    if ((mapHeight - y) < menuHeight)
        y = y - menuHeight;

    $('.contextmenu').css('left', x);
    $('.contextmenu').css('top', y);
}

function showContextMenu(currentLatLng) {
    posPointLatLng = currentLatLng;
    var projection;
    var contextmenuDir;
    projection = map.getProjection();
    $('.contextmenu').remove();
    contextmenuDir = document.createElement("div");
    contextmenuDir.className = 'contextmenu';
    contextmenuDir.innerHTML = contextMenuHTML;
    $(map.getDiv()).append(contextmenuDir);
    setMenuXY(currentLatLng);
    contextmenuDir.style.visibility = "visible";
}

// -------------------------- End of code from: ...............http://googleapitips.blogspot.com/p/google-maps-api-v3-context-menu-example.html 