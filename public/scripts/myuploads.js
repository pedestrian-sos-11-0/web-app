try{
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
    var strings = null;
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
                var json = JSON.parse(this.responseText);
                strings = json;
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
                                    if(elements[element].title && elements[element].title.indexOf("!") == -1){
                                        elements[element].title+=" | "+json[key];
                                    }else{
                                        elements[element].title=json[key];
                                    }
                                }else{
                                    elements[element].innerText=json[key];
                                }
                            };
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
    var mainDiv = document.getElementById("main");
    var matchmedia = window.matchMedia("(prefers-color-scheme: dark)");
    var darkModeEnabled;
    function setDarkMode(enabled){
        if(enabled){
            document.documentElement.style.colorScheme = "dark";
            mainDiv.style.backgroundColor = "#000000";
        }else{
            document.documentElement.style.colorScheme = "light";
            mainDiv.style.backgroundColor = "#ffffff";
        }
        darkModeEnabled = enabled;
    }
    function defaultdarkmode()  {
        setDarkMode(matchmedia.matches);
        matchmedia.onchange = function(e){setDarkMode(e.matches);};
    }
    function darkMode(){
        if(localStorage.getItem("darkmode") != null){
            matchmedia.onchange = function(){};
            setDarkMode(localStorage.getItem("darkmode") == "true");
        }else{
            defaultdarkmode();
        }
    }
    darkMode();
    window.addEventListener("storage", function(){
        try{
            darkMode();
        }catch(e){}
        try{
            language();
        }catch(e){}
    });
}catch(e){}
var uploads = JSON.parse(localStorage.getItem("uploads"));
try{
    uploads.reverse();
}catch(e){}
var myuploadsDiv = document.getElementById("myuploads");
var uploadsFragment;
var div;
var previousButton = document.getElementById("previousButton");
var nextButton = document.getElementById("nextButton");
var uploadsToShow;
function addShareButton(element, fullurl){
    try{
        var shareButton = document.createElement("button");
        shareButton.innerHTML = "<img width=\"32\" height=\"32\" src=\"/images/share.svg\"> <span class=\"share\">"+getString("share")+"</span>";
        shareButton.classList.add("buttons", "smallbuttons");
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
var maxFileSize = 25000000;
var maxFilesNum = 10;
var maxDescriptionLength = 100000;
var allowedFileExtensions = ["bmp", "gif", "x-icon", "jpg", "jpeg", "png", "tiff", "webp", "x-msvideo", "mpeg", "ogg", "mp2t", "webm", "3gpp", "3gpp2", "mp4"];
var mapsUploadStatusFullscreen;
var unloadWarning = 0;
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
window.addEventListener("beforeunload", function(e){
    if(unloadWarning || inputsHaveContent())    {
        e.preventDefault();
        e.returnValue = '';
    }
});
function getFullscreenButton(element){
    var btn = document.createElement("button");
    btn.innerHTML = '<img width="32" height="32" src="/images/fullscreen.svg">';
    element.onfullscreenchange = function(){
        if(!document.fullscreenElement){
            // document.exitFullscreen();
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
            // element.requestFullscreen();
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
            // try{
            //     element.style.backgroundColor = "initial";
            // }catch(e){}
            // try{
            //     element.style.display = "block";
            //     element.children[1].style.height = "75vh";
            // }catch(e){}
        }else{
            element.requestFullscreen();
            // try{
            //     if(darkModeEnabled){
            //         element.style.backgroundColor = "#000";
            //     }else{
            //         element.style.backgroundColor = "#fff";
            //     }
            // }catch(e){}
            // try{
            //     element.style.display = "flex";
            //     element.style.flexDirection = "column";
            //     element.children[1].style.height = "100%";
            // }catch(e){}
        }
    };
    try{
        btn.classList.add("buttons", "smallbuttons");
    }catch(e){}
    try{
        btn.className = "buttons smallbuttons";
    }catch(e){}
    btn.style.display = "none";
    return btn;
}
function mapsButton(btn){
    var fullscreen = btn.nextElementSibling;
    var iframe = fullscreen.parentNode.nextElementSibling;
    var upload = iframe.nextElementSibling.children[0];
    var uploadStatus = upload.nextElementSibling;
    if(iframe.style.display != "block"){
        iframe.style.display = "block";
        upload.onclick = function(){
            // uploadLocation(id, key, document.getElementById('q'+n), iframe.document.getElementById("coordinates").innerText.split(", "));
            // locationPreUpload(currentUploadID, iframe.document.getElementById("coordinates").innerText.split(", "), statusDiv);
            // console.log(iframe.contentWindow.document.getElementById("coordinates").innerText.split(", "));
            // locationPreUpload(btn.getAttribute("currentUploadID"), iframe.contentWindow.coordinates, document.getElementById("statusDiv"+btn.getAttribute("currentUploadID")));
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
function getMapsDiv(currentUploadID, statusDiv, status, id, key){
    var maps = document.createElement("div");
    // maps.innerHTML = '<button class="buttons smallbuttons" onclick=mapsButton(this, "'+currentUploadID+'", '+statusDiv+')><img width="32" height="32" src="/images/maps.svg"> <span class="maps">'+getString("maps")+'</span></button><iframe style="display: none;width: 100%;height: 75vh;"></iframe><button style="display:none;" class="buttons smallbuttons"><img width="32" height="32" src="/images/uploadicon.svg"> <span class="upload">'+getString("upload")+'</span></button>';
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
    maps.innerHTML = '<div><button class="buttons smallbuttons" onclick="mapsButton(this)" '+attributes+'><img width="32" height="32" src="/images/maps.svg"> <span class="maps">'+getString("maps")+'</span></button></div><iframe style="display: none;width: 100%;height: 75vh;background-color:#fff;"></iframe><div><button style="display:none;" class="buttons smallbuttons"><img width="32" height="32" src="/images/uploadicon.svg"> <span class="upload">'+getString("upload")+'</span></button><div style="display:none;visibility:hidden;padding:4px;border-radius:8px;"><img style="vertical-align:middle;" width="32" height="32" src="/images/uploadicon.svg">&#160;<img style="vertical-align:middle;" width="32" height="32" src="/images/location.svg"></div></div>';
    try{
        maps.children[0].appendChild(getFullscreenButton(maps));
    }catch(e){}
    return maps;
}
function getDateTime(millisecond){
    try{
        if(millisecond){
            var d = new Date(millisecond);
        }else{
            var d = new Date();
        }
        return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    }catch(e){
        return "";
    }
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
function uploadProgressSetup(ajax, div){
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
function getProgressPercent(e){
    return ((e.loaded / e.total) * 100).toFixed(2) + '%';
}
function getProgressText(progressPercent, e){
    return progressPercent + " (" + e.loaded + "B / " + e.total + "B)";
}
function getLocationString(data){
    if(data || (data === 0)){
        return data;
    }else{
        return "-";
    }
}
function uploadString(n, key, post, location, automaticLocation, value, element, input, button) {
    /*if((automaticLocation && location && !geolocationSupported) || !location){
        unloadWarning++;
    }*/
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
            // try{
            //     if(!location && storage_ID){
            //         var uploadsArray = JSON.parse(localStorage.getItem("uploads"));
            //         uploadsArray[storage_ID][2] = false;
            //         localStorage.setItem("uploads", JSON.stringify(uploadsArray));
            //     }
            // }catch(e){}
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
            // if(!location)    {
            //     input.disabled = 0;
            //     button.disabled = 0;
            // }
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
        // if(!location)    {
        //     input.disabled = 0;
        //     button.disabled = 0;
        // }
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
function uploadLocation(n, key, element, automaticLocation, coordinates)   {
    uploadString(n, key, "&latitude="+encodeURIComponent(coordinates[0])+"&longitude="+encodeURIComponent(coordinates[1])+"&altitude="+encodeURIComponent(coordinates[2])+"&accuracy="+encodeURIComponent(coordinates[3])+"&altitudeAccuracy="+encodeURIComponent(coordinates[4])+"&location_time="+encodeURIComponent(coordinates[5]), true, automaticLocation, getLocationString(coordinates[0]) + ", " + getLocationString(coordinates[1]) + "; " + getLocationString(coordinates[2]) + "; " + getLocationString(coordinates[3]) + "; " + getLocationString(coordinates[4]) + "; " + getLocationString(coordinates[5]), element);
}
function uploadDescription(n, key, descriptionValue, input, button, element)    {
    uploadString(n, key, "&description="+encodeURIComponent(descriptionValue), false, null, descriptionValue, element, input, button);
}
var maxVoiceFileSize = 25000000;
function uploadVoice(n, key, statusElement, voiceinput, button, formdata0/*voicefiles0*/)  {
    /*if(voicefiles0){
        voicefiles = voicefiles0;
    }else{
        voicefiles = voiceinput.files[0];
    }*/
    if(!formdata0){
        var voicefiles = voiceinput.files[0];
        if(!voicefiles){
            return;
        }
        if(voicefiles.size > maxVoiceFileSize){
            alert(getString("maxvoicefilesize")+": "+(maxVoiceFileSize/1000000)+"MB");
            return;
        }
    }
    unloadWarning++;
    // button.disabled = 1;
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
            // try{
            //     if(storage_ID){
            //         var uploadsArray = JSON.parse(localStorage.getItem("uploads"));
            //         uploadsArray[storage_ID][3] = false;
            //         localStorage.setItem("uploads", JSON.stringify(uploadsArray));
            //     }
            // }catch(e){}
        }
        else    {
            div.innerHTML = getDateTime() + "<br>" + img+text+'<span class="uploadfailed">'+getString("uploadfailed")+'</span>'+"\n(" + this.responseText + ")";
            div.style.borderColor = "#ff0000";
            // button.disabled = 0;
            addRetryButton(function(){uploadVoice(n, key, statusElement, voiceinput, button, formData/*formdata0*//*voicefiles0*/);}, statusElement);
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
        // button.disabled = 0;
        addRetryButton(function(){uploadVoice(n, key, statusElement, voiceinput, button, formData/*formdata0*//*voicefiles0*/);}, statusElement);
    };
    try{
        uploadProgressSetup(ajax, div);
    }catch(e){}
    ajax.open("POST", "/");
    ajax.send(formData);
}
function checkFile(file, element){
    try{
        if(file.size > maxFileSize)    {
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
    /*if(!files.length){
        return;
    }
    formData = new FormData();
    formData.append("n", n);
    formData.append("key", key);
    for(var i = 0; i < files.length; i++){
        if(checkFile(files[i], element)){
            formData.append("photovideo[]", files[i]);
        }
    }*/
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
            addRetryButton(function(){filesAttach(n, id, key, files, formData, element/*formdata0*/);}, element);
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
        addRetryButton(function(){filesAttach(n, id, key, files, formData, element/*formdata0*/);}, element);
    };
    try{
        uploadProgressSetup(ajax, div);
    }catch(e){}
    ajax.open("POST", "/");
    ajax.send(formData);
}
function loadMedia(id, myUploadBox){
    var ajax = new XMLHttpRequest();
    ajax.onload = function(){
        var jsonArray = JSON.parse(this.response);
        if(jsonArray[1].length > 1){
            return;
        }
        var previewDiv = document.createElement("div");
        previewDiv.style.border = "1px dotted #256aff";
        previewDiv.style.margin = "1px";
        previewDiv.style.padding = "1px";
        try{
            previewDiv.style.display = "flex";
            previewDiv.style.justifyContent = "center";
        }catch(e){}
        if(jsonArray[3] == "image"){
            previewDiv.innerHTML = '<img style="max-width:100%;min-height:25vh;max-height:75vh;object-fit:contain;" src="/'+jsonArray[1]+'">';
        }else{
            previewDiv.innerHTML = '<video style="max-width:100%;min-height:25vh;max-height:75vh;" controls src="/'+jsonArray[1]+'"></video>';
        }
        myUploadBox.appendChild(previewDiv);
    };
    ajax.open("GET", "/?view&raw=1&n=" + id);
    ajax.send();
}
function loadSingleUpload(uploadsData, i){
    var myUploadBox = document.createElement("div");
    myUploadBox.innerHTML = '';
    var myUploadID = document.createElement("div");
    myUploadID.style.borderBottom = "1px solid #256aff";
    myUploadID.style.marginBottom = "1px";
    myUploadID.innerText = "#" + uploadsData[0];
    myUploadBox.appendChild(myUploadID);
    var myUploadView = document.createElement("a");
    myUploadView.classList.add("buttons", "smallbuttons");
    myUploadView.innerHTML = '<img width="32" height="32" src="/images/viewicon.svg"> <span class="viewupload">' + getString("viewupload") + '</span> <img width="32" height="32" src="/images/newtab.svg">';
    myUploadView.target = "_blank";
    myUploadView.href = "/?view&n=" + uploadsData[0];
    myUploadBox.appendChild(myUploadView);
    var myUploadDownload = document.createElement("a");
    myUploadDownload.classList.add("buttons", "smallbuttons");
    myUploadDownload.innerHTML = '<img width="32" height="32" src="/images/download.svg"> <span class="download">' + getString("download") + '</span>';
    myUploadDownload.download = "";
    myUploadDownload.href = "?download=" + uploadsData[0];
    myUploadBox.appendChild(myUploadDownload);
    // addShareButton(myUploadBox, window.location.href.replace(window.location.hash, "")+"?view&n="+uploadsData[0]);
    addShareButton(myUploadBox, location.origin+"?view&n="+uploadsData[0]);
    var element = document.createElement("div");
    element.id = 'i'+i;
    myUploadBox.appendChild(element);
    var filesUpload = document.createElement("button");
    filesUpload.innerHTML = '<img width="32" height="32" src="/images/photovideo.svg"> <span class="choosefiles">'+getString("choosefiles")+'</span>';
    filesUpload.classList.add("buttons", "smallbuttons");
    filesUpload.id = "fb"+i;
    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*,video/*";
    fileInput.multiple = "1";
    fileInput.id = 'f'+i;
    fileInput.oninput = function(){
        var i = this.id.substring(1);
        var element = document.getElementById('i'+i);
        filesAttach(uploadsData[0], uploadsData[1], uploadsData[2], this.files, null, element);
    };
    fileInput.hidden = 1;
    myUploadBox.appendChild(fileInput);
    filesUpload.onclick = function(){
        document.getElementById("f"+this.id.substring(2)).click();
    }
    myUploadBox.insertBefore(filesUpload, element);
    // if(uploadsData[2]){
        var descriptionForm = document.createElement("form");
        descriptionForm.innerHTML = '<textarea class="writedescription" rows="2" cols="10" placeholder="'+getString("writedescription")+'..." maxlength="'+maxDescriptionLength+'"></textarea><br><span>0</span> / '+maxDescriptionLength+'<br><button type="submit" class="buttons smallbuttons" disabled><img width="32" height="32" src="/images/description.svg"> <span class="uploaddescription">'+getString("uploaddescription")+'</span></button>';
        descriptionForm.children[0].addEventListener("input", function(){
            this.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.disabled = this.value == '';
            this.style.height = "0";
            this.style.height = this.scrollHeight + "px";
            this.nextElementSibling.nextElementSibling.innerText = this.value.length;
        });
        descriptionForm.id = 'd'+i;
        descriptionForm.onsubmit = function(e){
            e.preventDefault();
            var i = this.id.substring(1);
            var element = document.getElementById('i'+i);
            uploadDescription(uploadsData[1], uploadsData[2], this.children[0].value, this.children[0], this.children[1], element);
            this.children[0].value = '';
            this.children[2].innerText = "0";
            this.children[4].disabled = 1;
        };
        myUploadBox.insertBefore(descriptionForm, element);
    // }
    // if(uploadsData[3]){
        var voiceUpload = document.createElement("button");
        voiceUpload.innerHTML = '<img width="32" height="32" src="/images/microphone.svg"> <span class="uploadvoice">'+getString("uploadvoice")+'</span>';
        voiceUpload.classList.add("buttons", "smallbuttons");
        voiceUpload.id = "vb"+i;
        var voiceInput = document.createElement("input");
        voiceInput.type = "file";
        voiceInput.accept = "audio/*";
        voiceInput.id = 'v'+i;
        voiceInput.oninput = function(){
            var i = this.id.substring(1);
            var element = document.getElementById('i'+i);
            uploadVoice(uploadsData[1], uploadsData[2], element, this, document.getElementById("vb"+i));
        };
        voiceInput.hidden = 1;
        myUploadBox.appendChild(voiceInput);
        voiceUpload.onclick = function(){
            document.getElementById("v"+this.id.substring(2)).click();
        }
        myUploadBox.insertBefore(voiceUpload, element);
    // }
    myUploadBox.insertBefore(getMapsDiv(null, element, null, uploadsData[1], uploadsData[2]), element);
    var clearSingleUpload = document.createElement("button");
    clearSingleUpload.innerHTML = '<span style="color:#ec0400;font-size:32px;">&times;</span> <span class="clear">'+getString("clear")+'</span>';
    clearSingleUpload.classList.add("buttons", "smallbuttons");
    clearSingleUpload.onclick = function(){
        if(confirm(getString("clear")+"?")){
            uploads.splice(i + (parseInt(currentPageIndex.innerText) - 1) * 10, 1);
            localStorage.setItem("uploads", JSON.stringify(uploads));
            if(!uploads.length){
                localStorage.removeItem("uploads");
                myuploadsDiv.innerHTML = '<span style="background-color:#ff000080;" class="nodata">'+getString("nodata")+'</span>';
            }else{
                loadUploads(parseInt(currentPageIndex.innerText) - 1);
            }
        }
    };
    myUploadBox.appendChild(clearSingleUpload);
    try{
        loadMedia(uploadsData[0], myUploadBox);
    }catch(e){}
    return myUploadBox;
}
function loadUploads(pageIndex){
    myuploadsDiv.innerHTML = '';
    pageIndex *= 10;
    uploadsToShow = uploads.slice(pageIndex, pageIndex + 10);
    uploadsFragment = document.createDocumentFragment();
    for(var i = 0; i < uploadsToShow.length; i++){
        div = document.createElement("div");
        div.appendChild(loadSingleUpload(uploadsToShow[i], i));
        uploadsFragment.appendChild(div);
    }
    myuploadsDiv.appendChild(uploadsFragment);
}
var currentPageIndex = document.getElementById("currentPageIndex");
var totalPageQuantity = document.getElementById("totalPageQuantity");
if(uploads){
    currentPageIndex.innerText = "1";
    var pagesQuantity = Math.ceil(uploads.length / 10);
    if(pagesQuantity > 1){
        totalPageQuantity.innerText = pagesQuantity;
        previousButton.onclick = function(){
            if(currentPageIndex.innerText == "1"){
                currentPageIndex.innerText = pagesQuantity;
            }else{
                currentPageIndex.innerText -= 1;
            }
            loadUploads(currentPageIndex.innerText - 1);
        };
        nextButton.onclick = function(){
            if(currentPageIndex.innerText == pagesQuantity){
                currentPageIndex.innerText = 1;
            }else{
                currentPageIndex.innerText = parseInt(currentPageIndex.innerText) + 1;
            }
            loadUploads(currentPageIndex.innerText - 1);
        };
        previousButton.disabled = 0;
        nextButton.disabled = 0;
    }else{
        totalPageQuantity.innerText = 1;
    }
    var clearMyUploads = document.getElementById("clearMyUploads");
    clearMyUploads.onclick = function(){
        if(confirm(getString("clearall")+"?")){
            localStorage.removeItem("uploads");
            myuploadsDiv.innerHTML = '<span style="background-color:#ff000080;" class="nodata">'+getString("nodata")+'</span>';
            this.disabled = 1;
        }
    };
    clearMyUploads.disabled = 0;
    loadUploads(0);
}else{
    myuploadsDiv.innerHTML = '<span style="background-color:#ff000080;" class="nodata">'+getString("nodata")+'</span>';
}
try{
    if("serviceWorker" in navigator){
        navigator.serviceWorker.register("/app/offlineserviceworker.js");
    }
}catch(e){}