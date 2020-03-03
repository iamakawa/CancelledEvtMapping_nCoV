var NumAllEvtCount;
var NumTodayEvtCount;
var CancelledEvtList =
    "https://script.google.com/macros/s/AKfycbz51mpjVZ-XfHTti5Q-fFwzHaRaY_P1ZajawHXxnXnZsynYBq17/exec";

var map = L.map("map").fitWorld();
var geoJsonLayer;
var geoJsonLayerGroup =  L.layerGroup([]);

window.onload = function(){
    map.setView([35.71, 139.75], 14);
    map.on("mousemove", onMapMousemove);
    
    L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw", {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: "mapbox/streets-v11",
            tileSize: 512,
            zoomOffset: -1
        }
    ).addTo(map);
    fetch(CancelledEvtList)
    .then(function(response) {
        return response.json();
    })
    .then(function(myJson) {
        countReset()
        geoJsonLayer = L.geoJSON(myJson, {
            style: function(feature) {
                return feature.properties && feature.properties.style;
            },
            onEachFeature: onEachFeature
        }).addTo(map);
        geoJsonLayerGroup.addTo(map);
        geoJsonLayerGroup.addTo(geoJsonLayer)
    });
   
}

var latloninfo = L.control({ position: "topright" });
latloninfo.onAdd = function(map) {
    //divを作成
    this.ele = L.DomUtil.create("div", "infostyle");
    //後で使うためにidを設定
    this.ele.id = "latlondiv";
    //最初は非表示
    this.ele.style.visibility = "hidden";
    //div上のとmousemoveイベントがmapに連鎖しないように設定
    this.ele.onmousemove = function(e) {
        e.stopPropagation();
    };
    return this.ele;
};
latloninfo.addTo(map);

var searchbox = L.control({ position: "topright" });
searchbox.onAdd = function(map) {
    //divを作成
    this.ele = L.DomUtil.create("input", "searchbox");
    //後で使うためにidを設定
    this.ele.id = "searchbox";
    this.ele.onkeypress = function(e) {
        fetch(CancelledEvtList)
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            geoJsonLayer.clearLayers();
		    geoJsonLayerGroup.removeLayer(geoJsonLayer);
            countReset()
            var searchbox = document.getElementById("searchbox");
            L.geoJSON(myJson, {
                style: function(feature) {
                return feature.properties && feature.properties.style;
                },
            filter: function(feature, layer) {   
                return (feature.properties.name.match(searchbox.value));
            },
            onEachFeature: onEachFeature
        }).addTo(map);
        geoJsonLayerGroup.addTo(map);
        geoJsonLayerGroup.addTo(geoJsonLayer)
    });
    }
    return this.ele;
};
searchbox.addTo(map);

function onEachFeature(feature, layer) {
    var popupContent =
        "<b>" +
        feature.properties.name +
        "</b><br>" +
        feature.properties.address +
        "<table>";

    for (i = 0; i < feature.properties.classification.length; i++) {
        popupContent +=
            "<tr><td>" +
            feature.properties.classification[i] +
            "</td><td>" +
            feature.properties.date[i] +
            '</td><td><a href="' +
            feature.properties.URL[i] +
            '">' +
            feature.properties.event_name[i] +
            "</a></td><td>" +
            feature.properties.facility[i] +
            "</td></tr>";

        NumAllEvtCount++;
        if (feature.properties.date[i] == getNowYMD()) {
            NumTodayEvtCount++;
        }
    }
    popupContent += "</table>";

    if (feature.properties && feature.properties.popupContent) {
        popupContent += feature.properties.popupContent;
    }

    layer.bindPopup(popupContent);
}

function onMapMousemove(e) {
    //地図上を移動した際にdiv中に緯度経度を表示
    var box = document.getElementById("latlondiv");
    var html =
        '<font color="red">中止・延期イベント総数   :' +
        NumAllEvtCount +
        "</font><br>" +
        '<font color="green">本日の中止・延期イベント :' +
        NumTodayEvtCount +
        "</font>";
    box.innerHTML = html;
    box.style.visibility = "visible";
}

function getNowYMD() {
    var dt = new Date();
    var y = dt.getFullYear();
    var m = ("00" + (dt.getMonth() + 1)).slice(-2);
    var d = ("00" + dt.getDate()).slice(-2);
    var result = y + "/" + m + "/" + d;
    return result;
}

function countReset()
{
    NumAllEvtCount = 0;
    NumTodayEvtCount = 0;
}