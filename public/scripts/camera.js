var video = document.getElementById("video");
var flashLight = document.getElementById("flashlight");
var cameraFacing = localStorage.getItem("camerafacing");
if(!cameraFacing){
    cameraFacing = "environment";
}
var flashLightState = false;
var loadSetup = 1;
try{
    var urlParams = (new URL(window.location.href)).searchParams;
}catch(e){}
function buttonSetup(){
    if(!videoRecording && !liveStreaming){
        takePhotoButton.disabled = 0;
        recordVideoButton.childNodes[0].childNodes[0].style.borderRadius = "50%";
        recordVideoButton.disabled = 0;
        liveButton.disabled = 0;
        rotate.disabled = 0;
        takePhotoDraggable.disabled = 0;
        microphoneButton.disabled = 0;
    }
    setMicrophoneImage();
}
var afterCameraPrepare;
var globalStream;
function cameraSetup(stream){
    globalStream = stream;
    video.srcObject = globalStream;
    var track = stream.getVideoTracks()[0];
    preparingCamera = false;
    if(afterCameraPrepare == "recordvideo"){
        afterCameraPrepare = null;
        videoSetup();
    }else if(afterCameraPrepare == "livestream"){
        afterCameraPrepare = null;
        videoSetup(true);
    }
    buttonSetup();
    if(track.getCapabilities().torch){
        flashLight.onclick = function(){
            flashLightState = !flashLightState;
            track.applyConstraints({
                advanced: [{torch: flashLightState}]
            });
            if(flashLightState){
                flashLight.childNodes[0].src = "/images/flashlight1.svg";
            }else{
                flashLight.childNodes[0].src = "/images/flashlight0.svg";
            }
        };
        flashLight.disabled = 0;
    }
}
var preparingCamera;
var audioEnabled = true;
function cameraStart(){
    preparingCamera = true;
    navigator.mediaDevices.getUserMedia({
        // audio: false,
        audio: audioEnabled,
        video: {
            width: {ideal: 1920},
            height: {ideal: 1080},
            facingMode: cameraFacing
        }
    })
    .then(function(stream){cameraSetup(stream);});
}
function cameraStop(){
    // rotate.disabled = 1;
    // recordVideoButton.disabled = 1;
    takePhotoButton.disabled = 1;
    // liveButton.disabled = 1;
    flashLight.disabled = 1;
    takePhotoDraggable.disabled = 1;
    microphoneButton.disabled = 1;
    if(!video.srcObject){
        return;
    }
    video.srcObject.getTracks().forEach(function(track){
        track.stop();
    });
    video.srcObject = null;
    if(flashLightState){
        flashLightState = 0;
        flashLight.childNodes[0].src = "/images/flashlight0.svg";
    }
}
var videoRecording;
var recorder;
// var data = [];
// var offlineData = [];
var offlineDataKeys = [];
function videoSetup(live, dbid){
    /*navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
            width: {ideal: 1920},
            height: {ideal: 1080},
            facingMode: cameraFacing
        }
    })
    .then(function(stream){cameraSetup(stream);})
    .then(function(){startRecording(video.captureStream(), live);});*/
    if(preparingCamera){
        if(live){
            afterCameraPrepare = "livestream";
        }else{
            afterCameraPrepare = "recordvideo";
        }
        return;
    }
    // startRecording(video.captureStream(), live);
    startRecording(globalStream, live, dbid);
}
function switchCamera(){
    var oldTrack = globalStream.getVideoTracks()[0];
    oldTrack.stop();
    navigator.mediaDevices.getUserMedia({
        // audio: false,
        audio: audioEnabled,
        video: {
            width: {ideal: 1920},
            height: {ideal: 1080},
            facingMode: cameraFacing
        }
    })
    .then(function(stream){
        var newTrack = stream.getVideoTracks()[0];
        globalStream.removeTrack(oldTrack);
        globalStream.addTrack(newTrack);
        video.srcObject = globalStream;
        var sender = newTrack.getSenders().find(function(s){
            return s.track.kind === newTrack.kind;
        });
        sender.replaceTrack(newTrack);
    });
}
var rotate = document.getElementById("rotate");
rotate.onclick = function(){
    // this.disabled = 1;
    // // recordVideoButton.disabled = 1;
    // takePhotoButton.disabled = 1;
    // // liveButton.disabled = 1;
    // flashLight.disabled = 1;
    // takePhotoDraggable.disabled = 1;
    if(cameraFacing == "environment"){
        cameraFacing = "user";
    }else{
        cameraFacing = "environment";
    }
    localStorage.setItem("camerafacing", cameraFacing);
    // cameraStop();
    // cameraStart();
    switchCamera();
};
var microphoneButton = document.getElementById("microphone");
function setMicrophoneImage(){
    if(audioEnabled){
        // this.style.backgroundColor = "#256aff40";
        microphoneButton.children[0].src = "/images/microphone.svg";
    }else{
        // this.style.backgroundColor = "#ec040040";
        microphoneButton.children[0].src = "/images/disabledmicrophone.svg";
    }
}
function toggleMicrophone(){
    audioEnabled = !audioEnabled;
    setMicrophoneImage();
    cameraStop();
    cameraStart();
}
microphoneButton.onclick = function(){
    toggleMicrophone();
};
var afterRecorderStop;
video.onpause = function(){
    // this.play();
    if(audioEnabled){
        if(videoRecording){
            afterRecorderStop = "recordvideo";
            recordVideo();
        }else if(liveStreaming){
            afterRecorderStop = "livestream";
            liveStream();
        }
        toggleMicrophone();
    }
};
var canvas = document.getElementById("canvas");
/*function dataURItoBlob(dataURI){
    var byteString = atob(dataURI.split(",")[1]);
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    var ab = new ArrayBuffer(byteString.length);
    var ua = new Uint8Array(ab);
    for(var i = 0; i < byteString.length; i++){
        ua[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
}*/
var statusBox = document.getElementById("statusBox");
var statusBigBox = document.getElementById("statusBigBox");
var statusLocation = document.getElementById("statuslocation");
statusBox.addEventListener("click", function(e){
    if(e.target == statusLocation || e.target == statusLocation.children[0]){
        return;
    }
    if(statusBigBox.style.display == "flex"){
        statusBigBox.style.display = "none";
        try{
            var videos = document.querySelectorAll("#statusBigBox video");
            for(var i = 0; i < videos.length; i++){
                videos[i].pause();
            }
        }catch(e){}
    }else{
        statusBigBox.style.display = "flex";
    }
});
var status2 = document.getElementById("status2");
var statusPhotovideo = document.getElementById("statusphotovideo");
function getNoValIfNoVal(val){
    if(!val){
        return "-";
    }
    return val;
}
try{
    var indexedDbRequest = indexedDB.open("localdata");
    indexedDbRequest.onupgradeneeded = function(){
        this.result.createObjectStore("location");
        this.result.createObjectStore("locationupload");
        this.result.createObjectStore("description");
    };
}catch(e){}
function saveData(objectStoreName, data){
    try{
        var indexedDbRequest = indexedDB.open("localdata");
        indexedDbRequest.onsuccess = function(){
            var db = this.result;
            var transaction = db.transaction(objectStoreName, "readwrite");
            var store = transaction.objectStore(objectStoreName);
            store.put(data, Date.now());
        };
    }catch(e){}
}
function getLocationString(local_latitude, local_longitude, local_altitude, local_accuracy, local_altitudeAccuracy, local_timestamp){
    local_latitude = getNoValIfNoVal(local_latitude);
    local_longitude = getNoValIfNoVal(local_longitude);
    local_altitude = getNoValIfNoVal(local_altitude);
    local_accuracy = getNoValIfNoVal(local_accuracy);
    local_altitudeAccuracy = getNoValIfNoVal(local_altitudeAccuracy);
    var timeStamp = "";
    if(local_timestamp){
        timeStamp = "\n" + getDateTime(local_timestamp) + " (" + local_timestamp + ")";
    }
    return local_latitude + ", " + local_longitude + "; " + local_altitude + "; " + local_accuracy + "; " + local_altitudeAccuracy + timeStamp;
}
var locationDetails = document.getElementById("locationDetails");
var locationDetailsCoordinates = document.createElement("div");
locationDetails.appendChild(locationDetailsCoordinates);
statusLocation.addEventListener("click", function(){
    if(locationDetails.style.display == "flex"){
        locationDetails.style.display = "none";
    }else{
        locationDetailsCoordinates.innerText = getLocationString(latitude, longitude, altitude, accuracy, altitudeAccuracy, locationTime);
        locationDetails.style.display = "flex";
    }
});
var locationUploadArray = [];
var lastUploadLocationID = 0;
function uploadLocation(n, id, key, coordinates){
    setTimeout(function(){
        var currentUploadLocationID = ++lastUploadLocationID;
        unloadWarning++;
        delayFunction(function(){
            if(currentUploadLocationID == lastUploadLocationID){
                statusLocation.style.backgroundColor = "#ffff0080";
            }
            addStatus("location", "locationcoordinates", "ffff00", ["#" + n, getLocationString(coordinates[0], coordinates[1], coordinates[2], coordinates[3], coordinates[4])]);
        });
        var ajax = new XMLHttpRequest();
        ajax.open("POST", "/");
        ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        ajax.onload = function(){
            setTimeout(function(){
                if(ajax.responseText === "1"){
                    delayFunction(function(){
                        if(currentUploadLocationID == lastUploadLocationID){
                            statusLocation.style.backgroundColor = "#00ff0080";
                        }
                        addStatus("location", "locationcoordinates", "00ff00", "#" + n);
                    });
                    unloadWarning--;
                }else{
                    delayFunction(function(){
                        if(currentUploadLocationID == lastUploadLocationID){
                            statusLocation.style.backgroundColor = "#ff000080";
                        }
                        addStatus("location", "locationcoordinates", "ff0000", ["#" + n, ajax.responseText]);
                    });
                }
            },0);
        };
        ajax.onerror = function(){
            setTimeout(function(){
                delayFunction(function(){
                    if(currentUploadLocationID == lastUploadLocationID){
                        statusLocation.style.backgroundColor = "#ff000080";
                    }
                    var retryButton = document.createElement("button");
                    retryButton.innerHTML = '<img class="whiteicon" width="32" height="32" src="/images/retry.svg">';
                    retryButton.onclick = function(){
                        uploadLocation(n, id, key, coordinates);
                    };
                    retryButton.classList.add("buttons");
                    addStatus("location", "locationcoordinates", "ff0000", ["#" + n, ajax.Error], retryButton);
                });
                var onlineFunc = function(){window.removeEventListener("online", onlineFunc);uploadLocation(n, id, key, coordinates);};
                window.addEventListener("online", onlineFunc);
            },0);
        };
        ajax.send("id="+encodeURIComponent(id)+"&key="+encodeURIComponent(key)+"&latitude="+encodeURIComponent(coordinates[0])+"&longitude="+encodeURIComponent(coordinates[1])+"&altitude="+encodeURIComponent(coordinates[2])+"&accuracy="+encodeURIComponent(coordinates[3])+"&altitudeAccuracy="+encodeURIComponent(coordinates[4])+"&location_time="+encodeURIComponent(coordinates[5]));
    },0);
}
var latitude;
var longitude;
var altitude;
var accuracy;
var altitudeAccuracy;
var locationTime;
var geolocationSupported;
try{
    function setStorageIfNot(local_name, local_value){
        if(!localStorage.getItem(local_name)){
            localStorage.setItem(local_name, local_value);
        }
    }
    if(navigator.geolocation){
        geolocationSupported = true;
        statusLocation.children[0].src = "/images/waitinglocation.svg";
        statusLocation.children[0].title = getString("locationcoordinates") + " | " + getString("notdetecting");
        statusLocation.children[0].classList.add("locationcoordinates", "notdetecting");
        try{
            setStorageIfNot("locationhighaccuracymode", true);
            setStorageIfNot("locationcachemode", true);
            setStorageIfNot("locationcachetimeout", 1000);
        }catch(e){}
    }else{
        statusLocation.style.borderColor = "#ff000080";
        statusLocation.children[0].src = "/images/nolocation.svg";
        statusLocation.children[0].title = getString("locationcoordinates") + " | " + getString("unavailable");
        statusLocation.children[0].classList.add("locationcoordinates", "unavailable");
        statusLocation.children[0].classList.remove("whiteicon");
        locationDetails.style.backgroundColor = "#ec040080";
    }
}catch(e){}
var watchPositionID;
var detectingLocation;
function getLocation(continuousUpdate, highAccuracy, cacheData, cacheTimeout)  {
    detectingLocation = true;
    if(watchPositionID){
        navigator.geolocation.clearWatch(watchPositionID);
        watchPositionID = null;
    }
    if(continuousUpdate){
        if(cacheData){
            watchPositionID = navigator.geolocation.watchPosition(afterLocation, locationError, {enableHighAccuracy: highAccuracy, maximumAge: cacheTimeout});
        }else{
            watchPositionID = navigator.geolocation.watchPosition(afterLocation, locationError, {enableHighAccuracy: highAccuracy});
        }
    }else{
        if(cacheData){
            navigator.geolocation.getCurrentPosition(afterLocation, locationError, {enableHighAccuracy: highAccuracy, maximumAge: cacheTimeout});
        }else{
            navigator.geolocation.getCurrentPosition(afterLocation, locationError, {enableHighAccuracy: highAccuracy});
        }
    }
    statusLocation.style.borderColor = "#ffff0080";
    statusLocation.children[0].className = '';
    statusLocation.children[0].src = "/images/detectinglocation.svg";
    statusLocation.children[0].title = getString("locationcoordinates") + " | " + getString("detecting");
    statusLocation.children[0].classList.add("locationcoordinates", "detecting");
}
function getLocation2(liveLocation){
    getLocation((localStorage.getItem("currentlocationmode") == "true") || liveLocation, localStorage.getItem("locationhighaccuracymode") == "true", localStorage.getItem("locationcachemode") == "true", parseInt(localStorage.getItem("locationcachetimeout")));
}
function afterLocation(position)  {
    detectingLocation = false;
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    altitude = position.coords.altitude;
    accuracy = position.coords.accuracy;
    altitudeAccuracy = position.coords.altitudeAccuracy;
    locationTime = position.timestamp;
    var locationCoordinatesArray = [latitude, longitude, altitude, accuracy, altitudeAccuracy, locationTime];
    saveData("location", locationCoordinatesArray);
    if(locationUploadArray.length > 0){
        for(var key in locationUploadArray){
            uploadLocation(locationUploadArray[key][0], locationUploadArray[key][1], locationUploadArray[key][2], locationCoordinatesArray);
            locationUploadArray.shift();
        }
    }
    if(locationPreUploadElements.length > 0){
        saveData("locationupload", locationCoordinatesArray);
        for(var key in locationPreUploadElements){
            preUpload(locationCoordinates, locationPreUploadElements[key][0], locationCoordinatesArray, locationPreUploadElements[key][1]);
            locationPreUploadElements.shift();
        }
    }
    statusLocation.style.borderColor = "#00ff0080";
    if(!statusLocation.children[0].classList.contains("whiteicon")){
        statusLocation.children[0].src = "/images/location.svg";
        statusLocation.children[0].className = '';
        statusLocation.children[0].title = getString("locationcoordinates") + " | " + getString("detected");
        statusLocation.children[0].classList.add("locationcoordinates", "detected");
        statusLocation.children[0].classList.add("whiteicon");
        locationDetails.style.backgroundColor = "#256aff80";
    }
    if(locationDetails.style.display == "flex"){
        locationDetailsCoordinates.innerText = getLocationString(latitude, longitude, altitude, accuracy, altitudeAccuracy, locationTime);
    }
    try{
        localStorage.setItem("locationallowed", "true");
    }catch(e){}
    if(locationErrorDiv){
        locationErrorDiv.remove();
        locationErrorDiv = null;
    }
    if(locationRetryButton){
        locationRetryButton.remove();
        locationRetryButton = null;
    }
    var locationEnabledVal = localStorage.getItem("cameralivestreamlocationattach");
    var liveLocationEnabledVal = localStorage.getItem("cameralivestreamconstantlylocationattach");
    if((((locationEnabledVal == "true") || !locationEnabledVal) || ((liveLocationEnabledVal == "true") || !liveLocationEnabledVal)) && liveStreaming && liveN_2){
        uploadLocation(liveN_2, liveID_2, liveKey_2, locationCoordinatesArray);
    }
}
var locationRetryButton;
var locationErrorDiv;
function locationError(error){
    detectingLocation = false;
    statusLocation.style.borderColor = "#ff000080";
    statusLocation.children[0].src = "/images/nolocation.svg";
    statusLocation.children[0].className = '';
    statusLocation.children[0].title = getString("locationcoordinates") + " | " + getString("unavailable");
    statusLocation.children[0].classList.add("locationcoordinates", "unavailable");
    // statusLocation.children[0].classList.remove("whiteicon");
    locationDetails.style.backgroundColor = "#ec040080";
    if(!locationErrorDiv){
        locationErrorDiv = document.createElement("div");
        var errorHTML = 'ERROR!<br>';
        switch(error.code)   {
            case error.PERMISSION_DENIED:
                locationErrorDiv.innerHTML = errorHTML + "permission denied";
                break;
            case error.POSITION_UNAVAILABLE:
                locationErrorDiv.innerHTML = errorHTML + "location unavailable";
                break;
            case error.TIMEOUT:
                locationErrorDiv.innerHTML = errorHTML + "request timed out";
                break;
            case error.UNKNOWN_ERROR:
                locationErrorDiv.innerHTML = errorHTML + "unknown error";
                break;
        }
        locationDetails.appendChild(locationErrorDiv);
        if(!locationRetryButton){
            locationRetryButton = document.createElement("button");
            locationRetryButton.innerHTML = '<img class="whiteicon" width="32" height="32" src="/images/retry.svg">';
            locationRetryButton.classList.add("buttons");
            locationRetryButton.addEventListener("click", function(){
                getLocation2();
            });
            locationDetails.appendChild(locationRetryButton);
        }
    }
    /*if(error.code == error.PERMISSION_DENIED){
        locationWait = 0;
    }*/
    try{
        if((error.code != error.PERMISSION_DENIED) || (localStorage.getItem("locationallowed") == "true")){
            setTimeout(getLocation, 250);
        }
    }catch(e){
        setTimeout(getLocation, 250);
    }
}
function getDateTime(millisecond){
    try{
        if(millisecond){
            var d = new Date(millisecond);
        }else{
            var d = new Date();
        }
        return d.getFullYear() + "-" + addZero(d.getMonth() + 1) + "-" + addZero(d.getDate()) + " " + addZero(d.getHours()) + ":" + addZero(d.getMinutes()) + ":" + addZero(d.getSeconds());
    }catch(e){
        return "";
    }
}
// function preImg(image){
//     var img = document.createElement("img");
//     img.src = image;
//     img.width = "0";
//     img.height = "0";
//     img.style.display = "block";
//     document.body.appendChild(img);
//     img.remove();
// }
// preImg("/images/offline.svg");
// preImg("/images/retry.svg");
// preImg("/images/photo.svg");
// preImg("/images/video.svg");
// preImg("/images/download.svg");
var delayTime = 0;
function delayFunction(callbackFunc){
    setTimeout(function(){
        if(delayTime){
            delayTime -= 2;
        }
        callbackFunc();
    },delayTime);
    delayTime += 2;
}
function addStatus(imageName, textName, color, text, html){
    var statusSubDiv = document.createElement("div");
    statusSubDiv.style.backgroundColor = "#"+color+"80";
    var spanIDstring = '';
    if(text){
        var spanID = Date.now();
        var spanIDstring = ' id="span' + spanID + '"';
    }
    statusSubDiv.innerHTML = '<img class="whiteicon" width="32" height="32" src="/images/'+imageName+'.svg" title="'+getString(textName)+'">&nbsp;<span'+spanIDstring+'>'+getDateTime()+'</span>';
    if(html){
        statusSubDiv.appendChild(html);
    }
    statusBigBox.prepend(statusSubDiv);
    if(text){
        var localspan = document.getElementById("span"+spanID);
        if(Array.isArray(text)){
            for(var i = 0; i < text.length; i++){
                localspan.appendChild(document.createElement("br"));
                localspan.appendChild(document.createTextNode(text[i]));
            }
        }else{
            localspan.appendChild(document.createElement("br"));
            localspan.appendChild(document.createTextNode(text));
        }
    }
    return statusSubDiv;
}
var unloadWarning = 0;
var topProgressBar = document.getElementById("progressbartop");
var lastUploadID = 0;
var locationCoordinates = [];
var locationPreUploadElements = [];
function preUpload(array, id, value, element){
    array[id] = value;
    var div = addStatus("location", "locationcoordinates", "ffff00", value.join("; "));
    element.appendChild(div);
}
function createDownloadButton(file, dbid){
    var downloadButton = document.createElement("a");
    downloadButton.innerHTML = '<img class="whiteicon" width="32" height="32" src="/images/download.svg" alt>';
    downloadButton.classList.add("buttons");
    if(file){
        downloadButton.href = URL.createObjectURL(file);
    }else if(dbid){
        downloadButton.onclick = function(e){
            e.preventDefault();
            getVideoIndexedDB(dbid, function(chunks){
                var blob = new Blob(chunks, {type: "video/webm"});
                var downloada = document.createElement("a");
                downloada.download = (new Date()).getTime();
                downloada.href = URL.createObjectURL(blob);
                downloada.click();
                URL.revokeObjectURL(downloada.href);
                downloada.remove();
            });
        };
    }
    downloadButton.download = (new Date()).getTime();
    downloadButton.title = getString("download");
    return downloadButton;
}
function linkButtonClicked(e, src){
    if(somethingInProgress()){
        e.preventDefault();
        openIframeOverlay(src);
    }
}
function createViewButton(n){
    var viewButton = document.createElement("a");
    viewButton.innerHTML = '<img class="whiteicon" width="32" height="32" src="/images/viewicon.svg" alt>';
    viewButton.classList.add("buttons");
    viewButton.href = "/view2?n=" + n;
    viewButton.target = "_blank";
    viewButton.title = getString("viewupload");
    viewButton.onclick = function(e){
        // if(emergencyModeEnabled){
        //     e.preventDefault();
        //     this.classList.add("disabled");
        // }
        linkButtonClicked(e, this.href);
    };
    return viewButton;
}
function automaticDownload(downloadButton, cameraMode){
    try{
        var automaticdownloadEnabledVal = localStorage.getItem("camera" + cameraMode + "automaticdownload");
        if((automaticdownloadEnabledVal == "true") || !automaticdownloadEnabledVal){
            downloadButton.click();
        }
    }catch(e){}
}
// try{
//     if(localStorage.getItem("saveuploads") == null){
//         localStorage.setItem("saveuploads", true);
//     }
// }catch(e){}
function uploadFile(file, cameraMode, id0, id, key, n0){
    setTimeout(function(){
        var currentUploadID = ++lastUploadID;
        unloadWarning++;
        if(currentUploadID == lastUploadID){
            statusLocation.style.backgroundColor = "";
            topProgressBar.style.width = "0";
            topProgressBar.style.backgroundColor = "#ffff0080";
            status2.style.borderColor = "#ffff0080";
        }
        var imageName;
        var fileType = file.type.split('/')[0];
        if(fileType == "image"){
            imageName = "photo";
        }else if(fileType == "video"){
            imageName = "video";
        }
        statusPhotovideo.src = "/images/" + imageName + ".svg";
        statusPhotovideo.classList.add(imageName);
        statusPhotovideo.title = getString(imageName);
        if(statusPhotovideo.style.display != "block"){
            statusPhotovideo.style.display = "block";
        }
        var downloadButton = createDownloadButton(file);
        if(!id0){
            automaticDownload(downloadButton, cameraMode);
        }
        var statusDiv = addStatus(imageName, imageName, "ffff00", null, downloadButton);
        try{
            var previewDiv = document.createElement("div");
            previewDiv.style.border = "1px solid #256aff80";
            previewDiv.style.margin = "1px";
            previewDiv.style.padding = "1px";
            try{
                previewDiv.style.display = "flex";
                previewDiv.style.justifyContent = "center";
            }catch(e){}
            if(fileType == "image"){
                previewDiv.innerHTML = '<img style="max-width:100%;min-height:25vh;max-height:75vh;object-fit:contain;" src="'+downloadButton.href+'">';
            }else{
                previewDiv.innerHTML = '<video style="max-width:100%;min-height:25vh;max-height:75vh;" controls src="'+downloadButton.href+'"></video>';
            }
            statusDiv.appendChild(previewDiv);
        }catch(e){}
        var progress = document.createElement("span");
        var progressBarDiv = document.createElement("div");
        progressBarDiv.style.width = "100%";
        progressBarDiv.style.display = "flex";
        progressBarDiv.style.position = "relative";
        var progressDiv = document.createElement("div");
        progressDiv.style.position = "absolute";
        var progressBar = document.createElement("div");
        progressBar.innerText = "0";
        progressBar.style.textIndent = "-200vw";
        progressBar.style.backgroundColor = "#256aff80";
        progressBarDiv.style.borderColor = "#256aff80";
        progressDiv.style.width = "100%";
        progressDiv.style.textAlign = "center";
        progressDiv.appendChild(progress);
        progressBarDiv.appendChild(progressDiv);
        progressBarDiv.appendChild(progressBar);
        progressBarDiv.classList.add("progressbardiv");
        progressBar.classList.add("progressbar");
        statusDiv.prepend(progressBarDiv);
        var locationEnabledVal = localStorage.getItem("camera" + cameraMode + "locationattach");
        var locationUploadEnabled = ((locationEnabledVal == "true") || !locationEnabledVal);
        if(id0){
            if(locationCoordinates[id0]){
                preUpload(locationCoordinates, currentUploadID, locationCoordinates[id0], statusDiv);
            }
        }else if(locationUploadEnabled){
            if(latitude != null && longitude != null && localStorage.getItem("currentlocationmode") == "true")    {
                var locationCoordinatesArray = [latitude, longitude, altitude, accuracy, altitudeAccuracy, locationTime];
                saveData("locationupload", locationCoordinatesArray);
                preUpload(locationCoordinates, currentUploadID, locationCoordinatesArray, statusDiv);
            }else{
                if(!watchPositionID && !detectingLocation){
                    getLocation2();
                }
                locationPreUploadElements.push([currentUploadID, statusDiv]);
            }
        }
        var ajax = new XMLHttpRequest();
        ajax.open("POST", "/");
        ajax.onload = function(){
            setTimeout(function(){
                if(ajax.responseText.charAt(0) == '#'){
                    var responseArray = ajax.responseText.substring(1).split('|');
                    var n = responseArray[0];
                    var id = responseArray[1];
                    var key = responseArray[2];
                    /*if(latitude != null && longitude != null)    {
                        uploadLocation(n, id, key);
                    }else{
                        locationUploadArray.push([n, id, key]);
                    }*/
                    /*if(locationUploadEnabled){
                        if(locationCoordinates[currentUploadID] && localStorage.getItem("currentlocationmode") == "true"){
                            uploadLocation(n, id, key, locationCoordinates[currentUploadID]);
                        }else{
                            if(!watchPositionID && !detectingLocation){
                                getLocation2();
                            }
                            locationUploadArray.push([n, id, key]);
                        }
                    }*/
                    if(locationCoordinates[currentUploadID]){
                        uploadLocation(n, id, key, locationCoordinates[currentUploadID]);
                    }else{
                        if(!watchPositionID && !detectingLocation){
                            getLocation2();
                        }
                        locationUploadArray.push([n, id, key]);
                    }
                    if(currentUploadID == lastUploadID){
                        topProgressBar.style.backgroundColor = "#00ff0080";
                        status2.style.borderColor = "#00ff0080";
                    }
                    addStatus(imageName, imageName, "00ff00", "#" + n, createViewButton(n));
                    try{
                        if((localStorage.getItem("saveuploads") == "true") || (localStorage.getItem("saveuploads") == null)){
                            var uploadsStorage = localStorage.getItem("uploads");
                            if(uploadsStorage){
                                uploadsStorage = JSON.parse(uploadsStorage);
                            }else{
                                uploadsStorage = [];
                            }
                            uploadsStorage.push([n, id, key/*, true, true*/]);
                            localStorage.setItem("uploads", JSON.stringify(uploadsStorage));
                        }
                    }catch(e){}
                    unloadWarning--;
                }else if(ajax.response == "1"){
                    if(currentUploadID == lastUploadID){
                        topProgressBar.style.backgroundColor = "#00ff0080";
                        status2.style.borderColor = "#00ff0080";
                    }
                    addStatus(imageName, imageName, "00ff00", "#" + n0, createViewButton(n0));
                }else{
                    if(currentUploadID == lastUploadID){
                        topProgressBar.style.backgroundColor = "#ff000080";
                        status2.style.borderColor = "#ff000080";
                    }
                    var retryButton = document.createElement("button");
                    retryButton.innerHTML = '<img class="whiteicon" width="32" height="32" src="/images/retry.svg">';
                    retryButton.onclick = function(){
                        uploadFile(file, cameraMode, currentUploadID, id, key, n0);
                    };
                    retryButton.classList.add("buttons");
                    addStatus(imageName, imageName, "ff0000", ajax.responseText, retryButton);
                }
            },0);
        };
        ajax.onerror = function(){
            setTimeout(function(){
                if(currentUploadID == lastUploadID){
                    topProgressBar.style.backgroundColor = "#ff000080";
                    status2.style.borderColor = "#ff000080";
                }
                var retryButton = document.createElement("button");
                retryButton.innerHTML = '<img class="whiteicon" width="32" height="32" src="/images/retry.svg">';
                retryButton.onclick = function(){
                    uploadFile(file, cameraMode, currentUploadID, id, key, n0);
                };
                retryButton.classList.add("buttons");
                addStatus(imageName, imageName, "ff0000", ajax.Error, retryButton);
                var onlineFunc = function(){window.removeEventListener("online", onlineFunc);uploadFile(file, cameraMode, currentUploadID, id, key, n0);};
                window.addEventListener("online", onlineFunc);
            },0);
        }
        ajax.upload.onprogress = function(e){
            setTimeout(function(){
                progressPercent = ((e.loaded / e.total) * 100).toFixed(2) + '%';
                progress.innerText = progressPercent + " (" + e.loaded + " / " + e.total + ")";
                progressBar.style.width = progressPercent;
                if(currentUploadID == lastUploadID){
                    topProgressBar.style.width = progressPercent;
                }
            },0);
        };
        var formData = new FormData();
        formData.append("photovideo", file);
        if(id && key){
            formData.append("id", id);
            formData.append("key", key);
        }
        ajax.send(formData);
    },0);
}
var photoTakenIcon = document.getElementById("phototakenicon");
var photoTakenIconCount = 0;
var photoTakenIconTimeout;
function takePhoto(){
    unloadWarning++;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    // takingPhoto.style.backgroundColor = "#256aff40";
    clearTimeout(photoTakenIconTimeout);
    // takingPhoto.style.backgroundColor = "#ffff0040";
    if(!photoTakenIconCount++){
        photoTakenIcon.style.display = "flex";
    }
    // addStatus("take_photo", "ffff00");
    //uploadFile(dataURItoBlob(canvas.toDataURL("image/png")), "takephoto");
    addStatus("photo", "photo", "ffff00");
    if(!--photoTakenIconCount){
        photoTakenIconTimeout = setTimeout(function(){
            photoTakenIcon.style.display = "none";
        }, 1000);
    }
    canvas.toBlob(function(blob){
        uploadFile(blob, "takephoto");
        unloadWarning--;
        /*if(!--photoTakenIconCount){
            photoTakenIconTimeout = setTimeout(function(){
                photoTakenIcon.style.display = "none";
            }, 1000);
        }*/
    });
}
var takePhotoButton = document.getElementById("takephoto");
takePhotoButton.addEventListener("click", function(){
    takePhoto();
});
var recordVideoButton = document.getElementById("recordvideo");
function onVideoStop(live, dbid){
    // var recordedBlob = new Blob(data, {type: "video/webm"});
    // data = [];
    /*if(live){
        // data = [];
        // recorder.start();
        // liveStreamTimeout = setTimeout(function(){
        //     recorder.stop();
        // }, 1000);
    }else if(!emergencyModeClicked){
        if(recordedBlob == ""){
            cameraStop();
        }
        cameraStart();
    }*/
    getVideoIndexedDB(dbid, function(chunks){
        var recordedBlob = new Blob(chunks, {type: "video/webm"});
        if(recordedBlob != ""){
            if(live){
                if(liveStartupOfflineRecording){
                    liveStartupOfflineRecording = false;
                    uploadFile(recordedBlob, "recordvideo");
                }else{
                    var div = document.createElement("div");
                    var downloadButton = createDownloadButton(recordedBlob);
                    div.appendChild(downloadButton);
                    div.appendChild(createViewButton(liveN_2));
                    addStatus("live", "livestream", "00ff00", "#" + liveN_2, div);
                    // try{
                    //     if(parseInt(liveErrorChunks.innerText) > 0){
                    //         uploadFile(recordedBlob, "recordvideo", null, liveID_2, liveKey_2, liveN_2);
                    //     }
                    // }catch(e){}
                    automaticDownload(downloadButton, "livestream");
                }
            }else{
                uploadFile(recordedBlob, "recordvideo");
                unloadWarning--;
            }
        }
    });
    if(live){
        if(localStorage.getItem("currentlocationmode") != "true" && watchPositionID){
            navigator.geolocation.clearWatch(watchPositionID);
            watchPositionID = null;
        }
        // liveN = null;
        // liveID = null;
        // liveKey = null;
        // liveN_2 = null;
        // liveID_2 = null;
        // liveKey_2 = null;
    }
    clearInterval(recordDurationInterval);
    recordDurationInterval = null;
    recordStatus.style.display = "none";
    recordDurationData = 0;
    recordDuration.innerText = '--:--:--';
    if(emergencyModeClicked){
        emergencyModeClicked = 0;
        emergencyMode();
    }
    if(afterRecorderStop == "recordvideo"){
        afterRecorderStop = null;
        recordVideo();
    }else if(afterRecorderStop == "livestream"){
        afterRecorderStop = null;
        liveStream();
    }
    buttonSetup();
}
try{
    var recordStatus = document.getElementById("recordstatus");
    var recordIcon = document.getElementById("recordicon");
    var recordDuration = document.getElementById("recordduration");
    var recordDurationData = 0;
    var recordDurationInterval;
}catch(e){}
function addZero(n){
    if(n<10){n="0"+n;}
    return n;
}
function setRecordDuration(t){
    recordDuration.innerText = addZero(Math.floor(t / 3600)) + ":" + addZero(Math.floor(t / 60) % 60) + ":" + addZero(t % 60);
}
var chunk_n = 0;
function getVideoIndexedDB(dbid, callbackFunc, key/*, keyRange*/){
    var indexedDbRequest = indexedDB.open("videos" + dbid);
    indexedDbRequest.onsuccess = function(){
        var transaction = this.result.transaction("chunks", "readonly");
        var store = transaction.objectStore("chunks");
        /*if(keyRange){
            var getRequest = store.getAll(keyRange);
        }else */if(key){
            var getRequest = store.get(key);
        }else{
            var getRequest = store.getAll();
        }
        getRequest.onsuccess = function(){
            callbackFunc(this.result, key);
        };
    };
}
var global_dbid = 0;
function startRecording(stream, live, dbid){
    if(emergencyModeClicked){
        emergencyModeClicked = 0;
        emergencyMode();
        return;
    }
    recorder = new MediaRecorder(stream);
    recorder.onstart = function(){
        recordStatus.style.backgroundColor = "#256aff40";
        recordDuration.innerText = '00:00:00';
        recordDurationInterval = setInterval(function(){
            // if(navigator.onLine || videoRecording){
                // recordDuration.innerText = ++recordDurationData;
                setRecordDuration(++recordDurationData);
            // }
        }, 1000);
        if(!live){
            recordVideoButton.disabled = 0;
        }else if(!emergencyModeEnabled){
            liveButton.disabled = 0;
        }
    };
    recorder.onstop = function(){onVideoStop(live, dbid);};
    takePhotoButton.disabled = 0;
    takePhotoDraggable.disabled = 0;
    try{
        var DB_CHUNK_N = 0;
        var indexedDbRequest = indexedDB.open("videos" + dbid);
        var store;
        indexedDbRequest.onupgradeneeded = function(){
            this.result.createObjectStore("chunks");
        };
        var db;
        indexedDbRequest.onsuccess = function(){
            db = this.result;
            // console.log(db)
            // var transaction = db.transaction("chunks", "readwrite");
            // store = transaction.objectStore("chunks");
        };
    }catch(e){}
    if(live){
        global_dbid = dbid;
        // data = [];
        recorder.ondataavailable = function(e){
            setTimeout(function(){
                if(navigator.onLine){
                    sendLiveChunk(new Blob([e.data], {type: "video/webm"}));
                    // data.push(e.data);
                    // var downloadButton = document.createElement("a");
                    // downloadButton.href = URL.createObjectURL(e.data);
                    // downloadButton.download = (new Date()).getTime();
                    // downloadButton.click();
                }else{
                    // offlineData.push(e.data);
                    if(offlineDataKeys[0]){
                        offlineDataKeys[1] = DB_CHUNK_N;
                    }else{
                        offlineDataKeys[0] = DB_CHUNK_N;
                    }
                    chunk_n++;
                }
                try{
                    var transaction = db.transaction("chunks", "readwrite");
                    store = transaction.objectStore("chunks");
                    // store.put(new Blob([e.data], {type: "video/webm"}), DB_CHUNK_N++);
                    store.put(e.data, DB_CHUNK_N++);
                }catch(e){}
            },0);
            // setTimeout(function(){
            //     data.push(e.data);
            // },0);
            // var downloadButton = document.createElement("a");
            // downloadButton.download = (new Date()).getTime() + '_' + chunk_n;
            // var objectURL = URL.createObjectURL(new Blob([e.data], {type: "video/webm"}));
            // downloadButton.href = objectURL;
            // // downloadButton.click();
            // automaticDownload(downloadButton, "livestream");
            // URL.revokeObjectURL(objectURL);
        };
        recorder.start(1000);
    }else{
        // data = [];
        recorder.ondataavailable = function(e){
            // setTimeout(function(){
            //     data.push(e.data);
            // },0);
            // data.push(e.data);
            var transaction = db.transaction("chunks", "readwrite");
            store = transaction.objectStore("chunks");
            store.put(new Blob([e.data], {type: "video/webm"}), DB_CHUNK_N++);
        };
        // recorder.start();
        recorder.start(1000);
        recordVideoButton.childNodes[0].childNodes[0].style.borderRadius = "0";
    }
}
function recordVideo(){
    // recordVideoButton.disabled = 1;
    liveButton.disabled = 1;
    // rotate.disabled = 1;
    microphoneButton.disabled = 1;
    // flashLight.disabled = 1;
    // takePhotoDraggable.disabled = 1;
    if(flashLightState){
        flashLightState = 0;
        flashLight.childNodes[0].src = "/images/flashlight0.svg";
    }
    // takePhotoButton.disabled = 1;
    // cameraStop();
    if(!videoRecording){
        unloadWarning++;
        videoRecording = 1;
        recordIcon.src = "/images/record_video.svg";
        recordIcon.classList.add("whiteicon");
        recordStatus.style.backgroundColor = "#ffff0040";
        recordStatus.style.display = "flex";
        recordStatus.title = getString("videorecording");
        var video_DB_ID = Date.now();
        videoSetup(null, video_DB_ID);
    }else{
        recordVideoButton.disabled = 1;
        videoRecording = 0;
        recorder.stop();
    }
}
recordVideoButton.addEventListener("click", function(){
    recordVideo();
});
try{
    if(geolocationSupported){
        var locationSettingsStatus = document.createElement("div");
        locationDetails.appendChild(locationSettingsStatus);
        function setLocationSettingDiv(storageName, local_div, changed){
            if(!local_div){
                local_div = document.getElementById("settingstatus"+storageName);
            }
            if(!local_div){
                return;
            }
            if(localStorage.getItem(storageName) == "true"){
                local_div.style.backgroundColor = "#00ff0080";
            }else{
                local_div.style.backgroundColor = "#ff000080";
            }
            if(changed){
                if(localStorage.getItem(storageName) == "true" && (storageName == "currentlocationmode" || storageName == "locationinitializationmode")){
                    getLocation2();
                }else if(watchPositionID){
                    navigator.geolocation.clearWatch(watchPositionID);
                    watchPositionID = null;
                }
            }
        }
        function locationModeStatusSetup(imageName, textName, storageName){
            var local_div = document.createElement("div");
            //var cachetimeoutval = '';
            /*if(storageName == "locationcachemode"){
                cachetimeoutval = '(<span id="cachetimeoutval">'+(localStorage.getItem("locationcachetimeout") / 1000)+'</span>s)';
                window.addEventListener("storage", function(){
                    locationCacheValue.innerText = localStorage.getItem("locationcachetimeout") / 1000;
                });
            }*/
            //local_div.innerHTML = '<div style="border:1px solid #256aff;text-align:center;display:inline-block;"><img width="16" height="16" src="images/'+imageName+'.svg">&nbsp;<span class="'+textName+'">'+getString(textName)+'</span>'+cachetimeoutval+'</div>';
            local_div.innerHTML = '<img class="whiteicon '+textName+'" title="'+getString(textName)+'" width="16" height="16" src="/images/'+imageName+'.svg">';
            local_div.style.display = "inline-flex";
            local_div.style.margin = "2px";
            local_div.style.padding = "2px";
            local_div.style.borderRadius = "50%";
            local_div.id = "settingstatus"+storageName;
            setLocationSettingDiv(storageName, local_div);
            window.addEventListener("storage", function(){
                setLocationSettingDiv(storageName, local_div, true);
            });
            locationSettingsStatus.appendChild(local_div);
        }
        locationModeStatusSetup("currentlocation", "currentlocation", "currentlocationmode");
        locationModeStatusSetup("locationhighaccuracy", "locationhighaccuracy", "locationhighaccuracymode");
        locationModeStatusSetup("initialization", "initiallocation", "locationinitializationmode");
        locationModeStatusSetup("cache", "locationcache", "locationcachemode");
    }
}catch(e){}
try{
    if(geolocationSupported)    {
        if(localStorage.getItem("locationinitializationmode") == "true"){
            getLocation2();
        }
    }
}catch(e){}
var offlineImg;
function whenOffline(){
    statusBox.style.backgroundColor = "#ec040040";
    if(liveStreaming){
        recordStatus.style.backgroundColor = "#ec040040";
        recordStatus.style.opacity = "0.5";
        // recorder.pause();
    }
    if(offlineImg){
        offlineImg.style.display = "block";
        return;
    }
    offlineImg = document.createElement("img");
    offlineImg.width = "32";
    offlineImg.height = "32";
    offlineImg.src = "/images/offline.svg";
    // offlineImg.style.backgroundColor = "#ffffff";
    statusBox.prepend(offlineImg);
}
window.addEventListener("offline", whenOffline);
window.addEventListener("online", function(){
    offlineImg.style.display = "none";
    statusBox.style.backgroundColor = "#256aff40";
    if(liveStreaming){
        recordStatus.style.backgroundColor = "#256aff40";
        recordStatus.style.opacity = "1";
        // recorder.resume();
        /*if(data){
            uploadFile(new Blob(data, {type: "video/webm"}), "recordvideo", null, liveID_2, liveKey_2, liveN_2);
        }*/
        // if(offlineData.length){
            // uploadFile(new Blob(offlineData, {type: "video/webm"}), "recordvideo", null, liveID_2, liveKey_2, liveN_2);
            // sendLiveChunk(new Blob(offlineData, {type: "video/webm"}), 2);
            // offlineData = [];
        // }
        // if(offlineDataKeys.length){
        //     getVideoIndexedDB(global_dbid, function(chunks){
        //         for(var i = 0; i < chunks.length; i++){
        //             sendLiveChunk(new Blob([chunks[i]], {type: "video/webm"}), 2, offlineDataKeys[0] + i);
        //         }
        //     }, null, IDBKeyRange.bound(offlineDataKeys[0], offlineDataKeys[1]));
        //     offlineDataKeys = [];
        // }
    }
    if(offlineDataKeys.length){
        for(var i = offlineDataKeys[0]; i <= offlineDataKeys[1]; i++){
            getVideoIndexedDB(global_dbid, function(chunk, key){
                sendLiveChunk(new Blob([chunk], {type: "video/webm"}), 2, key);
            }, i);
        }
        offlineDataKeys = [];
    }
});
if(!navigator.onLine){
    whenOffline();
}
function liveChunksUploaded(){
    try{
        return (liveUploadedChunks.innerText == liveTotalChunks.innerText);
    }catch(e){
        return true;
    }
}
function somethingInProgress(){
    return (unloadWarning || videoRecording || liveStreaming || !liveChunksUploaded() || locationPreUploadElements.length || locationUploadArray.length);
}
window.addEventListener("beforeunload", function(e){
    if(somethingInProgress())    {
        e.preventDefault();
        e.returnValue = '';
    }
});
try{
    var takePhotoDraggable = document.getElementById("takephotodraggable");
    var dragging;
    takePhotoDraggable.onclick = function(){
        if(!dragging){
            takePhoto();
        }
    };
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    function dragElement(elmnt) {
        elmnt.onmousedown = dragMouseDown;
        elmnt.ontouchstart = dragMouseDown;
        function dragMouseDown(e) {
            dragging = 0;
            e = e || window.event;
            try{
                if(e.changedTouches[0]){
                    e = e.changedTouches[0];
                }
            }catch(e){}
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            document.ontouchcancel = closeDragElement;
            document.ontouchend = closeDragElement;
            document.ontouchmove = elementDrag;
        }
        function elementDrag(e) {
            dragging = 1;
            elmnt.style.opacity = "0.5";
            e = e || window.event;
            try{
                if(e.changedTouches[0]){
                    e = e.changedTouches[0];
                }
            }catch(e){}
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            var topValue = (elmnt.offsetTop - pos2);
            var leftValue = (elmnt.offsetLeft - pos1);
            if(topValue < 0){
                topValue = 0;
            }else if(topValue > window.innerHeight - 72){
                topValue = window.innerHeight - 72;
            }
            if(leftValue < 0){
                leftValue = 0;
            }else if(leftValue > window.innerWidth - 72){
                leftValue = window.innerWidth - 72;
            }
            elmnt.style.top = topValue + "px";
            elmnt.style.left = leftValue + "px";
        }
        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            document.ontouchcancel = null;
            document.ontouchmove = null;
            elmnt.style.opacity = "";
        }
    }
    dragElement(takePhotoDraggable);
    if(localStorage.getItem("cameramoveabletakephotobutton") == "true"){
        takePhotoDraggable.style.display = "inline-block";
    }
    window.addEventListener("storage", function(){
        if(localStorage.getItem("cameramoveabletakephotobutton") == "true"){
            takePhotoDraggable.style.display = "inline-block";
        }else{
            takePhotoDraggable.style.display = "none";
        }
    });
}catch(e){}
try{
    var iframeOverlayDiv = document.getElementById("iframeOverlayDiv");
    var overlayIframe = document.getElementById("overlayIframe");
    function openIframeOverlay(src){
        iframeOverlayDiv.style.display = "flex";
        if(overlayIframe.src != window.location.origin+src){
            overlayIframe.src = src;
        }
    }
    var bottomButtons = document.getElementById("bottombuttons");
    var psbutton = document.getElementById("psbutton");
    psbutton.onclick = function(e){
        linkButtonClicked(e, "/app/");
    };
    var fullscreenButton = document.getElementById("fullscreen");
    fullscreenButton.onclick = function(){
        if(document.fullscreenElement){
            document.exitFullscreen();
        }else{
            document.documentElement.requestFullscreen();
        }
    };
    document.onfullscreenchange = function(){
        if(document.fullscreenElement){
            fullscreenButton.children[0].src = "/images/exitfullscreen.svg";
        }else{
            fullscreenButton.children[0].src = "/images/fullscreen.svg";
        }
    };
    fullscreenButton.disabled = 0;
    var pictureinpictureButton = document.getElementById("pictureinpicture");
    video.onplay = function(){
        pictureinpictureButton.onclick = function(){
            if(document.pictureInPictureElement){
                document.exitPictureInPicture();
            }else{
                video.requestPictureInPicture();
            }
        };
        video.addEventListener("enterpictureinpicture", function(){
            pictureinpictureButton.children[0].classList.remove("whiteicon");
        });
        video.addEventListener("leavepictureinpicture", function(){
            pictureinpictureButton.children[0].classList.add("whiteicon");
        });
        pictureinpictureButton.disabled = 0;
    };
    function setScreenOrientation(){
        if(screen.orientation.type == "portrait-primary"){
            bottomButtons.style.right = "initial";
            bottomButtons.style.left = "0";
            bottomButtons.style.bottom = "0";
            rotate.style.right = "0";
            rotate.style.left = "initial";
            flashLight.style.right = "0";
            flashLight.style.left = "initial";
            psbutton.style.right = "initial";
            psbutton.style.left = "0";
            try{
                takePhotoDraggable.style.left = "0";
                takePhotoDraggable.style.right = "initial";
            }catch(e){}
            microphoneButton.style.left = "0";
            microphoneButton.style.top = "64px";
            microphoneButton.style.right = "initial";
            microphoneButton.style.bottom = "initial";
            fullscreenButton.style.left = "0";
            fullscreenButton.style.top = "128px";
            fullscreenButton.style.right = "initial";
            fullscreenButton.style.bottom = "initial";
            pictureinpictureButton.style.left = "initial";
            pictureinpictureButton.style.top = "128px";
            pictureinpictureButton.style.right = "0";
            pictureinpictureButton.style.bottom = "initial";
        }
        else if(screen.orientation.type == "landscape-primary"){
            bottomButtons.style.left = "initial";
            bottomButtons.style.right = "0";
            rotate.style.right = "initial";
            rotate.style.left = "64px";
            flashLight.style.right = "initial";
            flashLight.style.left = "0";
            psbutton.style.right = "initial";
            psbutton.style.left = "0";
            try{
                takePhotoDraggable.style.left = "0";
                takePhotoDraggable.style.right = "initial";
            }catch(e){}
            microphoneButton.style.bottom = "0";
            microphoneButton.style.left = "64px";
            microphoneButton.style.top = "initial";
            microphoneButton.style.right = "initial";
            fullscreenButton.style.left = "128px";
            fullscreenButton.style.top = "initial";
            fullscreenButton.style.right = "initial";
            fullscreenButton.style.bottom = "0";
            pictureinpictureButton.style.left = "128px";
            pictureinpictureButton.style.top = "0";
            pictureinpictureButton.style.right = "initial";
            pictureinpictureButton.style.bottom = "initial";
        }
        else if(screen.orientation.type == "landscape-secondary"){
            bottomButtons.style.right = "initial";
            bottomButtons.style.left = "0";
            rotate.style.left = "initial";
            rotate.style.right = "64px";
            flashLight.style.left = "initial";
            flashLight.style.right = "0";
            psbutton.style.left = "initial";
            psbutton.style.right = "0";
            try{
                takePhotoDraggable.style.right = "0";
                takePhotoDraggable.style.left = "initial";
            }catch(e){}
            microphoneButton.style.bottom = "0";
            microphoneButton.style.right = "64px";
            microphoneButton.style.top = "initial";
            microphoneButton.style.left = "initial";
            fullscreenButton.style.right = "128px";
            fullscreenButton.style.top = "initial";
            fullscreenButton.style.left = "initial";
            fullscreenButton.style.bottom = "0";
            pictureinpictureButton.style.left = "initial";
            pictureinpictureButton.style.top = "0";
            pictureinpictureButton.style.right = "128px";
            pictureinpictureButton.style.bottom = "initial";
        }
        try{
            takePhotoDraggable.style.top = "calc(50% - 72px)";
        }catch(e){}
    }
    try{
        (new ScreenOrientation()).onchange = function(){
            setScreenOrientation();
            alert(13)
        };
    }catch(e){
        window.onorientationchange = function(){
            setScreenOrientation();
            alert(25)
        };
    }
    window.onload = function(){
        if(screen.orientation.type == "landscape-secondary"){
            setScreenOrientation();
        }        
    };
    window.onresize = function(){
        try{
            takePhotoDraggable.style.left = "0";
            takePhotoDraggable.style.right = "initial";
            takePhotoDraggable.style.top = "calc(50% - 72px)";
        }catch(e){}
    };
}catch(e){}
function ajax(method, url, onload, onerror, formdata, parameter1, parameter2){
    var ajax = new XMLHttpRequest();
    ajax.onload = function(){
        onload(this, parameter1, parameter2);
    };
    ajax.onerror = function(){
        onerror(this, parameter1, parameter2);
    };
    ajax.open(method, url);
    ajax.send(formdata);
}
try{
    var liveStreaming = false;
    var liveButton = document.getElementById("live");
    var liveN;
    var liveID;
    var liveKey;
    var liveN_2;
    var liveID_2;
    var liveKey_2;
    function liveSetupAjaxOnload(ajax, dbid){
        if(ajax.response.charAt(0) == '#'){
            var responseArray = ajax.responseText.substring(1).split('|');
            liveN = responseArray[0];
            liveID = responseArray[1];
            liveKey = responseArray[2];
            liveN_2 = responseArray[3];
            liveID_2 = responseArray[4];
            liveKey_2 = responseArray[5];
            chunk_n = 0;
            if(!liveStartupOfflineRecording){
                videoSetup(true, dbid);
            }else{
                liveStartupOfflineRecording = false;
            }
            var liveChunksStatus = document.createElement("div");
            liveChunksStatus.innerHTML = '<div style="background-color:#256aff80;"><span style="background-color:#00ff0080;" id="liveuploadedchunks'+liveN_2+'">0</span> / <span style="background-color:#0000ff80;" id="livetotalchunks'+liveN_2+'">0</span><br><span style="background-color:#ff000080;" id="liveerrorchunks'+liveN_2+'">0</span></div>';
            var downloadButton = createDownloadButton(null, dbid);
            // downloadButton.onclick = function(){
            //     this.href = URL.createObjectURL(new Blob(data, {type: "video/webm"}));
            // };
            var div = document.createElement("div");
            div.appendChild(liveChunksStatus);
            div.appendChild(downloadButton);
            div.appendChild(createViewButton(liveN_2));
            addStatus("live", "livestream", "00ff00", "#" + liveN_2, div);
            liveUploadedChunks = document.getElementById("liveuploadedchunks"+liveN_2);
            liveTotalChunks = document.getElementById("livetotalchunks"+liveN_2);
            liveErrorChunks = document.getElementById("liveerrorchunks"+liveN_2);
            var locationEnabledVal = localStorage.getItem("cameralivestreamlocationattach");
            if((locationEnabledVal == "true") || !locationEnabledVal){
                if(latitude != null && longitude != null && localStorage.getItem("currentlocationmode") == "true")    {
                    uploadLocation(liveN_2, liveID_2, liveKey_2, [latitude, longitude, altitude, accuracy, altitudeAccuracy, locationTime]);
                }else{
                    if(!watchPositionID && !detectingLocation){
                        getLocation2();
                    }
                }
            }
            var liveLocationEnabledVal = localStorage.getItem("cameralivestreamconstantlylocationattach");
            if((liveLocationEnabledVal == "true") || !liveLocationEnabledVal){
                // getLocation(1, localStorage.getItem("locationhighaccuracymode") == "true");
                getLocation2(1);
            }
            try{
                if((localStorage.getItem("saveuploads") == "true") || (localStorage.getItem("saveuploads") == null)){
                    var uploadsStorage = localStorage.getItem("uploads");
                    if(uploadsStorage){
                        uploadsStorage = JSON.parse(uploadsStorage);
                    }else{
                        uploadsStorage = [];
                    }
                    uploadsStorage.push([liveN_2, liveID_2, liveKey_2]);
                    localStorage.setItem("uploads", JSON.stringify(uploadsStorage));
                }
            }catch(e){}
            if(emergencyModeEnabled){
                sendEmergencyModeSignal();
            }
        }else{
            liveSetupAjaxOnerror(ajax);
        }
    }
    var liveStartupOfflineRecording;
    function liveSetupAjaxOnerror(ajax, dbid){
        liveStartupOfflineRecording = true;
        var error;
        if(ajax.Error){
            error = ajax.Error;
        }else if(ajax.response){
            error = ajax.response;
        }
        addStatus("live", "livestream", "ff0000", error);
        /*if(emergencyModeEnabled){
            var onlineFunc = function(){
                window.removeEventListener("online", onlineFunc);
                liveSetup();
            };
            window.addEventListener("online", onlineFunc);
        }else{
            liveStreaming = false;
            recordStatus.style.display = "none";
            cameraStart();
        }*/
        liveN = null;
        liveID = null;
        liveKey = null;
        liveN_2 = null;
        liveID_2 = null;
        liveKey_2 = null;
        videoSetup(true, dbid);
        var onlineFunc = function(){
            window.removeEventListener("online", onlineFunc);
            if(liveStartupOfflineRecording){
                liveSetup();
            }
        };
        window.addEventListener("online", onlineFunc);
        var downloadButton = createDownloadButton(null, dbid);
        // downloadButton.onclick = function(){
        //     this.href = URL.createObjectURL(new Blob(data, {type: "video/webm"}));
        // };
        addStatus("live", "livestream", "ff8000", null, downloadButton);
        recordStatus.style.backgroundColor = "#ec040040";
        recordStatus.style.opacity = "0.5";
    }
    function liveSetup(){
        var video_DB_ID = Date.now();
        addStatus("live", "livestream", "ffff00");
        ajax("GET", "/?live=1&setup=1", liveSetupAjaxOnload, liveSetupAjaxOnerror, null, video_DB_ID);
    }
    var liveUploadedChunks;
    var liveTotalChunks;
    var liveErrorChunks;
    var liveChunksValueSpan = document.getElementById("livechunksvalue");
    var liveChunkStatus = document.getElementById("livechunkstatus");
    function liveUploadedChunksValue(){
        // liveChunksValueSpan.innerText = ((parseInt(liveUploadedChunks.innerText) / parseInt(liveTotalChunks.innerText)) * 100).toFixed(2);
        liveChunksValueSpan.innerText = liveUploadedChunks.innerText + " / " + liveTotalChunks.innerText;
        if(!liveStreaming && liveChunksUploaded()){
            setTimeout(function(){
                liveChunkStatus.style.display = "none";
                liveChunksValueSpan.innerText = '';
            }, 1000);
        }
    }
    function sendLiveChunkAjaxOnload(ajax, chunk){
        setTimeout(function(){
            if(ajax.response == "1"){
                liveUploadedChunks.innerText = parseInt(liveUploadedChunks.innerText) + 1;
                liveUploadedChunksValue();
            }else{
                sendLiveChunkAjaxOnerror(ajax, chunk);
            }
        },0);
    }
    function sendLiveChunkAjaxOnerror(ajax, chunk, chunkN){
        setTimeout(function(){
            liveErrorChunks.innerText = parseInt(liveErrorChunks.innerText) + 1;
            liveUploadedChunksValue();
            var retryButton = document.createElement("button");
            retryButton.innerHTML = '<img class="whiteicon" width="32" height="32" src="/images/retry.svg">';
            retryButton.onclick = function(){
                // uploadFile(new Blob([chunk], {type: "video/webm"}), "recordvideo", null, liveID_2, liveKey_2, liveN_2);
                sendLiveChunk(new Blob([chunk], {type: "video/webm"}), 1, chunkN);
            };
            retryButton.classList.add("buttons");
            addStatus("video", "video", "ff0000", "#" + [liveN_2, ajax.Error, ajax.response], retryButton);
            var onlineFunc = function(){window.removeEventListener("online", onlineFunc);sendLiveChunk(new Blob([chunk], {type: "video/webm"}), 1, chunkN);};
            window.addEventListener("online", onlineFunc);
        },0);
    }
    function sendLiveChunk(chunk, additionalinfo, local_chunk_n){
        var formData = new FormData();
        formData.append("id", liveID);
        formData.append("key", liveKey);
        formData.append("chunk", chunk);
        if(local_chunk_n){
            formData.append("chunk_n", local_chunk_n);
        }else{
            formData.append("chunk_n", chunk_n++);
        }
        if(additionalinfo){
            formData.append("additionalinfo", additionalinfo);   
        }
        liveTotalChunks.innerText = parseInt(liveTotalChunks.innerText) + 1;
        ajax("POST", "/?live=1", sendLiveChunkAjaxOnload, sendLiveChunkAjaxOnerror, formData, chunk, chunk_n - 1);
        liveUploadedChunksValue();
    }
    function liveStream(){
        // liveButton.disabled = 1;
        recordVideoButton.disabled = 1;
        // rotate.disabled = 1;
        microphoneButton.disabled = 1;
        // flashLight.disabled = 1;
        // takePhotoDraggable.disabled = 1;
        if(flashLightState){
            flashLightState = 0;
            flashLight.childNodes[0].src = "/images/flashlight0.svg";
        }
        // takePhotoButton.disabled = 1;
        // cameraStop();
        if(!liveStreaming){
            liveStreaming = true;
            recordIcon.src = "/images/live.svg";
            recordIcon.classList.remove("whiteicon");
            recordStatus.style.backgroundColor = "#ffff0040";
            recordStatus.style.display = "flex";
            recordStatus.title = getString("livestreaming");
            liveChunkStatus.style.display = "flex";
            liveSetup();
        }else{
            liveButton.disabled = 1;
            recorder.stop();
            liveStreaming = false;
            // cameraStart();
        }
    }
    liveButton.onclick = function(){
        liveStream();
    };
}catch(e){}
function sendEmergencyModeSignalOnerror(ajax){
    var retryButton = document.createElement("button");
    retryButton.innerHTML = '<img class="whiteicon" width="32" height="32" src="/images/retry.svg">';
    retryButton.onclick = function(){
        sendEmergencyModeSignal();
    };
    retryButton.classList.add("buttons");
    addStatus("emergency", "emergencymode", "ff0000", "#" + [liveN_2, ajax.Error], retryButton);
    var onlineFunc = function(){window.removeEventListener("online", onlineFunc);sendEmergencyModeSignal();};
    window.addEventListener("online", onlineFunc);
}
function sendEmergencyModeSignal(){
    unloadWarning++;
    addStatus("emergency", "emergencymode", "ffff00", "#" + liveN_2);
    var ajax = new XMLHttpRequest();
    ajax.onload = function(){
        if(this.response == "1"){
            addStatus("emergency", "emergencymode", "00ff00", "#" + liveN_2);
        }else{
            sendEmergencyModeSignalOnerror(this);
        }
        unloadWarning--;
    };
    ajax.onerror = function(){
        sendEmergencyModeSignalOnerror(this);
    };
    ajax.open("POST", "/");
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajax.send("id="+encodeURIComponent(liveID_2)+"&key="+encodeURIComponent(liveKey_2)+"&emergencymode=1");
}
var emergencyModeEnabled;
var emergencyModeClicked;
var psbutton2 = document.getElementById("psbutton2");
psbutton2.onclick = function(e){
    e.stopPropagation();
};
function emergencyMode(){
    unloadWarning++;
    liveButton.disabled = 1;
    recordVideoButton.disabled = 1;
    // psbutton.onclick = function(e){
    //     e.preventDefault();
    // };
    // psbutton.classList.add("disabled");
    psbutton2.classList.add("disabled");
    overlayIframe.sandbox = "allow-same-origin allow-scripts";
    emergencyModeButton.disabled = 1;
    if(videoRecording){
        emergencyModeClicked = 1;
        // recordVideo();
        videoRecording = 0;
        recorder.stop();
        return;
    }
    emergencyModeEnabled = 1;
    if(liveStreaming){
        sendEmergencyModeSignal();
    }else{
        liveStream();
    }
    emergencyModeButton.style.opacity = "1";
    setInterval(function(){
        if(emergencyModeButton.style.display != "none"){
            emergencyModeButton.style.display = "none";
        }else{
            emergencyModeButton.style.display = "flex";
        }
    },500);
}
try{
    var emergencyModeButton = document.getElementById("emergencymode");
    if(localStorage.getItem("cameraemergencymode") == "true"){
        emergencyModeButton.onclick = function(){
            emergencyMode();
        };
        emergencyModeButton.style.display = "flex";
    }
    window.addEventListener("storage", function(){
        if(localStorage.getItem("cameraemergencymode") == "true"){
            emergencyModeButton.onclick = function(){
                emergencyMode();
            };
            emergencyModeButton.style.display = "flex";
        }else{
            emergencyModeButton.style.display = "none";
            emergencyModeButton.onclick = null;
        }
    });
}catch(e){}
/*if(localStorage.getItem("directrecordvideo") == "true" && urlParams.get("recordvideo") == 1){
    // recordVideoButton.click();
    recordVideo();
}else if(localStorage.getItem("directlivestream") == "true" && urlParams.get("livestream") == 1){
    // liveButton.click();
    liveStream();
}else if(localStorage.getItem("directemergencymode") == "true" && urlParams.get("emergencymode") == 1){
    emergencyMode();
}else{
    cameraStart();
}*/
cameraStart();
if(localStorage.getItem("directrecordvideo") == "true" && urlParams.get("recordvideo") == 1){
    recordVideo();
}else if(localStorage.getItem("directlivestream") == "true" && urlParams.get("livestream") == 1){
    liveStream();
}else if(localStorage.getItem("directemergencymode") == "true" && urlParams.get("emergencymode") == 1){
    emergencyMode();
}
// cameraStart();
try{
    document.documentElement.onclick = function(){
        if(localStorage.getItem("camerafullscreenonclick") == "true"){
            this.requestFullscreen();
        }
    };
    var onlyVideo;
    video.onclick = function(){
        if(localStorage.getItem("cameravideoonlyonclick") == "true"){
            onlyVideo = !onlyVideo;
            /*if(onlyVideo){
                var display = "none";
            }else{
                var display = "flex";
            }
            var elements = document.querySelectorAll(".buttons,#statusBox,#recordstatus");
            for(var i = 0; i < elements.length; i++){
                if(elements[i].id == "recordstatus" && display == "flex" && recordDurationInterval){
                    elements[i].style.display = display;
                }else{
                    elements[i].style.display = display;
                }
            }*/
            if(onlyVideo){
                this.style.zIndex = "10";
            }else{
                this.style.zIndex = "initial";
            }
        }
        if(localStorage.getItem("cameratakephotoonvideoclick") == "true"){
            takePhoto();
        }
    };
    var blackscreenOverlay = document.createElement("div");
    blackscreenOverlay.style.position = "absolute";
    blackscreenOverlay.style.top = "0";
    blackscreenOverlay.style.left = "0";
    blackscreenOverlay.style.width = "100vw";
    blackscreenOverlay.style.height = "100vh";
    blackscreenOverlay.style.backgroundColor = "#000000";
    blackscreenOverlay.style.zIndex = "2";
    blackscreenOverlay.style.display = "none";
    document.body.appendChild(blackscreenOverlay);
    var blackscreenOverlayEnabled;
    function blackscreenfunc(){
        blackscreenOverlayEnabled = !blackscreenOverlayEnabled;
        if(blackscreenOverlayEnabled){
            blackscreenOverlay.style.display = "none";
        }else{
            blackscreenOverlay.style.display = "block";
        }
    }
    video.ondblclick = function(){
        if(localStorage.getItem("camerablackscreenondblclick") == "true"){
            blackscreenfunc();
        }
    };
    blackscreenOverlay.ondblclick = function(){blackscreenfunc();};
}catch(e){}
var strings;
function getString(key)  {
    if(strings && strings[key])return strings[key];
    return "!"+key;
}
function setLanguage(lang,get)  {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "/json/languages/main/" + lang + ".json");
    ajax.onload = function()    {
        if(this.status == 200){
            document.documentElement.lang = lang;
            strings = JSON.parse(this.responseText);
            for(var key in strings) {
                var elements = document.getElementsByClassName(key);
                if(elements!=null){
                    for(var element in elements){
                        if(elements[element]!=null){
                            if(elements[element].title && elements[element].title.indexOf("!") == -1){
                                elements[element].title+=" | "+strings[key];
                            }else{
                                elements[element].title=strings[key];
                            }
                        };
                    }
                }
            }
            if(urlParams.get("recordvideo") == 1){
                var directName = "recordvideo";
            }else if(urlParams.get("livestream") == 1){
                var directName = "livestream";
            }else if(urlParams.get("emergencymode") == 1){
                var directName = "emergencymode";
            }
            if(directName){
                document.title = getString(directName) + " | " + getString("camera") + " | " + getString("title");
            }
        }
        else{
            var getlang = (new URL(window.location.href)).searchParams.get("lang");
            if(getlang != null && get != 1){
                lang = getlang;
                setLanguage(lang,1);
            }else if(lang != "en"){
                lang = "en";
                setLanguage(lang);
            }
        }
    };
    ajax.send();
}
var lang = localStorage.getItem("lang");
if(lang == null){
    lang = navigator.language;
    lang = lang.substring(0, 2);
}
setLanguage(lang);
try{
    if(urlParams.get("recordvideo") == 1){
        var directImage = "/images/recordvideops.svg";
    }else if(urlParams.get("livestream") == 1){
        var directImage = "/images/livestreamps.svg";
    }
    else if(urlParams.get("emergencymode") == 1){
        var directImage = "/images/emergencymodeps.svg";
    }
    if(directImage){
        document.getElementById("favicon").href = directImage;
    }
}catch(e){}
try{
    /*if(!localStorage.getItem("mobilewebappmodecamera")){
        localStorage.setItem("mobilewebappmodecamera", true);
    }*/
    if(localStorage.getItem("mobilewebappmodecamera") == "true"){
        var metaApp = document.createElement("meta");
        metaApp.name = "mobile-web-app-capable";
        metaApp.content = "yes";
        document.head.appendChild(metaApp);
    }
}catch(e){}
try{
    // var onfocusDirectActionEnabled;
    // window.ondeviceorientation = function(e){
    //     onfocusDirectActionEnabled = (Math.abs(e.beta) > 30);
    // };
    // window.onfocus = function(){
    //     if(onfocusDirectActionEnabled){
    //         if(!emergencyModeEnabled){
    //             emergencyMode();
    //         }
    //     }
    // };
    var onfocusDiv;
    function createOnFocusDivFunc(){
        if(!onfocusDiv){
            if(localStorage.getItem("camerawindowonfocusactions") == "true"){
                onfocusDiv = document.createElement("div");
                onfocusDiv.classList.add("statusValueBoxes");
                onfocusDiv.style.left = "25%";
                onfocusDiv.style.right = "25%";
                onfocusDiv.style.width = "50%";
                onfocusDiv.style.top = "80px";
                onfocusDiv.style.display = "flex";
                function createOnfocusButton(name){
                    var btn = document.createElement("button");
                    btn.innerHTML = '<img width="32" height="32" class="whiteicon" src="/images/'+name+'.svg">';
                    btn.classList.add("buttons");
                    btn.style.display = "flex";
                    btn.setAttribute("storagename", name);
                    if(localStorage.getItem("camerawindowonfocusbutton"+name) == "1"){
                        btn.style.backgroundColor = "#00ff0080";
                    }else{
                        btn.style.backgroundColor = "#ff000080";
                    }
                    btn.onclick = function(){
                        if(localStorage.getItem("camerawindowonfocusbutton"+name) == "1"){
                            btn.style.backgroundColor = "#ff000080";
                            localStorage.setItem("camerawindowonfocusbutton"+name, "0");
                        }else{
                            btn.style.backgroundColor = "#00ff0080";
                            localStorage.setItem("camerawindowonfocusbutton"+name, "1");
                        }
                        var buttons = btn.parentNode.children;
                        for(var i = 0; i < buttons.length; i++){
                            if(buttons[i] != this){
                                buttons[i].style.backgroundColor = "#ff000080";
                                localStorage.setItem("camerawindowonfocusbutton"+buttons[i].getAttribute("storagename"), "0");
                            }
                        }
                    };
                    onfocusDiv.appendChild(btn);
                }
                createOnfocusButton("record_video");
                createOnfocusButton("live");
                createOnfocusButton("emergency");
                document.getElementById("camera").appendChild(onfocusDiv);
                window.addEventListener("focus", function(){
                    if(videoRecording || liveStreaming || emergencyModeEnabled || emergencyModeClicked){
                        return;
                    }
                    if(localStorage.getItem("camerawindowonfocusbuttonrecord_video") == "1"){
                        recordVideo();
                    }else if(localStorage.getItem("camerawindowonfocusbuttonlive") == "1"){
                        liveStream();
                    }else if(localStorage.getItem("camerawindowonfocusbuttonemergency") == "1"){
                        emergencyMode();
                    }
                });
            }
        }
    }
    createOnFocusDivFunc();
    window.addEventListener("storage", function(){
        if(localStorage.getItem("camerawindowonfocusactions") == "true"){
            createOnFocusDivFunc();
            onfocusDiv.style.display = "flex";
        }else{
            onfocusDiv.style.display = "none";
        }
    });
}catch(e){}
try{
    iframeOverlayDiv.style.position = "absolute";
    iframeOverlayDiv.style.width = "100%";
    iframeOverlayDiv.style.height = "100%";
    iframeOverlayDiv.style.flexDirection = "column";
    iframeOverlayDiv.style.zIndex = "3";
    iframeOverlayDiv.children[0].style.display = "flex";
    iframeOverlayDiv.children[0].style.backgroundColor = "#256aff80";
    iframeOverlayDiv.children[0].style.justifyContent = "center";
    iframeOverlayDiv.children[0].style.padding = "1px";
    iframeOverlayDiv.children[0].onclick = function(){
        iframeOverlayDiv.style.display = "none";
    };
    overlayIframe.style.backgroundColor = "#fff";
    overlayIframe.style.width = "100%";
    overlayIframe.style.height = "100%";
    overlayIframe.style.border = "none";
}catch(e){}
try{
    if("serviceWorker" in navigator){
        navigator.serviceWorker.register("/app/offlineserviceworker.js");
    }
}catch(e){}