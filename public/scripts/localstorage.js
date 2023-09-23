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
function createDownloadButton(objectURL){
    var downloadButton = document.createElement("a");
    downloadButton.download = (new Date()).getTime();
    downloadButton.href = objectURL;
    downloadButton.innerHTML = '<img alt width="32" height="32" src="/images/download.svg">&#160;<span class="download">'+getString("download")+'</span>';
    downloadButton.classList.add("buttons", "smallbuttons");
    return downloadButton;
}
function createDeleteButton(key, videoDatabases, objectStoreName){
    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<img alt width="32" height="32" src="/images/delete.svg">&#160;<span class="delete">'+getString("delete")+'</span>';
    deleteButton.classList.add("buttons", "smallbuttons");
    if(!key){
        deleteButton.onclick = function(){
            if(confirm(getString("delete")+"?")){
                var indexedDbRequest = indexedDB.deleteDatabase(videoDatabases[currentPageIndex.innerText - 1].name);
                indexedDbRequest.onsuccess = function(){
                    loadVideos();
                };
            }
        };
    }else{
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
    }
    return deleteButton;
}
function getData(name, objectStoreName, callbackFunc, onerrorFunc, index, setup, keyRange){
    var indexedDbRequest = indexedDB.open(name);
    indexedDbRequest.onsuccess = function(){
        if(this.result.objectStoreNames.contains(objectStoreName)){
            var transaction = this.result.transaction(objectStoreName, "readonly");
            var store = transaction.objectStore(objectStoreName);
            if(keyRange){
                var getRequest0 = store.getAllKeys(keyRange);
                getRequest0.onsuccess = function(){
                    var getRequest = store.getAll(keyRange);
                    getRequest.onsuccess = function(){
                        callbackFunc(this.result, getRequest0.result);
                    };
                };
                return;
            }
            // if(indexes){
            if(index || (index === 0)){
                var getRequest = store.getAllKeys();
                getRequest.onsuccess = function(){
                    var result = this.result;
                    if(result.length){
                        result.reverse();
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
function getVideo0(dbname, videoDatabases, onSuccessFunc, onErrorFunc){
    getData(dbname, "chunks", function(result){
        var blob = new Blob(result, {type: "video/webm"});
        var objectURL = URL.createObjectURL(blob);
        var videoPlayer = document.createElement("video");
        videoPlayer.controls = 1;
        videoPlayer.src = objectURL;
        onSuccessFunc(videoPlayer, createDownloadButton(objectURL), videoDatabases);
    }, onErrorFunc);
}
function getVideo(dbname, videoDatabases){
    getVideo0(dbname, videoDatabases, function(videoPlayer, downloadButton, videoDatabases){
        previewDiv.innerHTML = '';
        previewDiv.appendChild(videoPlayer);
        var videoDateTimeDiv = document.createElement("div");
        videoDateTimeDiv.innerText = getDateTime(parseInt(dbname.replace("videos", "")));
        previewDiv.appendChild(videoDateTimeDiv);
        previewDiv.appendChild(document.createElement("br"));
        var div = document.createElement("div");
        div.appendChild(downloadButton);
        div.appendChild(document.createTextNode(" \u00a0 "));
        div.appendChild(createDeleteButton(null, videoDatabases));
        div.appendChild(document.createElement("br"));
        previewDiv.appendChild(div);
    }, function(){
        previewDiv.innerHTML = '';
        previewDiv.appendChild(getNoDataDiv());
    });
}
var previewDiv = document.getElementById("preview");
var downloadAllButton = document.getElementById("downloadallbutton");
var deleteAllButton = document.getElementById("deleteallbutton");
var previousButton = document.getElementById("previousButton");
var nextButton = document.getElementById("nextButton");
var currentPageIndex = document.getElementById("currentPageIndex");
var totalPageQuantity = document.getElementById("totalPageQuantity");
var storageUsage = document.getElementById("storageUsage");
var storageQuota = document.getElementById("storageQuota");
var storageUsedPercent = document.getElementById("storageUsedPercent");
function getNoDataDiv(){
    var noDataDiv = document.createElement("div");
    noDataDiv.innerHTML = '<span style="background-color:#ff000080;" class="nodata">'+getString("nodata")+'</span>';
    return noDataDiv;
}
function displayNoData(){
    previewDiv.innerHTML = '';
    previewDiv.appendChild(getNoDataDiv());
    nextButton.disabled = 1;
    previousButton.disabled = 1;
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
            getVideo(videoDatabases[0].name, videoDatabases);
            if(videoDatabases.length > 1){
                previousButton.onclick = function(){
                    if(currentPageIndex.innerText == "1"){
                        currentPageIndex.innerText = videoDatabases.length;
                    }else{
                        currentPageIndex.innerText -= 1;
                    }
                    getVideo(videoDatabases[currentPageIndex.innerText - 1].name, videoDatabases);
                };
                nextButton.onclick = function(){
                    if(currentPageIndex.innerText == videoDatabases.length){
                        currentPageIndex.innerText = 1;
                    }else{
                        currentPageIndex.innerText = parseInt(currentPageIndex.innerText) + 1;
                    }
                    getVideo(videoDatabases[currentPageIndex.innerText - 1].name, videoDatabases);
                };
                previousButton.disabled = 0;
                nextButton.disabled = 0;
            }else{
                previousButton.disabled = 1;
                nextButton.disabled = 1;
            }
            // deleteButton.onclick = function(){
            //     if(confirm(getString("delete")+"?")){
            //         var indexedDbRequest = indexedDB.deleteDatabase(videoDatabases[currentPageIndex.innerText - 1].name);
            //         indexedDbRequest.onsuccess = function(){
            //             loadVideos();
            //         };
            //     }
            // };
            // deleteButton.disabled = 0;
        }else{
            displayNoData();
        }
    });
}
function getStringDiv(data){
    var div = document.createElement("div");
    // div.style.maxHeight = "50vh";
    // div.style.overflowY = "auto";
    // div.style.border = "2px solid #256aff";
    div.classList.add("stringDataDiv");
    div.innerText = data;
    return div;
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
    previewDiv.innerHTML = '';
    previewDiv.appendChild(getStringDiv(data));
}
function addImageAndText(element, imageName, textString){
    var img = document.createElement("img");
    img.width = "32";
    img.height = "32";
    img.src = "/images/" + imageName + ".svg";
    element.appendChild(img);
    var span = document.createElement("span");
    span.classList.add(textString);
    span.innerText = getString(textString);
    element.appendChild(document.createTextNode("\u00a0"));
    element.appendChild(span);
}
function getDataDiv(titleString, iconName){
    var div = document.createElement("div");
    div.classList.add("dataBigDiv");
    var titleDiv = document.createElement("div");
    titleDiv.classList.add("dataTitleDiv");
    addImageAndText(titleDiv, iconName, titleString);
    div.appendChild(titleDiv);
    return div;
}
function getDataWithID(id, objectStoreName, titleString, iconName){
    getData("localdata", objectStoreName, function(result, key){
        var div = getDataDiv(titleString, iconName);
        if(result.length){
            if(objectStoreName == "ids"){
                var myuploadsIframe = document.createElement("iframe");
                myuploadsIframe.style.width = "100%";
                myuploadsIframe.style.height = "50vh";
                myuploadsIframe.onload = function(){
                    myuploadsIframe.contentWindow.loadUploads(null, [result[0].concat(id)]);
                };
                myuploadsIframe.style.display = "none";
                var myUploadsBtn = document.createElement("button");
                addImageAndText(myUploadsBtn, "myuploads", "myuploads");
                myUploadsBtn.classList.add("buttons", "smallbuttons");
                myUploadsBtn.onclick = function(){
                    if(myuploadsIframe.style.display == "none"){
                        myuploadsIframe.style.display = "initial";
                    }else{
                        myuploadsIframe.style.display = "none";
                    }
                };
                var nDiv = document.createElement("div");
                nDiv.appendChild(document.createTextNode("#"));
                nDiv.appendChild(document.createTextNode(result[0][0]));
                div.appendChild(nDiv);
                div.appendChild(myUploadsBtn);
                div.appendChild(myuploadsIframe);
                myuploadsIframe.src = "/app/myuploads/";
            }else{
                for(var i = 0; i < result.length; i++){
                    div.appendChild(getStringDiv(result[i]));
                    if(objectStoreName.includes("location") && result[i][5]){
                        var videoDateTimeDiv = document.createElement("div");
                        videoDateTimeDiv.innerText = getDateTime(result[i][5]);
                        div.appendChild(videoDateTimeDiv);
                    }else{
                        var videoDateTimeDiv = document.createElement("div");
                        videoDateTimeDiv.innerText = getDateTime(parseInt(key[i].split("_")[1]));
                        div.appendChild(videoDateTimeDiv);
                    }
                    div.appendChild(createDownloadButton(URL.createObjectURL(new Blob([result[i]]))));
                    if(i != (result.length - 1)){
                        div.appendChild(document.createElement("hr"));
                    }
                }
            }
        }else{
            div.appendChild(getNoDataDiv());
        }
        previewDiv.appendChild(div);
    }, function(){}, null, null, IDBKeyRange.bound(id.toString(), id + "\uffff"));
}
function loadStrings(objectStoreName, /*indexes*/index, setup){
    getData("localdata", objectStoreName, function(result, key){
        if(objectStoreName == "all"){
            previewDiv.innerText = '';
            var div = getDataDiv("video", "video");
            getVideo0("videos" + key, null, function(videoPlayer, downloadButton){
                div.appendChild(videoPlayer);
                div.appendChild(document.createElement("br"));
                div.appendChild(downloadButton);
                div.appendChild(document.createElement("br"));
                var videoDateTimeDiv = document.createElement("div");
                videoDateTimeDiv.innerText = getDateTime(key);
                div.appendChild(videoDateTimeDiv);
                previewDiv.appendChild(div);
            }, function(){
                div.appendChild(getNoDataDiv());
                previewDiv.appendChild(div);
            });
            getDataWithID(key, "description", "description", "description");
            getDataWithID(key, "locationupload", "locationcoordinates", "location");
            getDataWithID(key, "ids", "myuploads", "myuploads");
        }else{
            // deleteButton.onclick = function(){
            //     if(confirm(getString("delete")+"?")){
            //         var indexedDbRequest = indexedDB.open("localdata");
            //         indexedDbRequest.onsuccess = function(){
            //             var transaction = this.result.transaction(objectStoreName, "readwrite");
            //             var store = transaction.objectStore(objectStoreName);
            //             (store.delete(key)).onsuccess = function(){
            //                 var currentIndex = Number(currentPageIndex.innerText) - 1;
            //                 var quantity = Number(totalPageQuantity.innerText) - 1;
            //                 var index;
            //                 if(currentIndex >= quantity){
            //                     index = quantity - 1;
            //                 }else{
            //                     index = currentIndex;
            //                 }
            //                 loadStrings(objectStoreName, index, true);
            //             };
            //         };
            //     }
            // };
            showData(result);
            if(objectStoreName.includes("location") && result[5]){
                var videoDateTimeDiv = document.createElement("div");
                videoDateTimeDiv.innerText = getDateTime(result[5]);
                previewDiv.appendChild(videoDateTimeDiv);
            }else{
                var videoDateTimeDiv = document.createElement("div");
                videoDateTimeDiv.innerText = getDateTime(parseInt(key.split("_")[1]));
                previewDiv.appendChild(videoDateTimeDiv);
            }
            previewDiv.appendChild(document.createElement("br"));
            var div = document.createElement("div");
            div.appendChild(createDownloadButton(URL.createObjectURL(new Blob([result]))));
            div.appendChild(document.createTextNode(" \u00a0 "));
            div.appendChild(createDeleteButton(key, null, objectStoreName));
            previewDiv.appendChild(div);
            // dataSizeSpan.innerText = result.length;
        }
    }, function(){
        displayNoData();
    }, index, setup);
}
var dataButtons = document.getElementsByClassName("databuttons");
for(var i = 0; i < dataButtons.length; i++){
    dataButtons[i].onclick = function(){
        nextButton.disabled = 1;
        previousButton.disabled = 1;
        previewDiv.innerHTML = '';
        currentPageIndex.innerText = "";
        totalPageQuantity.innerText = "";
        if(this.style.outline == ''){
            if(this.id == "videodata"){
                loadVideos();
            }else{
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
document.getElementById("alldata").click();