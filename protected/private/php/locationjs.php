<?php
    if(isset($_POST["a"])){
        define("imgext", "png");
    }
    else if(!defined("imgext")){
        define("imgext", "svg");
    }
?>
<div style="border:2px solid #0000ff;padding:2px;">
    <span id="locationstatus"></span>
    <img id="locationimg" width="16" height="16" src="/images/waitinglocation.<?php echo imgext; ?>"> <?php echoString("mylocation"); ?>:
    <div id="currentlocation"></div>
    <input type="checkbox" id="continuousupdate">
    <label for="continuousupdate">
        <img width="16" height="16" src="/images/currentlocation.<?php echo imgext; ?>">&nbsp;<span><?php echoString("currentlocation"); ?></span>
    </label>
    <input type="checkbox" id="highaccuracy" checked>
    <label for="highaccuracy">
        <img width="16" height="16" src="/images/locationhighaccuracy.<?php echo imgext; ?>">&nbsp;<span><?php echoString("locationhighaccuracy"); ?></span>
    </label>
    <div id="locationerrordiv" style="display:none;border:2px solid #ff0000"></div>
    <button type="button" onclick="uploadLocation0()" id="uploadlocation"><img width="16" height="16" src="/images/uploadicon.<?php echo imgext; ?>"> <?php echoString("upload"); ?></button>
    <div id="locationuploadstatus0"></div>
</div>
<script>
    var id = "<?php echo $id; ?>";
    var key = "<?php echo $key; ?>";
    try{
        var locationDiv = document.getElementById("currentlocation");
        var locationErrorDiv = document.getElementById("locationerrordiv");
        var uploadLocationButton = document.getElementById("uploadlocation");
        var locationUploadStatus0 = document.getElementById("locationuploadstatus0");
        var locationImage = document.getElementById("locationimg");
        var locationStatus = document.getElementById("locationstatus");
    }catch(e){}
    var latitude;
    var longitude;
    var altitude;
    var accuracy;
    var altitudeAccuracy;
    var locationTime;
    var uploadLocationAfterGot;
    <?php
        if((isset($_POST["location"]) && $_POST["location"] == 1)/* && $uploadLocationAfterGot*/){
            echo '
                uploadLocationAfterGot = 1;
            ';
        }
    ?>
    function locationGot(coordinates){
        try{
            locationStatus.innerHTML = "<?php echoString("detected") ?>";
            locationImage.src = "/images/location.<?php echo imgext; ?>";
        }catch(e){}
        latitude = coordinates.coords.latitude;
        longitude = coordinates.coords.longitude;
        altitude = coordinates.coords.altitude;
        accuracy = coordinates.coords.accuracy;
        altitudeAccuracy = coordinates.coords.altitudeAccuracy;
        locationTime = coordinates.timestamp;
        try{
            locationDiv.innerText = latitude + ", " + longitude + "; " + altitude + "; " + accuracy + "; " + altitudeAccuracy + "; " + locationTime;
            uploadLocationButton.disabled = 0;
        }catch(e){}
        if(uploadLocationAfterGot){
            uploadLocation0();
            uploadLocationAfterGot = 0;
        }
    }
    function locationError(error)    {
        try{
            locationStatus.innerHTML = "<?php echoString("unavailable") ?>";
            locationImage.src = "/images/nolocation.<?php echo imgext; ?>";
        }catch(e){}
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
        button.innerHTML = '<img width="16" height="16" src="/images/retry.<?php echo imgext; ?>">&nbsp;<span><?php echoString("retry"); ?></span>';
        button.addEventListener("click", function(){
            getLocation(continuousUpdateCheckbox.checked, highAccuracyCheckbox.checked);
        });
        locationErrorDiv.appendChild(button);
        locationErrorDiv.style.display = "block";
    }
    function addLocationUploadDiv(color, locationString, text){
        try{
            var div = document.createElement("div");
            div.style.border = "1px solid " + color;
            div.innerText += text + "\n" + locationString;
            locationUploadStatus0.appendChild(div);
        }catch(e){}
    }
    function uploadLocation0(){
        if(!uploadLocationAfterGot && !continuousUpdateCheckbox.checked){
            uploadLocationAfterGot = 1;
            getLocation(false, highAccuracyCheckbox.checked);
            return;
        }
        var latitude0 = latitude;
        var longitude0 = longitude;
        var altitude0 = altitude;
        var accuracy0 = accuracy;
        var altitudeAccuracy0 = altitudeAccuracy;
        var locationTime0 = locationTime;
        var locationString = latitude0 + ", " + longitude0 + "; " + altitude0 + "; " + accuracy0 + "; " + altitudeAccuracy0 + "; " + locationTime0;
        addLocationUploadDiv("#ffff00", locationString, "<?php echoString("uploading"); ?>");
        var ajax = new XMLHttpRequest();
        ajax.onload = function(){
            if(this.responseText == "1"){
                addLocationUploadDiv("#00ff00", locationString, "<?php echoString("uploadcompleted"); ?>");
            }else{
                addLocationUploadDiv("#ff0000", locationString, "<?php echoString("uploadfailed"); ?>");
            }
        };
        ajax.onerror = function(){
            addLocationUploadDiv("#ff0000", locationString, "<?php echoString("uploaderror"); ?>");
        };
        ajax.open("POST", "/");
        ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        ajax.send("id="+encodeURIComponent(id)+"&key="+encodeURIComponent(key)+"&latitude="+encodeURIComponent(latitude0)+"&longitude="+encodeURIComponent(longitude0)+"&altitude="+encodeURIComponent(altitude0)+"&accuracy="+encodeURIComponent(accuracy0)+"&altitudeAccuracy="+encodeURIComponent(altitudeAccuracy0)+"&location_time="+encodeURIComponent(locationTime0));
    }
    var watchPositionID;
    function getLocation(continuousUpdate, highAccuracy){
        if(watchPositionID){
            navigator.geolocation.clearWatch(watchPositionID);
        }
        if(continuousUpdate){
        watchPositionID = navigator.geolocation.watchPosition(locationGot, locationError, {enableHighAccuracy: highAccuracy});
        }else{
            navigator.geolocation.getCurrentPosition(locationGot, locationError, {enableHighAccuracy: highAccuracy});
        }
        try{
            locationStatus.innerHTML = "<?php echoString("detecting") ?>";
            locationImage.src = "/images/detectinglocation.<?php echo imgext; ?>";
        }catch(e){}
        locationErrorDiv.style.display = "none";
    }
    var continuousUpdateCheckbox = document.getElementById("continuousupdate");
    var highAccuracyCheckbox = document.getElementById("highaccuracy");
    function checkboxLocationSettings(){
        if(continuousUpdateCheckbox.checked){
            getLocation(continuousUpdateCheckbox.checked, highAccuracyCheckbox.checked);
        }else if(watchPositionID){
            navigator.geolocation.clearWatch(watchPositionID);
        }
    }
    continuousUpdateCheckbox.onchange = function(){
        checkboxLocationSettings();
    };
    highAccuracyCheckbox.onchange = function(){
        checkboxLocationSettings();
    };
    if(navigator.geolocation){
        if(uploadLocationAfterGot){
            getLocation(continuousUpdateCheckbox.checked, highAccuracyCheckbox.checked);
        }
    }else{
        locationErrorDiv.innerText = "Geolocation not supported by this browser.";
        locationErrorDiv.style.display = "block";
        try{
            locationStatus.innerHTML = "<?php echoString("unavailable") ?>";
            locationImage.src = "/images/nolocation.<?php echo imgext; ?>";
        }catch(e){}
    }
</script>