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
                var ajax = new XMLHttpRequest();
                ajax.onload = function(){
                    json = Object.assign(json, JSON.parse(this.responseText));
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
                };
                ajax.open("GET", "/json/languages/localstorage/" + lang + ".json");
                ajax.send();
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
var objectURL;
function getData(name, objectStoreName, callbackFunc, onerrorFunc, /*indexes*/index, setup){
    var indexedDbRequest = indexedDB.open(name);
    indexedDbRequest.onsuccess = function(){
        if(this.result.objectStoreNames.contains(objectStoreName)){
            var transaction = this.result.transaction(objectStoreName, "readonly");
            var store = transaction.objectStore(objectStoreName);
            // if(indexes){
            if(index || (index === 0)){
                var getRequest = store.getAllKeys();
                getRequest.onsuccess = function(){
                    var result = this.result;
                    if(result.length){
                        // var key1 = result[indexes[0]];
                        // var key2 = result[indexes[1]];
                        // if(!key2){
                        //     key2 = result[result.length - 1];
                        // }
                        // var getRequest2 = store.getAll(IDBKeyRange.bound(key1, key2));
                        var getRequest2 = store.get(result[index]);
                        getRequest2.onsuccess = function(){
                            callbackFunc(this.result, result[index]);
                        };
                        if(setup){
                            // var pagesQuantity = Math.ceil(result.length / 10);
                            var pagesQuantity = result.length;
                            currentPageIndex.innerText = index + 1;
                            totalPageQuantity.innerText = pagesQuantity;
                            if(pagesQuantity > 1){
                                previousButton.onclick = function(){
                                    if(currentPageIndex.innerText == "1"){
                                        currentPageIndex.innerText = pagesQuantity;
                                    }else{
                                        currentPageIndex.innerText -= 1;
                                    }
                                    // var index0 = currentPageIndex.innerText - 1;
                                    // var index1 = index0 + 9;
                                    // loadStrings(objectStoreName, [index0, index1]);
                                    loadStrings(objectStoreName, currentPageIndex.innerText - 1);
                                };
                                nextButton.onclick = function(){
                                    if(currentPageIndex.innerText == pagesQuantity){
                                        currentPageIndex.innerText = 1;
                                    }else{
                                        currentPageIndex.innerText = parseInt(currentPageIndex.innerText) + 1;
                                    }
                                    // var index0 = currentPageIndex.innerText - 1;
                                    // var index1 = index0 + 9;
                                    // loadStrings(objectStoreName, [index0, index1]);
                                    loadStrings(objectStoreName, currentPageIndex.innerText - 1);
                                };
                                previousButton.disabled = 0;
                                nextButton.disabled = 0;
                            }else{
                                previousButton.disabled = 1;
                                nextButton.disabled = 1;
                            }
                        }
                    }else{
                        onerrorFunc();
                    }
                };
            }else{
                var getRequest = store.getAll();
                getRequest.onsuccess = function(){
                    callbackFunc(this.result);
                };
            }
        }else{
            onerrorFunc();
        }
    };
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
        return d.getFullYear() + "-" + addZero(d.getMonth() + 1) + "-" + addZero(d.getDate()) + " " + addZero(d.getHours()) + ":" + addZero(d.getMinutes()) + ":" + addZero(d.getSeconds()) + "\n" + millisecond;
    }catch(e){
        return "";
    }
}
function getVideo(dbname){
    getData(dbname, "chunks", function(result){
        var blob = new Blob(result, {type: "video/webm"});
        objectURL = URL.createObjectURL(blob);
        if(downloadButton.disabled){
            downloadButton.disabled = 0;
        }
        var videoPlayer = document.createElement("video");
        videoPlayer.controls = 1;
        videoPlayer.src = objectURL;
        previewDiv.innerHTML = '';
        previewDiv.appendChild(videoPlayer);
        dateTimeDiv.innerText = getDateTime(Number(dbname.replace("videos", "")));
        dataSizeSpan.innerText = blob.size;
    });
}
var previewDiv = document.getElementById("preview");
var dateTimeDiv = document.getElementById("datetime");
var dataSizeSpan = document.getElementById("datasize");
var downloadButton = document.getElementById("downloadbutton");
var deleteButton = document.getElementById("deletebutton");
var previousButton = document.getElementById("previousButton");
var nextButton = document.getElementById("nextButton");
var currentPageIndex = document.getElementById("currentPageIndex");
var totalPageQuantity = document.getElementById("totalPageQuantity");
var storageUsage = document.getElementById("storageUsage");
var storageQuota = document.getElementById("storageQuota");
var storageUsedPercent = document.getElementById("storageUsedPercent");
// var descriptionData;
downloadButton.onclick = function(){
    // if(descriptionData){
    //     for(var i = 0; i < descriptionData.length; i++){
    //         var downloadButton = document.createElement("a");
    //         downloadButton.download = "description"+(new Date()).getTime();
    //         downloadButton.href = URL.createObjectURL(new Blob([descriptionData[i]]));
    //         downloadButton.click();
    //     }
    //     return;
    // }
    var downloadButton = document.createElement("a");
    downloadButton.download = (new Date()).getTime();
    downloadButton.href = objectURL;
    downloadButton.click();
};
function displayNoData(){
    var noDataDiv = document.createElement("div");
    noDataDiv.innerHTML = '<span style="background-color:#ff000080;" class="nodata">'+getString("nodata")+'</span>';
    previewDiv.innerHTML = '';
    previewDiv.appendChild(noDataDiv);
    downloadButton.disabled = 1;
    nextButton.disabled = 1;
    previousButton.disabled = 1;
    deleteButton.disabled = 1;
    dateTimeDiv.innerText = '';
    dataSizeSpan.innerText = '';
    currentPageIndex.innerText = "";
    totalPageQuantity.innerText = "";
}
function loadVideos(){
    indexedDB.databases().then(function(databases){
        var videoDatabases = [];
        for(var i = 0; i < databases.length; i++){
            if(databases[i].name.includes("videos")){
                videoDatabases.push(databases[i]);
            }
        }
        if(videoDatabases.length){
            try{
                videoDatabases.reverse();
            }catch(e){}
            totalPageQuantity.innerText = videoDatabases.length;
            currentPageIndex.innerText = 1;
            getVideo(videoDatabases[0].name);
            if(videoDatabases.length > 1){
                previousButton.onclick = function(){
                    if(currentPageIndex.innerText == "1"){
                        currentPageIndex.innerText = videoDatabases.length;
                    }else{
                        currentPageIndex.innerText -= 1;
                    }
                    getVideo(videoDatabases[currentPageIndex.innerText - 1].name);
                };
                nextButton.onclick = function(){
                    if(currentPageIndex.innerText == videoDatabases.length){
                        currentPageIndex.innerText = 1;
                    }else{
                        currentPageIndex.innerText = parseInt(currentPageIndex.innerText) + 1;
                    }
                    getVideo(videoDatabases[currentPageIndex.innerText - 1].name);
                };
                previousButton.disabled = 0;
                nextButton.disabled = 0;
            }else{
                previousButton.disabled = 1;
                nextButton.disabled = 1;
            }
            deleteButton.onclick = function(){
                if(confirm(getString("delete")+"?")){
                    var indexedDbRequest = indexedDB.deleteDatabase(videoDatabases[currentPageIndex.innerText - 1].name);
                    indexedDbRequest.onsuccess = function(){
                        loadVideos();
                    };
                }
            };
            deleteButton.disabled = 0;
        }else{
            displayNoData();
        }
    });
}
function showData(/*dataArray*/data){
    // var documentFragment = document.createDocumentFragment();
    // var div;
    // try{
    //     dataArray.reverse();
    // }catch(e){}
    // for(var i = 0; i < dataArray.length; i++){
    //     div = document.createElement("div");
    //     div.style.maxHeight = "25vh";
    //     div.style.overflowY = "auto";
    //     div.innerText = dataArray[i];
    //     documentFragment.appendChild(div);
    // }
    // var div2 = document.createElement("div");
    // div2.appendChild(documentFragment);
    // div2.style.overflowY = "auto";
    // div2.style.margin = "0 15px";
    // div2.style.padding = "0 15px";
    // div2.style.border = "2px solid #256aff";
    var div = document.createElement("div");
    div.style.maxHeight = "50vh";
    div.style.overflowY = "auto";
    div.style.border = "2px solid #256aff";
    div.innerText = data;
    previewDiv.innerHTML = '';
    previewDiv.appendChild(div);
}
function loadStrings(objectStoreName, /*indexes*/index, setup){
    getData("localdata", objectStoreName, function(result, key){
        // if(objectStoreName == "description"){
        //     descriptionData = result;
        // }else{
        //     descriptionData = null;
        //     objectURL = URL.createObjectURL(new Blob([result.join("\n")]));
        // }
        objectURL = URL.createObjectURL(new Blob([result]));
        downloadButton.disabled = 0;
        deleteButton.onclick = function(){
            if(confirm(getString("delete")+"?")){
                var indexedDbRequest = indexedDB.open("localdata");
                indexedDbRequest.onsuccess = function(){
                    var transaction = this.result.transaction(objectStoreName, "readwrite");
                    var store = transaction.objectStore(objectStoreName);
                    (store.delete(key)).onsuccess = function(){
                        var currentIndex = Number(currentPageIndex.innerText) - 1;
                        var quantity = Number(totalPageQuantity.innerText) - 1;
                        var index;
                        if(currentIndex >= quantity){
                            index = quantity - 1;
                        }else{
                            index = currentIndex;
                        }
                        loadStrings(objectStoreName, index, true);
                    };
                };
            }
        };
        deleteButton.disabled = 0;
        showData(result);
        dataSizeSpan.innerText = result.length;
    }, function(){
        displayNoData();
    }, /*indexes*/index, setup);
}
var dataButtons = document.getElementsByClassName("databuttons");
for(var i = 0; i < dataButtons.length; i++){
    dataButtons[i].onclick = function(){
        downloadButton.disabled = 1;
        nextButton.disabled = 1;
        previousButton.disabled = 1;
        deleteButton.disabled = 1;
        previewDiv.innerHTML = '';
        dateTimeDiv.innerText = '';
        dataSizeSpan.innerText = '';
        currentPageIndex.innerText = "";
        totalPageQuantity.innerText = "";
        if(this.style.outline == ''){
            if(this.id == "videodata"){
                loadVideos();
            }else{
                // loadStrings(this.id.replace("data", ""), [0, 9], true);
                loadStrings(this.id.replace("data", ""), 0, true);
            }
            for(var i2 = 0; i2 < dataButtons.length; i2++){
                dataButtons[i2].style.outline = "";
            }
            this.style.outline = "2px solid #00ff00";
        }else{
            this.style.outline = '';
        }
    };
}
navigator.storage.estimate().then((estimate)=>{
    storageQuota.innerText = estimate.quota;
    storageUsage.innerText = estimate.usage;
    storageUsedPercent.innerText = ((estimate.usage / estimate.quota) * 100).toFixed(2);
});
try{
    if("serviceWorker" in navigator){
        navigator.serviceWorker.register("/app/offlineserviceworker.js");
    }
}catch(e){}