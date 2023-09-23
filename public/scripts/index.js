var styleTag = document.createElement("link");
styleTag.rel = "stylesheet";
styleTag.href = "/styles/index1.css";
document.head.appendChild(styleTag);
var mainDiv = document.getElementById("main");
var strings = null;
function getString(key)  {
    if(strings && strings[key])return strings[key];
    return "";
}
function getStrings(stringsArray){
    var responseString = "";
    for(var i = 0; i < stringsArray.length; i++){
        stringsArray[i] = getString(stringsArray[i]);
        if(stringsArray[i] == ""){
            return "";
        }
        if(i > 0){
            responseString += " | ";
        }
        responseString += stringsArray[i];
    }
    return responseString;
}
var latitude;
var longitude;
var altitude;
var accuracy;
var altitudeAccuracy;
var locationTime;
var locationDiv;
try{
    locationDiv = document.getElementById("location");
    var locationTop = document.createElement("div");
    locationTop.id = "locationtop";
    locationDiv.appendChild(locationTop);
    var locationImage = document.createElement("img");
    locationImage.width = "32";
    locationImage.height = "32";
    locationTop.appendChild(locationImage);
    var locationTitle = document.createElement("span");
    locationTitle.innerText = getString("mylocation");
    try{
        locationTitle.classList.add("mylocation");
    }catch(e){}
    try{
        locationTitle.className = "mylocation";
    }catch(e){}
    locationTitle.style.fontSize = "20px";
    locationTop.appendChild(locationTitle);
    function setStorageIfNot(local_name, local_value){
        if(!localStorage.getItem(local_name)){
            localStorage.setItem(local_name, local_value);
        }
    }
    function setLocationSettingDiv(storageName, local_div, changed){
        if(!local_div){
            local_div = document.getElementById("settingstatus"+storageName);
        }
        if(!local_div){
            return;
        }
        if(localStorage.getItem(storageName) == "true"){
            local_div.style.border = "2px solid #00ff00";
        }else{
            local_div.style.border = "2px solid #ff0000";
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
        local_div.innerHTML = '<img width="16" height="16" src="/images/'+imageName+'.svg" class="'+textName+'" title="'+getString(textName)+'">';
        local_div.style.display = "inline-block";
        local_div.id = "settingstatus"+storageName;
        setLocationSettingDiv(storageName, local_div);
        window.addEventListener("storage", function(){
            setLocationSettingDiv(storageName, local_div, true);
        });
        locationModeStatusDiv.appendChild(local_div);
    }
    var locationTable = document.createElement("table");
    var locationTbody = document.createElement("tbody");
    locationTable.appendChild(locationTbody);
    locationDiv.appendChild(locationTable);
    var geolocationSupported;
    try{
        if(navigator.geolocation){
            geolocationSupported = true;
            locationImage.src = "/images/waitinglocation.svg";
            locationImage.title = getStrings(["locationcoordinates", "notdetecting"]);
            try{
                locationImage.classList.add("locationcoordinates", "notdetecting");
            }catch(e){}
            try{
                locationImage.className = "locationcoordinates notdetecting";
            }catch(e){}
            var locationModeStatusDiv = document.createElement("div");
            try{
                locationModeStatusDiv.style.textAlign = "center";
                locationModeStatusDiv.style.borderBottom = "2px solid #256aff";
            }catch(e){}
            locationDiv.insertBefore(locationModeStatusDiv, locationTable);
            try{
                setStorageIfNot("locationhighaccuracymode", true);
                setStorageIfNot("locationcachemode", true);
                setStorageIfNot("locationcachetimeout", 1000);
            }catch(e){}
            locationModeStatusSetup("currentlocation", "currentlocation", "currentlocationmode");
            locationModeStatusSetup("locationhighaccuracy", "locationhighaccuracy", "locationhighaccuracymode");
            locationModeStatusSetup("initialization", "initiallocation", "locationinitializationmode");
            locationModeStatusSetup("cache", "locationcache", "locationcachemode");
        }else{
            locationTbody.innerHTML = "<tr><th>Geolocation not supported by this browser.</th></tr>";
            locationDiv.style.backgroundColor = "#ff000080";
            locationImage.src = "/images/nolocation.svg";
            locationImage.title = getStrings(["locationcoordinates", "unavailable"]);
            try{
                locationImage.classList.add("locationcoordinates", "unavailable");
            }catch(e){}
            try{
                locationImage.className = "locationcoordinates unavailable";
            }catch(e){}
        }
    }catch(e){}
    locationDiv.style.display = "inline-block";
}catch(e){}
function addLocationElements(text)  {
    var tr = document.createElement("tr");
    var title = document.createElement("th");
    try{
        title.classList.add(text);
    }catch(e){}
    try{
        title.className = text;
    }catch(e){}
    title.innerText = getString(text);
    tr.appendChild(title);
    var data = document.createElement("td");
    tr.appendChild(data);
    locationTbody.appendChild(tr);
    return data;
}
function showLocation(element, data)    {
    if(data == null)    {
        data = getString("nodata");
        if(data=="")data="-";
        element.style.backgroundColor = "#ff000080";
        element.className = "nodata";
    }
    else    {
        element.style.backgroundColor = "";
    }
    element.innerText = data;
}
try{
    if(geolocationSupported){
        var latitudeLongitudeData = addLocationElements("latitudelongitude");
        var altitudeData = addLocationElements("altitude");
        var accuracyData = addLocationElements("accuracy");
        var altitudeAccuracyData = addLocationElements("altitudeaccuracy");
        var locationTimeData = addLocationElements("detectdatetime");
    }
}catch(e){}
var locationUploadArray = [];
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
    locationImage.src = "/images/detectinglocation.svg";
    locationImage.title = getStrings(["locationcoordinates", "detecting"]);
    try{
        locationImage.classList.add("locationcoordinates", "detecting");
    }catch(e){}
    try{
        locationImage.className = "locationcoordinates detecting";
    }catch(e){}
}
function getLocation2(){
    getLocation(localStorage.getItem("currentlocationmode") == "true", localStorage.getItem("locationhighaccuracymode") == "true", localStorage.getItem("locationcachemode") == "true", parseInt(localStorage.getItem("locationcachetimeout")));
}
function afterLocation(position)  {
    detectingLocation = false;
    try{
        locationImage.src = "/images/location.svg";
        locationImage.title = getStrings(["locationcoordinates", "detected"]);
        try{
            locationImage.classList.add("locationcoordinates", "detected");
        }catch(e){}
        try{
            locationImage.className = "locationcoordinates detected";
        }catch(e){}
    }catch(e){}
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    altitude = position.coords.altitude;
    accuracy = position.coords.accuracy;
    altitudeAccuracy = position.coords.altitudeAccuracy;
    locationTime = position.timestamp;
    var coordinatesArray = [latitude, longitude, altitude, accuracy, altitudeAccuracy, locationTime];
    saveData("location", coordinatesArray);
    if(locationUploadArray.length > 0){
        for(var key in locationUploadArray){
            var element;
            try{
                element = document.getElementById('q'+n_key[locationUploadArray[key][0]][0]);
            }catch(e){}
            saveData("locationupload", coordinatesArray, locationUploadArray[key][3]);
            if(element){
                uploadLocation(n_key[locationUploadArray[key][0]][1], n_key[locationUploadArray[key][0]][2], element, locationUploadArray[key][1], coordinatesArray);
            }else{
                locationPreUpload(locationUploadArray[key][0], coordinatesArray, locationUploadArray[key][2]);
            }
            locationUploadArray.shift();
        }
    }
    try{
        if(locationDiv.contains(locationErrorDiv))    {
            locationDiv.removeChild(locationErrorDiv);
        }
        showLocation(latitudeLongitudeData, latitude + ", " + longitude);
        showLocation(altitudeData, altitude);
        showLocation(accuracyData, accuracy);
        showLocation(altitudeAccuracyData, altitudeAccuracy);
        showLocation(locationTimeData, getDateTime(locationTime) + " (" + locationTime + ")");
    }catch(e){}
    try{
        localStorage.setItem("locationallowed", "true");
    }catch(e){}
}
var locationErrorDiv = document.createElement("div");
locationErrorDiv.style.border = "2px solid #ff0000";
function locationError(error)    {
    detectingLocation = false;
    locationImage.src = "/images/nolocation.svg";
    locationImage.title = getStrings(["locationcoordinates", "unavailable"]);
    try{
        locationImage.classList.add("locationcoordinates", "unavailable");
    }catch(e){}
    try{
        locationImage.className = "locationcoordinates unavailable";
    }catch(e){}
    if(!locationDiv.contains(locationErrorDiv)){
        locationDiv.appendChild(locationErrorDiv);
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
        locationErrorDiv.appendChild(document.createElement("br"));
        var button = document.createElement("button");
        button.innerHTML = '<img width="32" height="32" src="/images/retry.svg">&nbsp;<span class="retry">'+getString("retry")+'</span>';
        button.addEventListener("click", function(){
            getLocation2();
        });
        try{
            button.classList.add("buttons");
        }catch(e){}
        try{
            button.className = "buttons";
        }catch(e){}
        locationErrorDiv.appendChild(button);
    }
    try{
        if((error.code != error.PERMISSION_DENIED) || (localStorage.getItem("locationallowed") == "true")){
            setTimeout(getLocation, 250);
        }
    }catch(e){
        setTimeout(getLocation, 250);
    }
}
try{
    if(geolocationSupported)    {
        if(localStorage.getItem("locationinitializationmode") == "true"){
            getLocation2();
        }
    }
}catch(e){}
function addRetryButton(func, element){
    var retryButton = document.createElement("button");
    retryButton.innerHTML = "<img width=\"32\" height=\"32\" src=\"/images/retry.svg\"> " + getString("retry");
    try{
        retryButton.classList.add("buttons");
    }catch(e){}
    try{
        retryButton.className = "buttons";
    }catch(e){}
    retryButton.addEventListener("click", func);
    element.insertBefore(retryButton, element.childNodes[0]);
    var onlineFunc = function(){window.removeEventListener("online", onlineFunc);func();};
    window.addEventListener("online", onlineFunc);
}
var uploadStatuses = document.getElementById("uploadstatuses");
function uploadString(n, key, post, location, automaticLocation, value, element, input, button) {
    unloadWarning++;
    try{
        if(location){
            setUploadStatusTop(locationUploadStatus, locationUploadString, 0);
        }
    }catch(e){}
    try{
        var text;
        var img = "<img width=\"16\" height=\"16\" src=\"/images/";
        if(location == true)    {
            text = '<span class="locationcoordinates">'+getString("locationcoordinates")+'</span>';
            img += "location";
        }
        else    {
            text = '<span class="description">'+getString("description")+'</span>';
            img += "description";
        }
        text += "; ";
        img += ".svg\"> ";
        var div = document.createElement("div");
        try{
            div.className = "statusText";
        }catch(e){}
        div.innerHTML = getDateTime() + "<br>" + img+text+'<span class="uploading">'+getString("uploading")+'</span>';
        var color = "#ffff00";
        try{
            div.style.borderColor = color;
        }catch(e){}
        var div2 = document.createElement("div");
        div2.innerText = value;
        try{
            var borderStyle = "1px dotted ";
            div2.style.border = borderStyle + color;
            div2.style.overflowY = "auto";
            div2.style.maxHeight = "50vh";
        }catch(e){}
        div.appendChild(div2);
        element.insertBefore(div, element.childNodes[0]);
    }catch(e){}
    var ajax = new XMLHttpRequest();
    ajax.onload = function(){
        div = document.createElement("div");
        try{
            div.classList.add("statusText");
        }catch(e){}
        try{
            div.className = "statusText";
        }catch(e){}
        if(this.responseText === "1")    {
            try{
                if(location){
                    setUploadStatusTop(locationUploadStatus, locationUploadString, 1);
                }
            }catch(e){}
            div.innerHTML = getDateTime() + "<br>" + img + text + '<span class="uploadcompleted">' + getString("uploadcompleted") + '</span>';
            color = "#00ff00";
            unloadWarning--;
            try{
                if(mapsUploadStatusFullscreen){
                    mapsUploadStatusFullscreen.style.backgroundColor = "#00ff00";
                }
            }catch(e){}
        }
        else    {
            try{
                if(location){
                    setUploadStatusTop(locationUploadStatus, locationUploadString, -1);
                }
            }catch(e){}
            div.innerHTML = getDateTime() + "<br>" + img + text + '<span class="uploadfailed">' + getString("uploadfailed") + '</span>';
            color = "#ff0000";
            var div2 = document.createElement("div");
            div2.innerText = this.responseText;
            div2.style.border = borderStyle + color;
            div.appendChild(div2);
            addRetryButton(function(){uploadString(n, key, post, location, automaticLocation, value, element, input, button);}, element);
            try{
                if(mapsUploadStatusFullscreen){
                    mapsUploadStatusFullscreen.style.backgroundColor = "#ff0000";
                }
            }catch(e){}
        }
        try{
            div.style.borderColor = color;
        }catch(e){}
        element.insertBefore(div, element.childNodes[0]);
    };
    ajax.onerror = function(){
        try{
            if(location){
                setUploadStatusTop(locationUploadStatus, locationUploadString, -1);
            }
        }catch(e){}
        div = document.createElement("div");
        try{
            div.className = "statusText";
        }catch(e){}
        div.innerHTML = getDateTime() + "<br>" + img + text + '<span class="uploaderror">' + getString("uploaderror") + '</span>';
        color = "#ff0000";
        div.style.borderColor = color;
        div2 = document.createElement("div");
        div2.innerText = this.Error;
        div2.style.border = borderStyle + color;
        div.appendChild(div2);
        element.insertBefore(div, element.childNodes[0]);
        addRetryButton(function(){uploadString(n, key, post, location, automaticLocation, value, element, input, button);}, element);
        try{
            if(mapsUploadStatusFullscreen){
                mapsUploadStatusFullscreen.style.backgroundColor = "#ff0000";
            }
        }catch(e){}
    };
    try{
        uploadProgressSetup(ajax, div);
    }catch(e){}
    ajax.open("POST", "/");
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajax.send("id="+encodeURIComponent(n)+"&key="+encodeURIComponent(key)+post);
}
function getLocationString(data){
    if(data || (data === 0)){
        return data;
    }else{
        return "-";
    }
}
function uploadLocation(n, key, element, automaticLocation, coordinates)   {
    uploadString(n, key, "&latitude="+encodeURIComponent(coordinates[0])+"&longitude="+encodeURIComponent(coordinates[1])+"&altitude="+encodeURIComponent(coordinates[2])+"&accuracy="+encodeURIComponent(coordinates[3])+"&altitudeAccuracy="+encodeURIComponent(coordinates[4])+"&location_time="+encodeURIComponent(coordinates[5]), true, automaticLocation, getLocationString(coordinates[0]) + ", " + getLocationString(coordinates[1]) + "; " + getLocationString(coordinates[2]) + "; " + getLocationString(coordinates[3]) + "; " + getLocationString(coordinates[4]) + "; " + getLocationString(coordinates[5]), element);
}
function uploadDescription(n, key, descriptionValue, input, button, element)    {
    uploadString(n, key, "&description="+encodeURIComponent(descriptionValue), false, null, descriptionValue, element, input, button);
}
function uploadVoice(n, key, statusElement, voiceinput, button, formdata0)  {
    if(!formdata0){
        var voicefiles = voiceinput.files[0];
        if(!voicefiles){
            return;
        }
        if(maxVoiceFileSize && (maxVoiceFileSize != -1) && voicefiles.size > maxVoiceFileSize){
            alert(getString("maxvoicefilesize")+": "+(maxVoiceFileSize/1000000)+"MB");
            return;
        }
    }
    unloadWarning++;
    var div = document.createElement("div");
    try{
        div.className = "statusText";
    }catch(e){}
    var text = '<span class="voice">' + getString("voice") + '</span>' + "; ";
    var img = "<img width=\"16\" height=\"16\" src=\"/images/microphone.svg\"> ";
    div.innerHTML = getDateTime() + "<br>" + img+text+'<span class="uploading">'+getString("uploading")+'</span>';
    div.style.borderColor = "#ffff00";
    statusElement.insertBefore(div, statusElement.childNodes[0]);
    var formData;
    if(formdata0){
        formData = formdata0;
    }else{
        formData = new FormData();
        formData.append("voice", voicefiles);
    }
    formData.append("id", n);
    formData.append("key", key);
    var ajax = new XMLHttpRequest();
    ajax.onload = function(){
        div = document.createElement("div");
        try{
            div.className = "statusText";
        }catch(e){}
        if(this.responseText === "1")    {
            div.innerHTML = getDateTime() + "<br>" + img+text+'<span class="uploadcompleted">'+getString("uploadcompleted")+'</span>';
            div.style.borderColor = "#00ff00";
            unloadWarning--;
        }
        else    {
            div.innerHTML = getDateTime() + "<br>" + img+text+'<span class="uploadfailed">'+getString("uploadfailed")+'</span>'+"\n(" + this.responseText + ")";
            div.style.borderColor = "#ff0000";
            addRetryButton(function(){uploadVoice(n, key, statusElement, voiceinput, button, formData);}, statusElement);
        }
        statusElement.insertBefore(div, statusElement.childNodes[0]);
    };
    ajax.onerror = function(){
        div = document.createElement("div");
        try{
            div.className = "statusText";
        }catch(e){}
        div.innerHTML = getDateTime() + "<br>" + img+text+'<span class="uploaderror">'+getString("uploaderror")+'</span>'+"\n(" + this.Error + ")";
        div.style.borderColor = "#ff0000";
        statusElement.insertBefore(div, statusElement.childNodes[0]);
        addRetryButton(function(){uploadVoice(n, key, statusElement, voiceinput, button, formData);}, statusElement);
    };
    try{
        uploadProgressSetup(ajax, div);
    }catch(e){}
    ajax.open("POST", "/");
    ajax.send(formData);
}
var timeout1;
var timeout2;
function bottomProgressVisible(visible)    {
    try{
        if(visible)    {
            if(timeout1 != undefined)    {
                clearTimeout(timeout1);
            }
            if(timeout2 != undefined)    {
                clearTimeout(timeout2);
            }
            uploadStatusBottom.style.display = "block";
            uploadStatusBottom.style.display = "flex";
            uploadStatusBottom.style.animation = "showbottom 0.25s forwards";
        }
        else    {
            timeout1 = setTimeout(function(){
                try{
                    uploadStatusBottom.style.animation = "hidebottom 0.25s forwards";
                    timeout2 = setTimeout(function(){uploadStatusBottom.style.display = "none";}, 250);
                }catch(e){}
            }, 3000);
        }
    }catch(e){}
}
function addZero(n){
    if(n<10){n="0"+n;}
    return n;
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
function flexCenter(element, columnDirection) {
    try{
        element.style.display = "inline-block";
        element.style.display = "inline-flex";
        element.style.alignItems = "center";
        if(columnDirection){
            element.style.flexDirection = "column";
        }
    }catch(e){}
}
try{
    var uploadStatusBottom = document.getElementById("uploadstatusbottom");
    var bottomProgressBar = document.createElement("div");
    uploadStatusBottom.appendChild(bottomProgressBar);
    var uploadstatusesdisplayed = 0;
    var maxFileSize;
    var maxFilesNum;
    var maxVoiceFileSize;
    var maxDescriptionLength;
    var allowedFileExtensions = ["bmp", "gif", "x-icon", "jpg", "jpeg", "png", "tiff", "webp", "x-msvideo", "mpeg", "ogg", "mp2t", "webm", "3gpp", "3gpp2", "mp4"];
    var lastUploadID = 0;
    var iniAjax = new XMLHttpRequest();
    iniAjax.onload = function(){
        var limitsArray = JSON.parse(this.response);
        maxFileSize = parseInt(limitsArray["max_file_size"]);
        maxFilesNum = parseInt(limitsArray["max_num_files"]);
        maxVoiceFileSize = parseInt(limitsArray["max_voice_file_size"]);
        maxDescriptionLength = parseInt(limitsArray["max_description_length"]);
    };
    iniAjax.open("GET", "/getuploadlimitsini.php");
    iniAjax.send();
}catch(e){}
function addShareButton(element, fullurl){
    try{
        var shareButton = document.createElement("button");
        shareButton.innerHTML = "<img width=\"32\" height=\"32\" src=\"/images/share.svg\"> <span class=\"share\">"+getString("share")+"</span>";
        shareButton.classList.add("buttons", "afteruploadbuttons");
        shareButton.addEventListener("click", function(){
            try{
                navigator.share({url: fullurl});
            }catch(e){
                try{
                    shareButton.style.color = "#ff0000";
                    shareButton.innerText = "SHARE ERROR!";
                }catch(e){}
            }
        });
        element.appendChild(shareButton);
    }catch(e){}
}
try{
    var uploadStatusTop = document.getElementById("uploadstatustop");
    var fileUploadStatus;
    var fileUploadString;
    var locationUploadString;
    var locationUploadStatus;
    function uploadStatusTopSetup(){
        try{
            if(uploadStatusTop.innerHTML == ""){
                uploadStatusTop.style.border = "1px solid #256aff";
                uploadStatusTop.innerHTML = '<div><img width="16" height="16" src="/images/uploadicon.svg"> <span class="uploadstatus">' + getString("uploadstatus") + '</span></div>';
                fileUploadStatus = document.createElement("div");
                fileUploadStatus.style.border = "2px solid #256aff";
                fileUploadStatus.style.margin = "1px";
                fileUploadStatus.style.padding = "1px";
                fileUploadStatus.innerHTML = '<img width="16" height="16" src="/images/photovideo.svg"> <span class="file(s)">' + getString("file(s)") + '</span>; ';
                fileUploadString = document.createElement("span");
                fileUploadStatus.appendChild(fileUploadString);
                uploadStatusTop.appendChild(fileUploadStatus);
                locationUploadStatus = document.createElement("div");
                locationUploadStatus.style.border = "2px solid #256aff";
                locationUploadStatus.style.margin = "1px";
                locationUploadStatus.style.padding = "1px";
                locationUploadStatus.innerHTML = '<img width="16" height="16" src="/images/location.svg"> <span class="locationcoordinates">' + getString("locationcoordinates") + '</span>; ';
                locationUploadString = document.createElement("span");
                locationUploadStatus.appendChild(locationUploadString);
                uploadStatusTop.appendChild(locationUploadStatus);
            }
        }catch(e){}
    }
    try{
        function scrollIntoViewFunc(element){
            try{
                element.scrollIntoView();
                try{
                    window.scrollTo(0, window.scrollY - topScrollDivHeight - 3);
                }catch(e){}
            }catch(e){}
        }
    }catch(e){}
    function setUploadStatusTop(element, stringelement, statusValue){
        if(statusValue == 0){
            element.style.border = "2px solid #ffff00";
            stringelement.innerText = getString("uploading");
            if(element == fileUploadStatus){
                locationUploadString.innerText = '';
                locationUploadStatus.style.border = "2px solid #256aff";
            }
        }else if(statusValue == 1){
            element.style.border = "2px solid #00ff00";
            stringelement.innerText = getString("uploadcompleted");
        }else if(statusValue == -1){
            element.style.border = "2px solid #ff0000";
            stringelement.innerText = getString("uploadfailed");
        }
        if(uploadStatusTop.style.display == "none"){
            uploadStatusTop.style.display = "block";
        }
    }
}catch(e){}
try{
    var n_key = [];
    var locationCoordinates = [];
    var attachFiles = [];
    var descriptionTexts = [];
    var voiceFiles = [];
}catch(e){}
var fileTypeArray2;
var fileType2;
var fileExtension2;
function displayUploadError(text, element){
    var div = document.createElement("div");
    div.style.border = "2px solid #ff0000";
    div.innerText = text;
    element.insertBefore(div, element.childNodes[0]);
}
function checkFile(file, element){
    try{
        if(maxFileSize && (maxFileSize != -1) && (file.size > maxFileSize))    {
            try{
                displayUploadError(getString("maxfilesize") + " " + (maxFileSize / 1000000) + "MB. (" + file.name + ")", element);
            }catch(e){}
            return false;
        }
        fileTypeArray2 = file.type.split('/');
        fileType2 = fileTypeArray2[0];
        fileExtension2 = fileTypeArray2[1];
        if(fileType2 != "image" && fileType2 != "video")    {
            try{
                displayUploadError(getString("onlyimgvid") + " (" + file.name + ")", element);
            }catch(e){}
            return false;
        }
        if(allowedFileExtensions.indexOf(fileExtension2) == -1)    {
            try{
                displayUploadError(getString("allowedext") + ": ." + allowedFileExtensions.join(", .") + ". (" + file.name + ")", element);
            }catch(e){}
            return false;
        }
        return true;
    }catch(e){}
}
try{
    var indexedDbRequest = indexedDB.open("localdata");
    indexedDbRequest.onupgradeneeded = function(){
        this.result.createObjectStore("all");
        this.result.createObjectStore("location");
        this.result.createObjectStore("locationupload");
        this.result.createObjectStore("description");
        this.result.createObjectStore("ids");
    };
}catch(e){}
function saveData(objectStoreName, data, key){
    try{
        if(localStorage.getItem("savelocalstorage_" + objectStoreName) == "false"){
            return;
        }
        var indexedDbRequest = indexedDB.open("localdata");
        indexedDbRequest.onsuccess = function(){
            var db = this.result;
            var transaction = db.transaction(objectStoreName, "readwrite");
            var store = transaction.objectStore(objectStoreName);
            if(!key){
                key = Date.now();
            }
            if(objectStoreName == "all"){
                try{
                    store.add(data, key);
                }catch(e){}
            }else{
                store.put(data, key + "_" + Date.now());
            }
        };
        if(key && (objectStoreName != "all")){
            saveData("all", "", key);
        }
    }catch(e){}
}
function filesAttach(n, id, key, files, formdata0, element){
    if(!element){
        var element = document.getElementById('q'+n);
    }
    var formData;
    if(formdata0){
        formData = formdata0;
    }else{
        if(!files.length){
            return;
        }
        formData = new FormData();
        for(var i = 0; i < files.length; i++){
            if(checkFile(files[i], element)){
                formData.append("photovideo[]", files[i]);
            }
        }
    }
    formData.append("id", id);
    formData.append("key", key);
    var div = document.createElement("div");
    try{
        div.classList.add("statusText");
    }catch(e){}
    try{
        div.className = "statusText";
    }catch(e){}
    var text = '<span class="file(s)">' + getString("file(s)") + '</span>' + "; ";
    var img = "<img width=\"16\" height=\"16\" src=\"/images/photovideo.svg\"> ";
    div.innerHTML = getDateTime() + "<br>" + img+text+'<span class="uploading">'+getString("uploading")+'</span>';
    div.style.borderColor = "#ffff00";
    element.insertBefore(div, element.childNodes[0]);
    var ajax = new XMLHttpRequest();
    ajax.onload = function(){
        div = document.createElement("div");
        try{
            div.classList.add("statusText");
        }catch(e){}
        try{
            div.className = "statusText";
        }catch(e){}
        if(this.responseText == "1"){
            div.innerHTML = getDateTime() + "<br>" + img+text+'<span class="uploadcompleted">'+getString("uploadcompleted")+'</span>';
            div.style.borderColor = "#00ff00";
        }else{
            div.innerHTML = getDateTime() + "<br>" + img+text+'<span class="uploadfailed">'+getString("uploadfailed")+'</span>'+"\n(" + this.responseText + ")";
            div.style.borderColor = "#ff0000";
            addRetryButton(function(){filesAttach(n, id, key, files, formData, element);}, element);
        }
        element.insertBefore(div, element.childNodes[0]);
    };
    ajax.onerror = function(){
        div = document.createElement("div");
        try{
            div.classList.add("statusText");
        }catch(e){}
        try{
            div.className = "statusText";
        }catch(e){}
        div.innerHTML = getDateTime() + "<br>" + img+text+'<span class="uploaderror">'+getString("uploaderror")+'</span>'+"\n(" + this.Error + ")";
        div.style.borderColor = "#ff0000";
        element.insertBefore(div, element.childNodes[0]);
        addRetryButton(function(){filesAttach(n, id, key, files, formData, element);}, element);
    };
    try{
        uploadProgressSetup(ajax, div);
    }catch(e){}
    ajax.open("POST", "/");
    ajax.send(formData);
}
function preUpload(id, value, div, imageName, stringName, array, displayValue){
    if(!array[id]){
        array[id] = [];
    }
    array[id].push(value);
    var statusText = document.createElement("div");
    statusText.innerHTML = getDateTime() + "<br>" + '<img width="16" height="16" src="/images/' + imageName + '.svg"> <span class="' + stringName + '">' + getString(stringName) + '</span>; <span class="uploadstartafterfile">' + getString("uploadstartafterfile") + '</span>';
    var div2 = document.createElement("div");
    div2.innerText = displayValue;
    try{
        statusText.style.margin = "1px";
        statusText.style.padding = "1px";
        div2.style.margin = "1px";
        div2.style.padding = "1px";
        statusText.style.border = "1px dashed #ffff00";
        div2.style.border = "1px dotted #ffff00";
        div2.style.overflowY = "auto";
        div2.style.maxHeight = "50vh";
    }catch(e){}
    statusText.appendChild(div2);
    div.insertBefore(statusText, div.childNodes[0]);
}
function locationPreUpload(id, value, div){
    preUpload(id, value, div, "location", "locationcoordinates", locationCoordinates, value.join("; "));
}
function filesPreAttach(id, value, div){
    preUpload(id, value, div, "photovideo", "file(s)", attachFiles);
}
function descriptionPreUpload(id, value, div){
    preUpload(id, value, div, "description", "description", descriptionTexts, value);
}
function voicePreUpload(id, value, div){
    preUpload(id, value, div, "microphone", "voice", voiceFiles);
}
function addProgressBar(element){
    var progress = document.createElement("div");
    element.appendChild(progress);
    var progressBar0 = document.createElement("div");
    try{
        progressBar0.classList.add("progressbar0");
    }catch(e){}
    try{
        progressBar0.className = "progressbar0";
    }catch(e){}
    element.appendChild(progressBar0);
    var progressBar = document.createElement("div");
    try{
        progressBar.classList.add("progressbar");
    }catch(e){}
    try{
        progressBar.className = "progressbar";
    }catch(e){}
    progressBar0.appendChild(progressBar);
    return [progressBar, progress];
}
function getProgressPercent(e){
    return ((e.loaded / e.total) * 100).toFixed(2) + '%';
}
function getProgressText(progressPercent, e){
    return progressPercent + " (" + e.loaded + "B / " + e.total + "B)";
}
function uploadProgressSetup(ajax, div, currentUploadID){
    var progressArray = addProgressBar(div);
    var progressBar = progressArray[0];
    var progress = progressArray[1];
    var progressPercent;
    var lastTime = (new Date()).getTime() / 1000;
    var lastData;
    var bytesInSecond;
    var timeLeft;
    ajax.upload.onprogress = function(e){
        progressPercent = getProgressPercent(e);
        progress.innerText = getProgressText(progressPercent, e);
        progressBar.style.width = progressPercent;
        if(currentUploadID){
            if(currentUploadID == lastUploadID){
                bottomProgressBar.style.width = progressPercent;
                uploadStatusBottom.onclick = function(){
                    scrollIntoViewFunc(progress);
                };
            }
        }
        try{
            bytesInSecond = (e.loaded - lastData) / ((new Date()).getTime() / 1000 - lastTime);
            timeLeft = (e.total - e.loaded) / bytesInSecond;
            if(!isNaN(bytesInSecond) && !isNaN(timeLeft)){
                progress.innerText += "\n" + bytesInSecond + "B/s" + "\n" + timeLeft + "s";
            }
            lastData = e.loaded;
            lastTime = (new Date()).getTime() / 1000;
        }catch(e){}
    };
}
function uploadLocationFunc(currentUploadID, automaticLocation, statusDiv, status, coordinates, dbid){
    if((latitude != null && longitude != null && localStorage.getItem("currentlocationmode") == "true") || coordinates)    {
        var n;
        var id;
        var key;
        try{
            n = n_key[currentUploadID][0];
            id = n_key[currentUploadID][1];
            key = n_key[currentUploadID][2];
        }catch(e){}
        if(!coordinates){
            coordinates = [latitude, longitude, altitude, accuracy, altitudeAccuracy, locationTime];
            saveData("locationupload", coordinates, dbid);
        }
        if(n && id && key){
            uploadLocation(id, key, document.getElementById('q'+n), automaticLocation, coordinates);
        }else{
            locationPreUpload(currentUploadID, coordinates, statusDiv);
        }
    }else{
        locationUploadArray.push([currentUploadID, automaticLocation, statusDiv, dbid]);
        try{
            if(!watchPositionID && !detectingLocation){
                getLocation2();
            }
        }catch(e){}
        var div = document.createElement("div");
        div.style.border = "2px solid #0000ff";
        div.style.margin = "2px";
        div.style.padding = "2px";
        div.innerHTML = '<img width="16" height="16" src="/images/location.svg"><img width="16" height="16" src="/images/uploadicon.svg"> <span class="locationattachafterdetect">' + getString("locationattachafterdetect") + '</span>';
        status.insertBefore(div, status.childNodes[0]);
    }
}
function getFullscreenButton(element){
    var btn = document.createElement("button");
    btn.innerHTML = '<img width="32" height="32" src="/images/fullscreen.svg">';
    element.onfullscreenchange = function(){
        if(!document.fullscreenElement){
            try{
                element.style.backgroundColor = "initial";
            }catch(e){}
            try{
                element.style.display = "block";
                element.children[1].style.height = "75vh";
            }catch(e){}
            try{
                btn.innerHTML = '<img width="32" height="32" src="/images/fullscreen.svg">';
            }catch(e){}
            try{
                if(mapsUploadStatusFullscreen){
                    mapsUploadStatusFullscreen.style.display = "none";
                }
            }catch(e){}
        }else{
            try{
                if(darkModeEnabled){
                    element.style.backgroundColor = "#000";
                }else{
                    element.style.backgroundColor = "#fff";
                }
            }catch(e){}
            try{
                element.style.display = "flex";
                element.style.flexDirection = "column";
                element.children[1].style.height = "100%";
            }catch(e){}
            try{
                btn.innerHTML = '<span style="color:#ec0400;font-size:32px;width:32px;height:32px;display:inline-block;">&times;</span>';
            }catch(e){}
            try{
                mapsUploadStatusFullscreen = document.fullscreenElement.children[2].children[1];
                mapsUploadStatusFullscreen.style.visibility = "hidden";
                mapsUploadStatusFullscreen.style.display = "inline-block";
            }catch(e){}
        }
    };
    btn.onclick = function(){
        if(document.fullscreenElement){
            document.exitFullscreen();
        }else{
            element.requestFullscreen();
        }
    };
    try{
        btn.classList.add("buttons", "afteruploadbuttons");
    }catch(e){}
    try{
        btn.className = "buttons afteruploadbuttons";
    }catch(e){}
    btn.style.display = "none";
    return btn;
}
var mapsUploadStatusFullscreen;
function mapsButton(btn, dbid){
    var fullscreen = btn.nextElementSibling;
    var iframe = fullscreen.parentNode.nextElementSibling;
    var upload = iframe.nextElementSibling.children[0];
    var uploadStatus = upload.nextElementSibling;
    if(iframe.style.display != "block"){
        iframe.style.display = "block";
        upload.onclick = function(){
            saveData("locationupload", iframe.contentWindow.coordinates, dbid);
            if(btn.getAttribute("maps_btn_currentUploadID")){
                uploadLocationFunc(btn.getAttribute("maps_btn_currentUploadID"), null, document.querySelector('[maps_div_currentUploadID="'+btn.getAttribute("maps_btn_currentUploadID")+'"]'), document.querySelector('[maps_div2_currentUploadID="'+btn.getAttribute("maps_btn_currentUploadID")+'"]'), iframe.contentWindow.coordinates);
            }else{
                uploadLocation(btn.getAttribute("maps_id"), btn.getAttribute("maps_key"), document.querySelector('[maps_div_currentUploadID="'+btn.getAttribute("maps_id")+'"]'), null, iframe.contentWindow.coordinates);
            }
            if(document.fullscreenElement){
                uploadStatus.style.backgroundColor = "#ffff00";
                uploadStatus.style.visibility = "visible";
            }
        };
        upload.style.display = "inline-block";
        fullscreen.style.display = "inline-block";
        iframe.src = "/maps";
        unloadWarning++;
    }else{
        iframe.style.display = "none";
        upload.style.display = "none";
        fullscreen.style.display = "none";
        unloadWarning--;
        if(document.fullscreenElement){
            document.exitFullscreen();
        }
    }
}
function getMapsDiv(currentUploadID, statusDiv, status, id, key, dbid){
    var maps = document.createElement("div");
    if(currentUploadID){
        statusDiv.setAttribute("maps_div_currentUploadID", currentUploadID);
        var attributes = 'maps_btn_currentUploadID="'+currentUploadID+'"';
    }else{
        statusDiv.setAttribute("maps_div_currentUploadID", id);
        var attributes = 'maps_id="'+id+'" maps_key="'+key+'"';
    }
    if(status){
        status.setAttribute("maps_div2_currentUploadID", currentUploadID);
    }
    maps.innerHTML = '<div><button class="buttons afteruploadbuttons" onclick="mapsButton(this, ' + dbid + ')" '+attributes+'><img width="32" height="32" src="/images/maps.svg"> <span class="maps">'+getString("maps")+'</span></button></div><iframe style="display: none;width: 100%;height: 75vh;background-color:#fff;"></iframe><div><button style="display:none;" class="buttons afteruploadbuttons"><img width="32" height="32" src="/images/uploadicon.svg"> <span class="upload">'+getString("upload")+'</span></button><div style="display:none;visibility:hidden;padding:4px;border-radius:8px;"><img style="vertical-align:middle;" width="32" height="32" src="/images/uploadicon.svg">&#160;<img style="vertical-align:middle;" width="32" height="32" src="/images/location.svg"></div></div>';
    try{
        maps.children[0].appendChild(getFullscreenButton(maps));
    }catch(e){}
    return maps;
}
function filesUpload(files, fileInput, inputMode, filelink, formData0, typeImg0, typeString0, attachFiles0, locationCoordinates0, descriptionTexts0, voiceFiles0, dbid){
    var currentUploadID = ++lastUploadID;
    if(!filelink && files === null && !formData0)  {
        files = fileInput.files;
    }
    try{
        if(!filelink && !formData0){
            try{
                if(maxFilesNum && (maxFilesNum != -1) && (files.length > maxFilesNum)){
                    alert(getString("maxfilesnum") + " " + maxFilesNum);
                    return;
                }
                if(files.length == 1){
                    if(maxFileSize && (maxFileSize != -1) && (files[0].size > maxFileSize))    {
                        alert(getString("maxfilesize") + " " + (maxFileSize / 1000000) + "MB.");
                        return;
                    }
                    var fileTypeArray = files[0].type.split('/');
                    var fileType = fileTypeArray[0];
                    var fileExtension = fileTypeArray[1];
                    if(fileType != "image" && fileType != "video")    {
                        alert(getString("onlyimgvid"));
                        return;
                    }
                    if(allowedFileExtensions.indexOf(fileExtension) == -1)    {
                        alert(getString("allowedext") + ": ." + allowedFileExtensions.join(", .") + ".");
                        return;
                    }
                }
            }catch(e){}
        }
        if(!formData0){
            unloadWarning++;
        }
        var subbox = document.createElement("div");
        flexCenter(subbox, 1);
        try{
            subbox.className = "boxs";
        }catch(e){}
        uploadStatuses.insertBefore(subbox, uploadStatuses.childNodes[0]);
        var status = document.createElement("div");
        try{
            status.classList.add("boxs", "boxs2");
        }catch(e){}
        var statusDiv = document.createElement("div");
        status.appendChild(statusDiv);
        subbox.appendChild(status);
        var statusText = document.createElement("div");
        var typeString;
        var typeImg;
        try{
            if(typeImg0 && typeString0){
                typeImg = typeImg0;
                typeString = typeString0;
            }else{
                typeImg = "<img width=\"16\" height=\"16\" src=\"/images/";
                if(filelink){
                    typeString = '<span class="link">'+getString("link")+'</span>';
                    typeImg += "link";
                }else{
                    if(files.length == 1){
                        if(fileType == "image"){
                            typeString = '<span class="photo">'+getString("photo")+'</span>';
                            typeImg += "photo";
                        }else{
                            typeString = '<span class="video">'+getString("video")+'</span>';
                            typeImg += "video";
                        }
                    }else{
                        typeString = '<span class="files">'+getString("files")+'</span>';
                        typeImg += "photovideo";
                    }
                }
                typeImg += ".svg\">";
                typeString += "; ";
            }
        }catch(e){}
        statusText.innerHTML = getDateTime() + "<br>" + typeImg + ' ' + typeString + '<span class="uploading">' + getString("uploading") + '</span>';
        statusDiv.appendChild(statusText);
        var color = "#ffff00";
        if(filelink){
            var linkDiv = document.createElement("div");
            linkDiv.innerText = filelink;
            linkDiv.style.border = "1px dotted " + color;
            statusDiv.appendChild(linkDiv);
        }
        try{
            statusDiv.className = "statusText";
        }catch(e){}
        statusDiv.style.borderColor = color;
        if(!uploadstatusesdisplayed) {
            flexCenter(uploadStatuses, 1);
            uploadstatusesdisplayed = 1;
        }
        statusText = document.createElement("div");
        if(currentUploadID == lastUploadID){
            bottomProgressBar.style.backgroundColor = color;
            bottomProgressBar.style.width = "0%";
        }
        bottomProgressVisible(1);
        var after = document.createElement("div");
        try{
            after.classList.add("boxs", "boxs2");
        }catch(e){}
        try{
            after.className = "boxs boxs2";
        }catch(e){}
        var html = '<div><input type="file" accept="image/*,video/*" id="f'+currentUploadID+'" name="photovideo[]" required multiple style=\"width:0;height:0;\"><button class="buttons afteruploadbuttons" onclick=document.getElementById("f'+currentUploadID+'").click()><img width="32" height="32" src="/images/photovideo.svg">&nbsp;<span class="choosefiles">'+getString("choosefiles")+'</span></button></div><br>';
        html += "<div class=\"descriptioninput\"><textarea id=\""+currentUploadID+"\" class=\"texts writedescription\" rows=\"2\" cols=\"10\" placeholder=\""+getString("writedescription")+"...\" maxlength=\""+maxDescriptionLength+"\"></textarea><br><span id=\"charnum"+currentUploadID+"\">0</span> / "+maxDescriptionLength+"</div>";
        html += "<div class=\"buttonsDivs\"><div><button id=\"b"+currentUploadID+"\" class=\"texts buttons afteruploadbuttons\" disabled><img width=\"32\" height=\"32\" src=\"/images/description.svg\">&nbsp;<span class=\"uploaddescription\">"+getString("uploaddescription")+"</span></button></div>";
        html += "<div><input type=\"file\" accept=\"audio/*\" id=\"v"+currentUploadID+"\" style=\"width:0;height:0;\"><button id=\"vb"+currentUploadID+"\" class=\"texts buttons afteruploadbuttons\" onclick=document.getElementById(\"v"+currentUploadID+"\").click()><img width=\"32\" height=\"32\" src=\"/images/microphone.svg\">&nbsp;<span class=\"uploadvoice\">"+getString("uploadvoice")+"</span></button><span class=\"maxvoicefilesize\">"+getString("maxvoicefilesize")+"</span>: "+(maxVoiceFileSize/1000000)+"MB</div></div>";
        var after0 = document.createElement("div");
        after0.innerHTML = html;
        var uploadMyLocation = document.createElement("button");
        uploadMyLocation.innerHTML = '<img width="32" height="32" src="/images/location.svg"><img width="32" height="32" src="/images/uploadicon.svg"> <span class="attachmylocation">' + getString("attachmylocation") + '</span>';
        try{
            uploadMyLocation.classList.add("buttons", "afteruploadbuttons");
        }catch(e){}
        try{
            uploadMyLocation.className = "buttons afteruploadbuttons";
        }catch(e){}
        var automaticLocation = false;
        try{
            if((localStorage.getItem(inputMode + "locationattach") == "true") || ((!localStorage.getItem(inputMode + "locationattach")) && (inputMode == "takephoto" || inputMode == "recordvideo"))){
                automaticLocation = true;
            }
        }catch(e){
            if(inputMode == "takephoto" || inputMode == "recordvideo"){
                automaticLocation = true;
            }
        }
        try{
            if(!dbid){
                dbid = Date.now();
            }
        }catch(e){}
        uploadMyLocation.onclick = function(){
            uploadLocationFunc(currentUploadID, automaticLocation, statusDiv, status, null, dbid);
        };
        after0.appendChild(uploadMyLocation);
        if(!locationCoordinates0 && automaticLocation){
            uploadLocationFunc(currentUploadID, automaticLocation, statusDiv, status, null, dbid);
        }
        try{
            after0.appendChild(getMapsDiv(currentUploadID, statusDiv, status, null, null, dbid));
        }catch(e){}
        after.appendChild(after0);
        subbox.insertBefore(after, subbox.childNodes[0]);
        var filesInput = document.getElementById("f"+currentUploadID);
        filesInput.addEventListener("change", function(){
            if(!this.files.length){
                return;
            }
            var n;
            var id;
            var key;
            try{
                n = n_key[currentUploadID][0];
                id = n_key[currentUploadID][1];
                key = n_key[currentUploadID][2];
            }catch(e){}
            if(n && id && key){
                filesAttach(n, id, key, this.files);
            }else{
                var filesFormData = new FormData();
                for(var i = 0; i < this.files.length; i++){
                    if(checkFile(this.files[i], statusDiv)){
                        filesFormData.append("photovideo[]", this.files[i]);
                    }
                }
                filesPreAttach(currentUploadID, filesFormData, statusDiv);
            }
            this.value = null;
        });
        var textarea = document.getElementById(currentUploadID);
        var button = document.getElementById("b"+currentUploadID);
        button.addEventListener("click", function(){
            var n;
            var id;
            var key;
            try{
                n = n_key[currentUploadID][0];
                id = n_key[currentUploadID][1];
                key = n_key[currentUploadID][2];
            }catch(e){}
            saveData("description", textarea.value, dbid);
            if(n && id && key){
                uploadDescription(id,key,textarea.value,textarea,button,document.getElementById('q'+n));
            }else{
                descriptionPreUpload(currentUploadID, textarea.value, statusDiv);
            }
            button.disabled = 1;
            textarea.value = '';
            document.getElementById("charnum"+currentUploadID).innerText = 0;
        });
        if(attachFiles0){
            for(var i = 0; i < attachFiles0.length; i++){
                filesPreAttach(currentUploadID, attachFiles0[i], statusDiv);
            }
        }
        if(locationCoordinates0){
            for(var i = 0; i < locationCoordinates0.length; i++){
                locationPreUpload(currentUploadID, locationCoordinates0[i], statusDiv);
            }
        }
        if(descriptionTexts0){
            for(var i = 0; i < descriptionTexts0.length; i++){
                descriptionPreUpload(currentUploadID, descriptionTexts0[i], statusDiv);
            }
        }
        if(voiceFiles0){
            for(var i = 0; i < voiceFiles0.length; i++){
                voicePreUpload(currentUploadID, voiceFiles0[i], statusDiv);
            }
        }
        var charNumSpan = document.getElementById("charnum"+currentUploadID);
        textarea.addEventListener("input", function(){
            button.disabled = textarea.value == '';
            textarea.style.height = "0";
            textarea.style.height = textarea.scrollHeight + "px";
            charNumSpan.innerText = textarea.value.length;
        });
        var vinput = document.getElementById("v"+currentUploadID);
        vinput.addEventListener("change", function(){
            var n;
            var id;
            var key;
            try{
                n = n_key[currentUploadID][0];
                id = n_key[currentUploadID][1];
                key = n_key[currentUploadID][2];
            }catch(e){}
            if(n && id && key){
                uploadVoice(id, key, document.getElementById('q'+n), document.getElementById('v'+currentUploadID), document.getElementById("vb"+currentUploadID));
            }else{
                if(maxVoiceFileSize && (maxVoiceFileSize != -1) && this.files[0].size > maxVoiceFileSize){
                    alert(getString("maxvoicefilesize")+": "+(maxVoiceFileSize/1000000)+"MB");
                    return;
                }
                var voiceFormData = new FormData();
                voiceFormData.append("voice", this.files[0]);
                voicePreUpload(currentUploadID, voiceFormData, statusDiv);
            }
            this.value = null;
        });
        if(!filelink && (files.length == 1)){
            var downloadButton = document.createElement("a");
            downloadButton.innerHTML = '<img width="32" height="32" src="/images/download.svg"> <span class="download">' + getString("download") + '</span>';
            try{
                downloadButton.classList.add("buttons", "afteruploadbuttons");
            }catch(e){}
            downloadButton.href = URL.createObjectURL(files[0]);
            downloadButton.download = (new Date()).getTime();
            status.appendChild(downloadButton);
            try{
                try{
                    if((localStorage.getItem(inputMode + "automaticdownload") == "true") || ((!localStorage.getItem(inputMode + "automaticdownload")) && (inputMode == "takephoto" || inputMode == "recordvideo"))){
                        downloadButton.click();
                    }
                }catch(e){
                    if(inputMode == "takephoto" || inputMode == "recordvideo"){
                        downloadButton.click();
                    }
                }
            }catch(e){}
            try{
                var previewDiv = document.createElement("div");
                previewDiv.style.border = "1px dotted #256aff";
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
                status.appendChild(previewDiv);
            }catch(e){}
        }
    }catch(e){}
    try{
        uploadStatusTopSetup();
        setUploadStatusTop(fileUploadStatus, fileUploadString, 0);
    }catch(e){}
    try{
        uploadStatusTop.addEventListener("click", function(e){
            try{
                scrollIntoViewFunc(subbox);
            }catch(e){}
        });
    }catch(e){}
    if(formData0){
        formData = formData0;
    }else{
        var formData = new FormData();
        if(filelink){
            formData.append("filelink", filelink);
        }else{
            for(var file in files){
                if(checkFile(files[file], subbox)){
                    formData.append("photovideo[]", files[file]);
                }
            }
            if(fileInput)fileInput.value = null;
        }
    }
    var ajax = new XMLHttpRequest();
    ajax.onload = function(){
        if(this.responseText.charAt(0) == '#')    {
            var responseArray = this.responseText.substring(1).split('|');
            var n = responseArray[0];
            var id = responseArray[1];
            var key = responseArray[2];
            try{
                if((localStorage.getItem("saveuploads") == "true") || (localStorage.getItem("saveuploads") == null)){
                    var uploadsStorage = localStorage.getItem("uploads");
                    if(uploadsStorage){
                        uploadsStorage = JSON.parse(uploadsStorage);
                    }else{
                        uploadsStorage = [];
                    }
                    uploadsStorage.push([n, id, key, dbid]);
                    localStorage.setItem("uploads", JSON.stringify(uploadsStorage));
                }
            }catch(e){}
            saveData("ids", [n, id, key], dbid);
            try{
                setUploadStatusTop(fileUploadStatus, fileUploadString, 1);
            }catch(e){}
            try{
                n_key[currentUploadID] = [n, id, key];
            }catch(e){}
            try{
                var fullLink = location.origin+"?view&n="+n;
                html = "<div class=\"boxs boxs2\"><span class=\"uploadedid\">" + getString("uploadedid") + "</span>: #" + n + "</div>";
                html += '<div class="boxs boxs2"><label for="link'+n+'"><img width="16" height="16" src="/images/link.svg"><span class="link title">' + getString("link") + '</span></label><input type="text" readonly value="' + fullLink + '" id="link'+n+'"><button class="buttons afteruploadbuttons" onclick="copyString(this.previousElementSibling.value, this.nextElementSibling)"><img width="32" height="32" src="/images/copy.svg"> <span class="copy">'+getString("copy")+'</span></button><span style="padding:1px;border:1px solid #00ff00;display:none;"></span></div>';
                html += "<button onclick=location.assign(\"/?view&n=" + n + "\") class=\"texts buttons afteruploadbuttons\"><img width=\"32\" height=\"32\" src=\"/images/viewicon.svg\">&nbsp;<span class=\"viewupload\">"+getString("viewupload")+"</span></button>";
                html += "<button onclick=window.open(\"/?view&n=" + n + "\") class=\"texts buttons afteruploadbuttons\"><img width=\"32\" height=\"32\" src=\"/images/newtab.svg\"></button>";
                html += "<br><br><div id=\"q"+n+"\" class=\"boxs boxs2\"></div>";
                var after2 = document.createElement("div");
                after2.innerHTML = html;
                after.appendChild(after2);
                var element = document.getElementById('q'+n);
                statusText.innerHTML += getDateTime() + "<br>" + typeImg + ' ' + typeString + '<span class="uploadcompleted">' + getString("uploadcompleted")+'</span>'+"\n(#" + n + ")";
                color = "#00ff00";
                if(currentUploadID == lastUploadID){
                    bottomProgressVisible(0);
                }
                addShareButton(after, fullLink);
            }catch(e){}
            try{
                if(attachFiles[currentUploadID]){
                    for(var i = 0; i < attachFiles[currentUploadID].length; i++){
                        if(attachFiles[currentUploadID][i]){
                            filesAttach(n, id, key, null, attachFiles[currentUploadID][i]);
                        }
                    }
                }
            }catch(e){}
            try{
                if(locationCoordinates[currentUploadID]){
                    for(var i = 0; i < locationCoordinates[currentUploadID].length; i++){
                        if(locationCoordinates[currentUploadID][i]){
                            uploadLocation(id, key, element, automaticLocation, locationCoordinates[currentUploadID][i]);
                        }
                    }
                }
            }catch(e){}
            try{
                if(descriptionTexts[currentUploadID]){
                    for(var i = 0; i < descriptionTexts[currentUploadID].length; i++){
                        if(descriptionTexts[currentUploadID][i] && descriptionTexts[currentUploadID][i] != ""){
                            uploadDescription(id,key,descriptionTexts[currentUploadID][i],null,button,element);
                        }
                    }
                }
            }catch(e){}
            try{
                if(voiceFiles[currentUploadID]){
                    for(var i = 0; i < voiceFiles[currentUploadID].length; i++){
                        if(voiceFiles[currentUploadID][i]){
                            uploadVoice(id,key,element,null,button,voiceFiles[currentUploadID][i]);
                        }
                    }
                }
            }catch(e){}
            unloadWarning--;
        }
        else    {
            try{
                setUploadStatusTop(fileUploadStatus, fileUploadString, -1);
            }catch(e){}
            statusText.innerHTML += getDateTime() + "<br>" + typeImg + ' ' + typeString + '<span class="uploadfailed">' + getString("uploadfailed") + '</span>';
            var errorDiv = document.createElement("div");
            errorDiv.style.border = "1px dotted #ff0000";
            errorDiv.innerText = this.responseText;
            statusText.appendChild(errorDiv);
            color = "#ff0000";
            if(currentUploadID == lastUploadID){
                bottomProgressVisible(0);
            }
            addRetryButton(function(){filesUpload(files, fileInput, inputMode, filelink, formData, typeImg, typeString, attachFiles[currentUploadID], locationCoordinates[currentUploadID], descriptionTexts[currentUploadID], voiceFiles[currentUploadID], dbid);}, status);
        }
        try{
            statusText.classList.add("statusText");
        }catch(e){}
        try{
            statusText.className = "statusText";
        }catch(e){}
        statusText.style.borderColor = color;
        if(currentUploadID == lastUploadID){
            bottomProgressBar.style.backgroundColor = color;
        }
        status.insertBefore(statusText, status.childNodes[0]);
    };
    ajax.onerror = function(){
        try{
            setUploadStatusTop(fileUploadStatus, fileUploadString, -1);
        }catch(e){}
        statusText.innerHTML += getDateTime() + "<br>" + typeImg + ' ' + typeString + '<span class="uploaderror">' + getString("uploaderror")+'</span>'+"\n(" + this.Error + ")";
        try{
            statusText.className = "statusText";
        }catch(e){}
        color = "#ff0000";
        statusText.style.borderColor = color;
        if(currentUploadID == lastUploadID){
            bottomProgressBar.style.backgroundColor = color;
            bottomProgressVisible(0);
        }
        status.insertBefore(statusText, status.childNodes[0]);
        addRetryButton(function(){filesUpload(files, fileInput, inputMode, filelink, formData, typeImg, typeString, attachFiles[currentUploadID], locationCoordinates[currentUploadID], descriptionTexts[currentUploadID], voiceFiles[currentUploadID], dbid);}, status);
    };
    try{
        uploadProgressSetup(ajax, statusDiv, currentUploadID);
    }catch(e){}
    ajax.open("POST", "/");
    ajax.send(formData);
}
var unloadWarning = 0;
function uploadFunction(input, inputMode){
    try{
        filesUpload(null, input, inputMode);
    }catch(e){
        try{
            input.parentNode.submit();
        }catch(e){}
    }
}
function buttonSetup(id0) {
    var input = document.getElementById(id0 + "input");
    function uploadIfInput(){
        if(input.value){
            uploadFunction(input, id0);
        }
    }
    input.addEventListener("change", function(){uploadIfInput();});
    uploadIfInput();
    var button = document.getElementById(id0 + "button");
    button.onclick = function(e){
        e.preventDefault();
        input.click();
    };
    input.tabIndex = "-1";
}
try{
    buttonSetup("takephoto");
    buttonSetup("recordvideo");
    buttonSetup("choosephotos");
    buttonSetup("choosevideos");
    buttonSetup("choosefiles");
}catch(e){}
try{
    var fileLinkForm = document.getElementById("filelinkform");
    var fileLink = document.getElementById("filelink");
    fileLinkForm.addEventListener("submit", function(e){
        e.preventDefault();
        filesUpload(null, null, "enterlink", fileLink.value);
        fileLink.value = "";
    });
}catch(e){}
var darkModeEnabled;
function setDarkMode(enabled) {
    var color;
    var backgroundColor;
    if(enabled)    {
        try{
            if(localStorage.getItem("darkcolor")){
                color = localStorage.getItem("darkcolor");
            }else{
                color = "#ffffff";
            }
            if(localStorage.getItem("darkbackgroundcolor")){
                backgroundColor = localStorage.getItem("darkbackgroundcolor");
            }else{
                backgroundColor = "#000000";
            }
        }catch(e){
            color = "#ffffff";
            backgroundColor = "#000000";
        }
        document.documentElement.style.colorScheme = "dark";
    }
    else    {
        try{
            if(localStorage.getItem("lightcolor")){
                color = localStorage.getItem("lightcolor");
            }else{
                color = "#000000";
            }
            if(localStorage.getItem("lightbackgroundcolor")){
                backgroundColor = localStorage.getItem("lightbackgroundcolor");
            }else{
                backgroundColor = "#ffffff";
            }
        }catch(e){
            color = "#000000";
            backgroundColor = "#ffffff";
        }
        document.documentElement.style.colorScheme = "light";
    }
    mainDiv.style.backgroundColor = backgroundColor;
    var elements = document.getElementsByClassName("texts");
    for(var i = 0; i < elements.length; i++)   {
        elements[i].style.color = color;
    }
    elements = document.getElementsByClassName("backgrounds");
    for(var i = 0; i < elements.length; i++)   {
        elements[i].style.backgroundColor = backgroundColor;
    }
    elements = document.getElementsByClassName("icons");
    for(var i = 0; i < elements.length; i++)   {
        elements[i].style.fill = color;
    }
    darkModeEnabled = enabled;
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
try{
    var topDiv = document.getElementById("top");
    var topScrollDiv = document.createElement("div");
    var topScrollDivHeight = topDiv.clientHeight / 2;
    topScrollDiv.style.position = "fixed";
    topScrollDiv.style.top = "0";
    topScrollDiv.style.left = "0";
    topScrollDiv.style.width = "100%";
    topScrollDiv.style.backgroundColor = "#256aff80";
    topScrollDiv.style.borderBottomWidth = "2px";
    topScrollDiv.style.borderBottomColor = "#256aff";
    topScrollDiv.style.transition = "0.1s";
    topScrollDiv.style.height = "0";
    topScrollDiv.style.overflowY = "hidden";
    topScrollDiv.style.overflowX = "auto";
    topScrollDiv.style.display = "flex";
    topScrollDiv.style.justifyContent = "space-evenly";
    var psImg = document.createElement("img");
    psImg.src = "/images/pedestriansos.svg";
    psImg.style.width = topScrollDivHeight + "px";
    psImg.style.height = topScrollDivHeight + "px";
    psImg.title = getString("gototop");
    try{
        psImg.classList.add("gototop");
    }catch(e){}
    try{
        psImg.className = "gototop";
    }catch(e){}
    psImg.onclick = function(){
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };
    psImg.style.cursor = "pointer";
    topScrollDiv.appendChild(psImg);
    function addTopButton(btnid){
        var topButton = document.createElement("button");
        topButton.classList.add("backgrounds");
        topButton.classList.add(btnid.replace("button", ""));
        topButton.title = getString(btnid.replace("button", ""));
        topButton.style.width = topScrollDivHeight + "px";
        topButton.style.height = topScrollDivHeight + "px";
        topButton.style.cursor = "pointer";
        topButton.style.borderRadius = "10%";
        topButton.style.padding = "0";
        topButton.style.border = "none";
        var btn = document.getElementById(btnid);
        var html = btn.innerHTML;
        topButton.innerHTML = html.substring(html.indexOf("<svg"), html.indexOf("</svg>")+1).replace('width="64" height="64"', 'width="'+topScrollDivHeight+'" height="'+topScrollDivHeight+'"');
        topButton.onclick = function(){
            btn.click();
        };
        topScrollDiv.appendChild(topButton);
    }
    addTopButton("takephotobutton");
    addTopButton("recordvideobutton");
    addTopButton("choosephotosbutton");
    addTopButton("choosevideosbutton");
    addTopButton("choosefilesbutton");
    addTopButton("camerabutton");
    mainDiv.appendChild(topScrollDiv);
    window.onscroll = function(){
        if(document.body.scrollTop > 0 || document.documentElement.scrollTop > 0){
            topScrollDiv.style.height = topScrollDivHeight + "px";
            topScrollDiv.style.borderBottomStyle = "solid";
        }else{
            topScrollDiv.style.height = "0";
            topScrollDiv.style.borderBottomStyle = "";
        }
    };
}catch(e){}
try{
    function inputsHaveContent(){
        var inputs = document.getElementsByTagName("input");
        for(var i = 0; i < inputs.length; i++){
            if((inputs[i].type == "text" || inputs[i].type == "url") && !inputs[i].readOnly && inputs[i].value != ""){
                try{
                    if(inputs[i].className == "notunloadwarning"){
                        continue;
                    }
                }catch(e){}
                return true;
            }
        }
        inputs = document.getElementsByTagName("textarea");
        for(var i = 0; i < inputs.length; i++){
            if(!inputs[i].disabled && inputs[i].value != ""){
                return true;
            }
        }
        return false;
    }
    function somethingInProgress(){
        return (unloadWarning || inputsHaveContent() || locationUploadArray.length);
    }
    window.addEventListener("beforeunload", function(e){
        if(somethingInProgress())    {
            e.preventDefault();
            e.returnValue = '';
        }
    });
    var dragOverlay = document.getElementById("dragoverlay");
    var uploadImageDiv = document.createElement("div");
    uploadImageDiv.style.width = "50%";
    uploadImageDiv.style.height = "50%";
    uploadImageDiv.style.backgroundImage = "url(/images/uploadicon.svg)";
    uploadImageDiv.style.backgroundRepeat = "no-repeat";
    uploadImageDiv.style.backgroundPosition = "center";
    uploadImageDiv.style.backgroundSize = "contain";
    uploadImageDiv.style.backgroundColor = "#ffffff80";
    uploadImageDiv.style.borderRadius = "8px";
    dragOverlay.appendChild(uploadImageDiv);
    var dragOverlay2 = document.createElement("div");
    dragOverlay2.className = "overlay";
    dragOverlay.appendChild(dragOverlay2);
    dragOverlay2.addEventListener("dragover", function(e){
        e.preventDefault();
    });
    dragOverlay2.addEventListener("drop", function(e){
        e.preventDefault();
        var files = [];
        var items = e.dataTransfer.items;
        for(var i = 0; i < items.length; i++){
            files.push(items[i].getAsFile());
        }
        filesUpload(files, null, "enterlink");
        dragOverlay.style.display = "none";
    });
    mainDiv.addEventListener("dragenter", function(e){
        if(e.dataTransfer.items[0].kind == "file")    {
            dragOverlay.style.display = "flex";
        }
    });
    dragOverlay2.addEventListener("dragleave", function(){
        dragOverlay.style.display = "none";
    });
    mainDiv.addEventListener("paste", function(e){
        if((e.target.tagName == "INPUT" || e.target.tagName == "TEXTAREA") && e.target.id != pasteInput.id){
            return;
        }
        var items = e.clipboardData.items;
        if(items && items[0] && items[0].kind == "string"){
            items[0].getAsString(function(s){
                if(!urlInput){
                    var urlInput = document.createElement("input");
                    urlInput.type = "url";
                }
                urlInput.value = s;
                if(!urlInput.checkValidity()){
                    return;
                }
                filesUpload(null, null, "enterlink", s);
            });
            return;
        }
        if(items[0].kind != "file"){
            return;
        }
        var files = [];
        for(var i = 0; i < items.length; i++){
            files.push(items[i].getAsFile());
        }
        filesUpload(files, "choosefiles");
    });
    try{
        var pasteElement = document.createElement("div");
        pasteElement.innerHTML = '<label for="pasteinput"><img width="32" height="32" src="/images/photovideo.svg" alt></label>';
        flexCenter(pasteElement);
        var pasteInput = document.createElement("input");
        pasteInput.type = "text";
        pasteInput.oninput = function(){this.value='';};
        pasteInput.style.caretColor = "transparent";
        pasteInput.placeholder = getString("pastefiles");
        pasteInput.className = "pastefiles";
        pasteInput.id = "pasteinput";
        pasteElement.appendChild(pasteInput);
        mainDiv.insertBefore(pasteElement, locationDiv);
        var br0 = document.createElement("br");
        mainDiv.insertBefore(br0, pasteElement.nextElementSibling);
        var br = document.createElement("br");
        mainDiv.insertBefore(br, br0);
    }catch(e){}
}catch(e){}
function copyString(string, copiedElement){
    navigator.clipboard.writeText(string);
    copiedElement.innerText = string;
    copiedElement.style.display = "inline";
}
try{
    var loaderStyle = document.createElement("link");
    loaderStyle.rel = "stylesheet";
    loaderStyle.href = "/styles/loader.css";
    document.head.appendChild(loaderStyle);
}catch(e){}
try{
    var iframeOverlayDiv = document.getElementById("iframeOverlayDiv");
    var overlayIframe = document.getElementById("overlayIframe");
    var closeiframeoverlay = document.getElementById("closeiframeoverlay");
    try{
        overlayIframe.style.width = "100%";
        overlayIframe.style.height = "100%";
        overlayIframe.style.border = "none";
        iframeOverlayDiv.style.zIndex = "1";
        iframeOverlayDiv.style.flexDirection = "column";
    }catch(e){}
    function openIframeOverlay(src){
        iframeOverlayDiv.style.display = "flex";
        if(overlayIframe.src != window.location.origin+src){
            overlayIframe.src = src;
        }
        document.body.style.overflowY = "hidden";
    }
    function linkButtonSetup(id, url0, img, string){
        var button = document.getElementById(id);
        var url = "/app/" + url0 + "/";
        button.onclick = function(){
            openIframeOverlay(url);
        };
        button.innerHTML = img + '&#160;<span class="' + string + '">' + getString(string) + '</span>';
        button.classList.remove("hiddenonload");
        button = document.getElementById(id + "1");
        button.innerHTML = '<svg width="64" height="64" viewBox="0 0 256 256" class="icons"><g transform="translate(0 256) scale(.1 -.1)"><path d="m270 2516c-111-30-179-90-215-187-19-53-20-79-20-1049s1-996 20-1050c13-37 37-72 70-105s68-57 105-70c54-19 80-20 1050-20s996 1 1050 20c74 27 148 101 175 175 19 54 20 80 20 1050s-1 996-20 1050c-25 70-101 147-170 175-49 19-76 20-1035 22-763 1-995-1-1030-11zm2001-96c56-16 101-51 129-100l25-45v-995-995l-25-45c-28-49-73-84-129-100-49-14-1933-14-1982 0-56 16-101 51-129 100l-25 45v995 995l25 44c14 24 37 53 51 63 64 48 43 47 1064 48 614 0 973-4 996-10z"/></g>';
        button.href = url;
        button.classList.remove("hiddenonload");
        button = document.getElementById(id + "2");
        button.innerHTML = '<svg width="64" height="64" viewBox="0 0 512 512" class="icons"><g transform="translate(0 512) scale(.1 -.1)"><path d="m685 4428c-3-7-4-852-3-1878l3-1865h1875 1875l3 938 2 937h-190-190v-750-750h-1500-1500v1500 1500h750 750v190 190h-935c-739 0-937-3-940-12z"/><path d="m3210 4165 265-265-528-528c-290-290-527-532-527-537 0-6 92-102 205-215l205-205 738 738c174 174 321 317 327 317 5 0 130-120 277-267l268-268v748 747h-747-748l265-265z"/></g></svg>';
        button.href = url;
        button.target = "_blank";
        button.classList.remove("hiddenonload");
    }
    closeiframeoverlay.style.width = "100%";
    closeiframeoverlay.style.backgroundColor = "#256affc0";
    closeiframeoverlay.innerHTML = '<span style="font-size:32px;font-weight:bold;color:#ec0400;">&#215;</span>';
    closeiframeoverlay.onclick = function(){
        iframeOverlayDiv.style.display = "none";
        document.body.style.overflowY = "";
        var videoTag = overlayIframe.contentWindow.document.getElementsByTagName("video")[0];
        if(videoTag){
            videoTag.pause();
        }
    };
    linkButtonSetup("myUploadsButton", "myuploads",
    '<svg width="64" height="64" viewBox="0 0 256 256" class="icons"><g transform="translate(0 256) scale(.1 -.1)"><path d="m705 2254c-326-72-588-347-646-680-16-93-6-270 21-364 94-328 381-569 723-605l67-7v31c0 30-2 31-42 31-24 0-79 9-123 19-355 86-595 390-597 756-2 305 159 563 441 704 142 72 357 96 515 57 190-46 362-167 472-333l36-55-176-177c-161-163-176-181-176-213 0-72 73-118 128-82 15 10 73 63 130 117l102 100v-240-240l-49-69c-98-140-244-252-398-305-31-10-58-19-60-19-1 0-3 38-3 85 0 89-15 137-45 149-37 14-86 6-110-19-28-27-29-54-25-410 2-173 8-197 56-215 39-15 1416-13 1449 2 51 23 55 45 55 327v259l-26 31c-19 23-34 31-59 31-88 0-95-20-95-275v-205h-600-600v95c0 88 1 95 20 95 32 0 150 48 222 91 76 44 172 129 230 202l38 49v-102c0-134 19-169 92-170 28 0 42 7 62 31l26 31v396 396l113-111c66-65 123-113 140-117 32-8 81 14 97 43 28 53 19 66-197 283-194 195-210 208-244 208-24 0-45-8-63-25-28-26-36-22-11 5 15 16 11 24-46 99-104 139-238 234-409 292-85 29-109 32-230 35-95 3-156-1-205-12z"/><path d="m762 1919c-125-62-177-214-116-337 94-188 364-188 458 0 32 64 35 152 7 213-21 46-88 111-137 131-52 22-161 18-212-7z"/><path d="m701 1405c-136-38-227-149-239-291-4-53-2-64 16-82 39-39 87-43 425-40 304 3 324 4 357 24 34 19 35 22 38 88 5 120-58 220-176 278-65 32-69 33-217 35-109 2-165-1-204-12z"/></g></svg>'
    , "myuploads");
    linkButtonSetup("localstorageButton", "localstorage",
    '<svg width="64" height="64" class="icons" viewBox="0 0 500 500"><g transform="translate(0 500) scale(.1 -.1)"><path d="m2165 4690c-314-22-639-70-839-125-140-38-293-93-381-137-144-72-260-169-303-254-11-22-25-58-31-82l-12-43-3-1502c-2-826 1-1537 5-1579l8-77 25-48c32-65 106-145 175-192 160-109 407-198 716-260 217-44 446-70 729-83l249-12 251 12c543 26 973 111 1272 252 127 60 207 114 271 183 60 66 92 130 103 206 4 31 7 745 7 1586l-2 1530-23 57c-30 74-78 136-155 198l-62 51-110 54c-60 29-150 68-200 85-218 76-504 132-845 165l-165 16-275 4c-151 2-333 0-405-5zm820-306c437-40 820-140 1008-263 75-49 117-92 117-119 0-28-85-97-176-144-220-114-524-189-944-234l-165-18h-330l-330 1-155 17c-314 34-550 82-752 152-171 60-314 140-348 196-11 18-20 36-20 40 0 21 76 88 142 125 207 119 572 210 988 247 96 9 209 17 250 19 173 6 557-4 715-19zm-1988-828c158-68 398-137 588-171 161-29 383-54 568-66l182-12 590 12 135 15c421 47 719 119 975 235 37 17 69 31 71 31s4-138 4-307v-307l-54-51-53-51-94-46c-274-135-718-216-1272-234l-202-6-200 11c-110 6-261 18-335 26-455 52-816 166-962 306l-48 45v308 308l13-5c6-3 49-21 94-41zm-39-985c213-107 578-197 962-237l155-16 694-10 198 16c109 10 281 31 382 47 283 46 484 103 670 190 46 21 85 39 87 39s4-136 4-302v-303l-19-31c-57-93-349-215-665-279-280-56-464-74-811-82l-280-6-175 12c-280 19-519 55-737 112-259 66-478 172-519 250l-14 28v301c0 165 2 300 5 300s31-13 63-29zm172-1075c112-41 364-100 545-130 215-34 444-55 699-62l211-6 190 11c360 22 604 56 867 122 174 43 263 73 386 130l82 38v-309-308l-25-31c-31-36-135-103-224-143-99-44-307-104-476-137-176-35-381-57-654-72l-196-10-175 6c-374 13-694 53-930 116-228 61-411 144-497 225l-43 41v311 311l83-38c45-21 116-51 157-65z"/></g></svg>'
    , "localstorage");
    linkButtonSetup("settingsbutton", "settings",
    '<svg width="64" height="64" viewBox="0 0 64 64" class="icons"><g transform="translate(0 64) scale(.1 -.1)"><path d="m257 584c-4-4-7-22-7-40 0-23-7-36-26-49-23-15-29-15-64-1l-39 15-64-112 32-26c20-17 31-35 31-51s-11-34-31-51l-32-26 32-56 32-57 36 15c19 8 38 15 42 15 20-1 45-35 50-67l6-38h65 65l6 38c5 32 30 66 50 67 4 0 23-7 42-15l36-15 64 112-32 25c-42 33-42 73 0 106l32 25-32 56-32 55-39-15c-35-14-41-14-64 1-18 12-26 27-28 53l-3 37-60 3c-34 2-64 0-68-4zm128-199c36-35 35-97-1-130-61-57-154-17-154 65 0 56 34 90 90 90 30 0 47-6 65-25z"/></g></svg>'
    , "settings");
}catch(e){}
try{
    function setLanguage(lang,get)  {
        var ajax = new XMLHttpRequest();
        ajax.open("GET", "/json/languages/main/" + lang + ".json");
        ajax.onload = function()    {
            if(this.status == 200){
                document.documentElement.lang = lang;
                var json = JSON.parse(this.responseText);
                strings = json;
                for(var key in json) {
                    var elements = document.getElementsByClassName(key);
                    if(elements!=null){
                        for(var element in elements){
                            if((elements[element]!=null) && (elements[element].tagName == "IMG" || elements[element].tagName == "BUTTON")){
                                elements[element].title = "";
                            }
                        }
                    }
                }
                for(var key in json) {
                    var elements = document.getElementsByClassName(key);
                    if(elements!=null){
                        for(var element in elements){
                            if(elements[element]!=null){
                                if(elements[element].tagName == "INPUT" || elements[element].tagName == "TEXTAREA"){
                                    if(elements[element].placeholder.includes("...")){
                                        elements[element].placeholder=json[key]+"...";
                                    }else{
                                        elements[element].placeholder=json[key];
                                    }
                                }else if(elements[element].tagName == "IMG" || elements[element].tagName == "BUTTON"){
                                    if(elements[element].title){
                                        elements[element].title+=" | "+json[key];
                                    }else{
                                        elements[element].title=json[key];
                                    }
                                }else{
                                    elements[element].innerText=json[key];
                                }
                            }
                        }
                    }
                }
                document.title = strings["title"];
                try{
                    consoleWarning(strings["warning"],strings["consolewarning"]);
                }catch(e){}
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
            if(lang != getCookie("lang")){
                setCookie("lang", lang, 1000);
            }
        };
        ajax.send();
    }
    function onLanguageChange(){
        lang = navigator.language.substring(0, 2);
        setLanguage(lang);
        if(typeof languageSelect != "undefined")languageSelect.value = lang;
    }
    var lang;
    function language(){
        lang = localStorage.getItem("lang");
        if(lang == null){
            lang = navigator.language;
            lang = lang.substring(0, 2);
            window.onlanguagechange = function(){
                onLanguageChange();
            };
        }
        setLanguage(lang);
    }
    language();
    document.getElementById("langform").remove();
}catch(e){}
try{
    var isOffline;
    function whenOffline(){
        try{
            topScrollDiv.style.backgroundColor = "#ec040080";
            topScrollDiv.style.borderBottomColor = "#ec0400";
        }catch(e){}
        if(isOffline){
            isOffline.style.display = "block";
            return;
        }
        isOffline = document.createElement("div");
        isOffline.style.border = "2px solid #ff0000";
        var offlineImg = document.createElement("img");
        offlineImg.width = "64";
        offlineImg.height = "64";
        offlineImg.src = "/images/offline.svg";
        isOffline.appendChild(offlineImg);
        var offlineText = document.createElement("span");
        offlineText.innerText = getString("offline");
        offlineText.style.fontWeight = "bold";
        offlineImg.style.verticalAlign = "middle";
        offlineText.style.verticalAlign = "middle";
        isOffline.appendChild(offlineText);
        mainDiv.insertBefore(isOffline, mainDiv.children[1]);
    }
    window.addEventListener("offline", whenOffline);
    window.addEventListener("online", function(){
        isOffline.style.display = "none";
        try{
            topScrollDiv.style.backgroundColor = "#256aff80";
            topScrollDiv.style.borderBottomColor = "#256aff";
        }catch(e){}
    });
    if(!navigator.onLine){
        whenOffline();
    }
}catch(e){}
try{
    var matchmedia = window.matchMedia("(prefers-color-scheme: dark)");
    function defaultdarkmode()  {
        setDarkMode(matchmedia.matches);
        matchmedia.onchange = function(e){
            setDarkMode(e.matches);
        };
    }
    function darkmode(){
        if(localStorage.getItem("darkmode") == null)    {
            defaultdarkmode();
        }
        else    {
            setDarkMode(localStorage.getItem("darkmode")=="true");
            matchmedia.onchange=function(){};
        }
    }
    darkmode();
}catch(e){}
try{
    window.addEventListener("storage", function(){
        try{
            darkmode();
        }catch(e){}
        try{
            language();
        }catch(e){}
    });
}catch(e){}
try{
    if(localStorage.getItem("mobilewebappmodemainapppage") == "true"){
        var metaApp = document.createElement("meta");
        metaApp.name = "mobile-web-app-capable";
        metaApp.content = "yes";
        document.head.appendChild(metaApp);
    }
}catch(e){}
try{
    if("serviceWorker" in navigator){
        navigator.serviceWorker.register("/app/offlineserviceworker.js");
    }
}catch(e){}
try{
    setCookie("timezone", (new Date()).getTimezoneOffset(), 1000);
}catch(e){}