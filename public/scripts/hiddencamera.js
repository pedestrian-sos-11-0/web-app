var video = document.getElementById("video");
var screenDiv = document.getElementById("screen");
var backgroundImageSetup;
function backgroundImageSetupIfNot(){
    if(!backgroundImageSetup){
        backgroundImageSetup = 1;
        screenDiv.style.backgroundRepeat = "no-repeat";
        screenDiv.style.backgroundPosition = "center";
        screenDiv.style.backgroundSize = "contain";
    }
}
function backgroundImageFunc(name){
    var backgroundImageStorage = localStorage.getItem("hiddencamerabackgroundimage" + name);
    if(backgroundImageStorage){
        screenDiv.style.backgroundImage = 'url("' + backgroundImageStorage + '")';
        backgroundImageSetupIfNot();
    }
}
backgroundImageFunc("");
backgroundImageFunc("cameranotready");
var cameraNotReadyColor = localStorage.getItem("hiddencameracameranotreadycolor");
if(cameraNotReadyColor){
    screenDiv.style.backgroundColor = cameraNotReadyColor;
}
var cameraReady;
var mode = (new URL(window.location.href)).searchParams.get("mode");
var enabled;
if(
    (mode == "takephoto" && localStorage.getItem("takephotohiddencamera") == "true")
    ||
    (mode == "recordvideo" && localStorage.getItem("recordvideohiddencamera") == "true")
    ||
    (mode == "livestream" && localStorage.getItem("livestreamhiddencamera") == "true")
    ){
    enabled = 1;
}
var fullscreen = document.getElementById("fullscreen");
fullscreen.onclick = function(){
    document.documentElement.requestFullscreen();
};
if(localStorage.getItem("hiddencamerafullscreenbutton") == "true"){
    fullscreen.style.display = "initial";
}
document.onfullscreenchange = function(){
    if(fullscreen.style.display == "none"){
        fullscreen.style.display = "initial";
    }else{
        fullscreen.style.display = "none";
    }
};
function cameraSetup(stream){
    video.srcObject = stream;
}
var cameraReadyColor = localStorage.getItem("hiddencameracamerareadycolor");
if(!cameraReadyColor){
    cameraReadyColor = "#000";
}
var onplaySetup;
var afterCameraPrepare;
video.onplay = function(){
    cameraReady = 1;
    if(afterCameraPrepare == "recordvideo"){
        afterCameraPrepare = null;
        videoSetup();
    }else if(afterCameraPrepare == "livestream"){
        afterCameraPrepare = null;
        videoSetup(true);
    }
    if(!onplaySetup){
        onplaySetup = 1;
        screenDiv.style.backgroundColor = cameraReadyColor;
        backgroundImageFunc("cameraready");
    }
};
var cameraFacing;
var cameraFacingStorage = localStorage.getItem("hiddencamerafacingmode");
if(cameraFacingStorage){
    cameraFacing = cameraFacingStorage;
}else{
    cameraFacing = "environment";
}
function cameraStart(){
    navigator.mediaDevices.getUserMedia({
        // audio: false,
        audio: true,
        video: {
            width: {ideal: 1920},
            height: {ideal: 1080},
            facingMode: cameraFacing
        }
    })
    .then(function(stream){cameraSetup(stream)});
}
function cameraStop(){
    if(!video.srcObject){
        return;
    }
    video.srcObject.getTracks().forEach(function(track){
        track.stop();
    });
    video.srcObject = null;
}
var canvas = document.getElementById("canvas");
function takePhoto(){
    beforeUnloadWarning++;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    canvas.toBlob(function(blob){
        uploadFile(blob, "takephoto");
        beforeUnloadWarning--;
    });
}
var videoRecording;
var recorder;
var data;
function onVideoStop(live){
    var recordedBlob = new Blob(data, {type: "video/webm"});
    // if(!live){
    //     /*if(recordedBlob == ""){
    //         cameraStop();
    //     }
    //     cameraStart();*/
    // }
    if(recordedBlob != ""){
        if(live){
            if(liveErrorChunks > 0){
                uploadFile(recordedBlob, "recordvideo", liveID_2, liveKey_2);
            }
            automaticDownload(recordedBlob, "livestream");
        }else{
            uploadFile(recordedBlob, "recordvideo");
            beforeUnloadWarning--;
        }
    }
    if(live){
        if(localStorage.getItem("currentlocationmode") != "true" && watchPositionID){
            navigator.geolocation.clearWatch(watchPositionID);
            watchPositionID = null;
        }
    }
}
var colorfulindicatorEnabled = localStorage.getItem("hiddencameracolorfulindicator") == "true";
if(colorfulindicatorEnabled){
    var colorfulindicatorSize = localStorage.getItem("hiddencameracolorfulindicatorsize");
    if(!colorfulindicatorSize){
        colorfulindicatorSize = 1;
    }
    var colorfulindicator_recordingstarted = "#000040";
    var colorfulindicator_uploading = "#404000";
    var colorfulindicator_uploaded = "#004000";
    var colorfulindicator_error = "#400000";
    var storageValue = localStorage.getItem("hiddencameracolorfulindicatorrecordingstarted");
    if(storageValue){
        colorfulindicator_recordingstarted = storageValue;
    }
    storageValue = localStorage.getItem("hiddencameracolorfulindicatoruploading");
    if(storageValue){
        colorfulindicator_uploading = storageValue;
    }
    storageValue = localStorage.getItem("hiddencameracolorfulindicatoruploaded");
    if(storageValue){
        colorfulindicator_uploaded = storageValue;
    }
    storageValue = localStorage.getItem("hiddencameracolorfulindicatorerror");
    if(storageValue){
        colorfulindicator_error = storageValue;
    }
    var colorfulindicatorDiv = document.getElementById("colorfulindicator");
    colorfulindicatorDiv.style.height = colorfulindicatorSize + "%";
    colorfulindicatorDiv.style.display = "block";
}
function colorfulIndicatorFunc(color){
    if(colorfulindicatorEnabled){
        colorfulindicatorDiv.style.backgroundColor = color;
    }
}
var vibrationEnabled = localStorage.getItem("hiddencameravibration") == "true";
if(vibrationEnabled){
    var vibration_recordingstarted = 50;
    var vibration_uploading = 50;
    var vibration_uploaded = 100;
    var vibration_error = 150;
    storageValue = localStorage.getItem("hiddencameravibrationrecordingstarted");
    if(storageValue){
        vibration_recordingstarted = storageValue;
    }
    storageValue = localStorage.getItem("hiddencameravibrationuploading");
    if(storageValue){
        vibration_uploading = storageValue;
    }
    storageValue = localStorage.getItem("hiddencameravibrationuploaded");
    if(storageValue){
        vibration_uploaded = storageValue;
    }
    storageValue = localStorage.getItem("hiddencameravibrationerror");
    if(storageValue){
        vibration_error = storageValue;
    }
}
function vibrationFunc(t){
    if(vibrationEnabled){
        navigator.vibrate(t);
    }
}
function startRecording(stream, live){
    recorder = new MediaRecorder(stream);
    recorder.onstop = function(){onVideoStop(live);};
    recorder.onstart = function(){
        colorfulIndicatorFunc(colorfulindicator_recordingstarted);
        vibrationFunc(vibration_recordingstarted);
        backgroundImageFunc("recordingstarted");
    };
    if(live){
        data = [];
        recorder.ondataavailable = function(e){
            if(navigator.onLine){
                sendLiveChunk(new Blob([e.data], {type: "video/webm"}));
            }
            data.push(e.data);
        };
        recorder.start(1000);
    }else{
        data = [];
        recorder.ondataavailable = function(e){data.push(e.data);};
        recorder.start();
    }
}
function videoSetup(live){
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
    if(!cameraReady){
        if(live){
            afterCameraPrepare = "livestream";
        }else{
            afterCameraPrepare = "recordvideo";
        }
        return;
    }
    startRecording(video.captureStream(), live);
}
function recordVideo(){
    // cameraReady = 0;
    // cameraStop();
    if(!videoRecording){
        beforeUnloadWarning++;
        videoRecording = 1;
        videoSetup();
    }else{
        videoRecording = 0;
        recorder.stop();
    }
}
function ajax(method, url, onload, onerror, formdata){
    var ajax = new XMLHttpRequest();
    ajax.onload = function(){
        onload(this);
    };
    ajax.onerror = function(){
        onerror(this);
    };
    ajax.open(method, url);
    ajax.send(formdata);
}
var liveStreaming = false;
var liveN;
var liveID;
var liveKey;
var liveN_2;
var liveID_2;
var liveKey_2;
function liveSetupAjaxOnload(ajax){
    if(ajax.response.charAt(0) == '#'){
        var responseArray = ajax.responseText.substring(1).split('|');
        liveN = responseArray[0];
        liveID = responseArray[1];
        liveKey = responseArray[2];
        liveN_2 = responseArray[3];
        liveID_2 = responseArray[4];
        liveKey_2 = responseArray[5];
        videoSetup(true);
        var locationEnabledVal = localStorage.getItem("hiddencameralivestreamlocationattach");
        if((locationEnabledVal == "true") || !locationEnabledVal){
            if(latitude != null && longitude != null && localStorage.getItem("currentlocationmode") == "true")    {
                uploadLocation(liveN_2, liveID_2, liveKey_2, [latitude, longitude, altitude, accuracy, altitudeAccuracy]);
            }else{
                if(!watchPositionID && !detectingLocation){
                    getLocation2();
                }
            }
        }
        var liveLocationEnabledVal = localStorage.getItem("hiddencameralivestreamconstantlylocationattach");
        if((liveLocationEnabledVal == "true") || !liveLocationEnabledVal){
            getLocation2(1);
        }
    }else{
        liveSetupAjaxOnerror(ajax);
    }
}
function liveSetupAjaxOnerror(ajax){
    liveStreaming = false;
    // cameraStart();
    errorIndicator();
}
function liveSetup(){
    ajax("GET", "../?live=1&setup=1", liveSetupAjaxOnload, liveSetupAjaxOnerror);
}
var liveUploadedChunks;
var liveTotalChunks;
var liveErrorChunks;
function sendLiveChunkAjaxOnload(ajax){
    if(ajax.response == "1"){
        liveUploadedChunks++;
        if(!liveStreaming && liveUploadedChunks == liveTotalChunks){
            uploadedIndicator();
        }
    }else{
        sendLiveChunkAjaxOnerror(ajax);
    }
}
function sendLiveChunkAjaxOnerror(ajax){
    liveErrorChunks++;
    errorIndicator();
}
function sendLiveChunk(chunk){
    var formData = new FormData();
    formData.append("id", liveID);
    formData.append("key", liveKey);
    formData.append("chunk", chunk);
    liveTotalChunks++;
    ajax("POST", "../?live=1", sendLiveChunkAjaxOnload, sendLiveChunkAjaxOnerror, formData);
}
function liveStream(){
    // cameraStop();
    if(!liveStreaming){
        liveStreaming = true;
        liveUploadedChunks = 0;
        liveTotalChunks = 0;
        liveErrorChunks = 0;
        liveSetup();
    }else{
        liveStreaming = false;
        recorder.stop();
        // cameraStart();
    }
}
function liveChunksUploaded(){
    try{
        return (liveUploadedChunks == liveTotalChunks);
    }catch(e){
        return true;
    }
}
function addOnlineFunction(onlineCallbackFunction){
    var onlineFunc = function(){
        window.removeEventListener("online", onlineFunc);
        uploadingIndicator();
        onlineCallbackFunction();
    };
    window.addEventListener("online", onlineFunc);
}
var beforeUnloadWarning = 0;
var latitude;
var longitude;
var altitude;
var accuracy;
var altitudeAccuracy;
// var locationTime;
var geolocationSupported;
try{
    function setStorageIfNot(local_name, local_value){
        if(!localStorage.getItem(local_name)){
            localStorage.setItem(local_name, local_value);
        }
    }
    if(navigator.geolocation){
        geolocationSupported = true;
        try{
            setStorageIfNot("locationhighaccuracymode", true);
            setStorageIfNot("locationcachemode", true);
            setStorageIfNot("locationcachetimeout", 1000);
        }catch(e){}
    }else{
        
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
    // locationTime = position.timestamp;
    var locationCoordinatesArray = [latitude, longitude, altitude, accuracy, altitudeAccuracy];
    if(locationUploadArray.length > 0){
        for(var key in locationUploadArray){
            uploadLocation(locationUploadArray[key][0], locationUploadArray[key][1], locationUploadArray[key][2], locationCoordinatesArray);
            locationUploadArray.shift();
        }
    }
    if(locationPreUploadElements.length > 0){
        for(var key in locationPreUploadElements){
            preUpload(locationCoordinates, locationPreUploadElements[key][0], locationCoordinatesArray, locationPreUploadElements[key][1]);
            locationPreUploadElements.shift();
        }
    }
    try{
        localStorage.setItem("locationallowed", "true");
    }catch(e){}
    var locationEnabledVal = localStorage.getItem("cameralivestreamlocationattach");
    var liveLocationEnabledVal = localStorage.getItem("cameralivestreamconstantlylocationattach");
    if((((locationEnabledVal == "true") || !locationEnabledVal) || ((liveLocationEnabledVal == "true") || !liveLocationEnabledVal)) && liveStreaming && liveN_2){
        uploadLocation(liveN_2, liveID_2, liveKey_2, locationCoordinatesArray);
    }
}
function locationError(error){
    detectingLocation = false;
    try{
        if((error.code != error.PERMISSION_DENIED) || (localStorage.getItem("locationallowed") == "true")){
            setTimeout(getLocation, 250);
        }
    }catch(e){
        setTimeout(getLocation, 250);
    }
}
var lastUploadID = 0;
var locationCoordinates = [];
var locationPreUploadElements = [];
function preUpload(array, id, value){
    array[id] = value;
}
var locationUploadArray = [];
function uploadLocation(n, id, key, coordinates, previouslyError){
    if(!previouslyError){
        beforeUnloadWarning++;
    }
    uploadingIndicator();
    var ajax = new XMLHttpRequest();
    ajax.open("POST", "../");
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajax.onload = function(){
        if(ajax.responseText === "1"){
            uploadedIndicator();
            beforeUnloadWarning--;
        }else{
            errorIndicator();
        }
    };
    ajax.onerror = function(){
        addOnlineFunction(function(){uploadLocation(n, id, key, coordinates, true);});
        errorIndicator();
    };
    ajax.send("id="+encodeURIComponent(id)+"&key="+encodeURIComponent(key)+"&latitude="+encodeURIComponent(coordinates[0])+"&longitude="+encodeURIComponent(coordinates[1])+"&altitude="+encodeURIComponent(coordinates[2])+"&accuracy="+encodeURIComponent(coordinates[3])+"&altitudeaccuracy="+encodeURIComponent(coordinates[4]));
}
function uploadFile(file, cameraMode, id, key, id0){
    if(!id0){
        beforeUnloadWarning++;
        automaticDownload(file, cameraMode);
    }
    var currentUploadID = ++lastUploadID;
    var locationEnabledVal = localStorage.getItem("hiddencamera" + cameraMode + "locationattach");
    var locationUploadEnabled = ((locationEnabledVal == "true") || !locationEnabledVal);
    if(id0){
        if(locationCoordinates[id0]){
            preUpload(locationCoordinates, currentUploadID, locationCoordinates[id0]);
        }
    }else if(locationUploadEnabled){
        if(latitude != null && longitude != null && localStorage.getItem("currentlocationmode") == "true")    {
            preUpload(locationCoordinates, currentUploadID, [latitude, longitude, altitude, accuracy, altitudeAccuracy]);
        }else{
            if(!watchPositionID && !detectingLocation){
                getLocation2();
            }
            locationPreUploadElements.push(currentUploadID);
        }
    }
    var ajax = new XMLHttpRequest();
    ajax.onload = function(){
        if(this.responseText.charAt(0) == '#'){
            var responseArray = this.responseText.substring(1).split('|');
            var n = responseArray[0];
            var id = responseArray[1];
            var key = responseArray[2];
            if(locationCoordinates[currentUploadID]){
                uploadLocation(n, id, key, locationCoordinates[currentUploadID]);
            }else{
                if(!watchPositionID && !detectingLocation){
                    getLocation2();
                }
                locationUploadArray.push([n, id, key]);
            }
            try{
                if((localStorage.getItem("saveuploads") == "true") || (localStorage.getItem("saveuploads") == null)){
                    var uploadsStorage = localStorage.getItem("uploads");
                    if(uploadsStorage){
                        uploadsStorage = JSON.parse(uploadsStorage);
                    }else{
                        uploadsStorage = [];
                    }
                    uploadsStorage.push([n, id, key]);
                    localStorage.setItem("uploads", JSON.stringify(uploadsStorage));
                }
            }catch(e){}
            uploadedIndicator();
            beforeUnloadWarning--;
        }else{
            uploadFileOnerror(file, cameraMode, id, key, currentUploadID);
        }
    };
    ajax.onerror = function(){
        uploadFileOnerror(file, cameraMode, id, key, currentUploadID);
    };
    ajax.open("POST", "/");
    var formData = new FormData();
    formData.append("photovideo", file);
    if(id && key){
        formData.append("id", id);
        formData.append("key", key);
    }
    ajax.send(formData);
}
function uploadFileOnerror(file, cameraMode, id, key, id0){
    errorIndicator();
    addOnlineFunction(function(){uploadFile(file, cameraMode, id, key, id0);});
}
try{
    if(geolocationSupported)    {
        if(localStorage.getItem("locationinitializationmode") == "true"){
            getLocation2();
        }
    }
}catch(e){}
window.addEventListener("online", function(){
    if(liveStreaming && data){
        uploadingIndicator();
        uploadFile(new Blob(data, {type: "video/webm"}), "recordvideo", liveID_2, liveKey_2);
    }
});
window.addEventListener("beforeunload", function(e){
    if(beforeUnloadWarning || videoRecording || liveStreaming || !liveChunksUploaded() || locationPreUploadElements.length || locationUploadArray.length){
        e.preventDefault();
        e.returnValue = '';
    }
});
function uploadingIndicator(){
    colorfulIndicatorFunc(colorfulindicator_uploading);
    vibrationFunc(vibration_uploading);
    backgroundImageFunc("uploading");
}
function uploadedIndicator(){
    colorfulIndicatorFunc(colorfulindicator_uploaded);
    vibrationFunc(vibration_uploaded);
    backgroundImageFunc("uploaded");
}
function errorIndicator(){

}
function automaticDownload(file, cameraMode){
    try{
        var automaticdownloadEnabledVal = localStorage.getItem("hiddencamera" + cameraMode + "automaticdownload");
        if((automaticdownloadEnabledVal == "true") || !automaticdownloadEnabledVal){
            var downloadButton = document.createElement("a");
            if(file){
                downloadButton.href = URL.createObjectURL(file);
            }
            downloadButton.download = (new Date()).getTime();
            downloadButton.click();
        }
    }catch(e){}
}
if(enabled){
    screenDiv.onclick = function(){
        if(!cameraReady){
            return;
        }
        uploadingIndicator();
        if(mode == "takephoto"){
            takePhoto();
        }else if(mode == "recordvideo"){
            recordVideo();
        }else if(mode == "livestream"){
            liveStream();
        }
        if(localStorage.getItem("hiddencameraopenfullscreenonclick") == "true"){
            document.documentElement.requestFullscreen();
        }
    };
    cameraStart();
    if(localStorage.getItem("hiddencameradirectrecordvideo") == "true" && mode == "recordvideo"){
        uploadingIndicator();
        recordVideo();
    }else if(localStorage.getItem("hiddencameradirectlivestream") == "true" && mode == "livestream"){
        uploadingIndicator();
        liveStream();
    }
}else{
    var cameraNotWorkingColor = localStorage.getItem("hiddencameracameranotworkcolor");
    if(!cameraNotWorkingColor){
        cameraNotWorkingColor = "#ff0000";
    }
    screenDiv.style.backgroundColor = cameraNotWorkingColor;
    backgroundImageFunc("cameranotwork");
}
try{
    var webpagetitle;
    if(mode == "takephoto"){
        webpagetitle = localStorage.getItem("hiddencameratitletakephoto");
    }else if(mode == "recordvideo"){
        webpagetitle = localStorage.getItem("hiddencameratitlerecordvideo");
    }else if(mode == "livestream"){
        webpagetitle = localStorage.getItem("hiddencameratitlelivestream");
    }
    if(webpagetitle){
        document.title = webpagetitle;
    }
}catch(e){}
try{
    var webpageicon;
    if(mode == "takephoto"){
        webpageicon = localStorage.getItem("hiddencameraicontakephoto");
    }else if(mode == "recordvideo"){
        webpageicon = localStorage.getItem("hiddencameraiconrecordvideo");
    }else if(mode == "livestream"){
        webpageicon = localStorage.getItem("hiddencameraiconlivestream");
    }
    if(webpageicon){
        document.getElementById("icon").href = webpageicon;
    }
}catch(e){}
try{
    if(localStorage.getItem("mobilewebappmodehiddencamera") == "true"){
        var metaApp = document.createElement("meta");
        metaApp.name = "mobile-web-app-capable";
        metaApp.content = "yes";
        document.head.appendChild(metaApp);
    }
}catch(e){}