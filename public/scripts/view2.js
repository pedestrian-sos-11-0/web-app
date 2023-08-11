var mainDiv = document.getElementById("main");
var topDiv = document.getElementById("top");
var windowOverlay = document.getElementById("windowoverlay");
try{
    var mainDiv = document.getElementById("main");
    var matchmedia = window.matchMedia("(prefers-color-scheme: dark)");
    var contentBackgroundColor;
    function setDarkMode(enabled){
        if(enabled){
            document.documentElement.style.colorScheme = "dark";
            mainDiv.style.backgroundColor = "#000000";
            contentBackgroundColor = "#101010";
        }else{
            document.documentElement.style.colorScheme = "light";
            mainDiv.style.backgroundColor = "#efefef";
            contentBackgroundColor = "#ffffff";
        }
        topDiv.style.backgroundColor = contentBackgroundColor;
        windowOverlay.style.backgroundColor = contentBackgroundColor;
        var contentElements = document.getElementsByClassName("one");
        for(var i = 0; i < contentElements.length; i++){
            contentElements[i].style.backgroundColor = contentBackgroundColor;
        }
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
}catch(e){}
/*try{
    var colorFilterDefaultValue = 90;
    var lightFilter = document.createElement("div");
    lightFilter.className = "overlay";
    mainDiv.style.position = "relative";
    lightFilter.style.position = "absolute";
    lightFilter.style.pointerEvents = "none";
    lightFilter.style.mixBlendMode = "multiply";
    lightFilter.style.zIndex = "1";
    mainDiv.appendChild(lightFilter);
    var r = 255;
    var g;
    var b;
    function setFilterValue(value0){
        var value = (value0 / 100.0) * 510;
        if(value < 0){
            value = 0;
        }else if(value > 510){
            value = 510;
        }
        if(value < 256){
            g = value;
            b = 0;
        }else{
            g = 255;
            b = value - 255;
        }
        lightFilter.style.backgroundColor = "rgb("+r+", "+g+", "+b+")";
        localStorage.setItem("colorfiltervalue", value0);
    }
    function colorfilter(){
        if(localStorage.getItem("colorfiltervalue")){
            setFilterValue(localStorage.getItem("colorfiltervalue"));
        }else{
            setFilterValue(colorFilterDefaultValue);
        }
        if(localStorage.getItem("colorfilterenabled") == "true"){
            lightFilter.style.display = "block";
        }else{
            lightFilter.style.display = "none";
        }
    }
    colorfilter();
}catch(e){}*/
try{
    window.onstorage = function(){
        try{
            darkMode();
        }catch(e){}
        /*try{
            setLanguage();
        }catch(e){}*/
        /*try{
            colorfilter();
        }catch(e){}*/
    };
}catch(e){}
var contentDiv = document.getElementById("content");
var page = 0;
var topN = "";
var jsons;
var jsonArray;
function loadContent(reload){
    var ajax = new XMLHttpRequest();
    if(reload){
        ajax.open("GET", "../?view&raw=1&p=0&t=");
    }else{
        ajax.open("GET", "../?view&raw=1&p=" + page + "&t=" + topN);
    }
    ajax.onload = function(){
        loader.style.display = "none";
        loaderTop.style.display = "none";
        contentDiv.style.opacity = "1";
        if(this.responseText != "" && this.responseText != "0"){
            jsons = this.responseText.split(">");
            if(reload){
                contentDiv.innerHTML = '';
                page = 0;
                topN = "";
            }
            for(var i = 0; i < jsons.length; i++){
                jsonArray = JSON.parse(jsons[i]);
                if(i == 0){
                    topN = jsonArray[0];
                }
                addContent(jsonArray);
            }
            page++;
            window.addEventListener("scroll", scrollLoad);
        }
    };
    ajax.onerror = function(){
        loader.style.display = "none";
        loadError.style.display = "block";
        loaderTop.style.display = "none";
        loadErrorTop.style.display = "block";
        contentDiv.style.opacity = "1";
    };
    ajax.send();
}
function getHTML(array, windowMode){
    if(array[3][0] == "image"){
        return '<img src="../' + array[1][0] + '">';
    }else{
        if(windowMode){
            return '<video controls src="../' + array[1][0] + '"></video>';
        }else{
            return '<video src="../' + array[1][0] + '"></video>';
        }
    }
}
function addContent(array){
    var oneDiv = document.createElement("div");
    oneDiv.classList.add("one");
    oneDiv.style.backgroundColor = contentBackgroundColor;
    var imageName;
    if(array[1].length > 1){
        imageName = "multiple";
    }else if(array[3][0] == "image"){
        imageName = "photo";
    }else if(array[3][0] == "video"){
        imageName = "video";
    }else if(array[3][0] == "live"){
        imageName = "live";
    }
    oneDiv.innerHTML = getHTML(array) + '<div class="contenticon"><img width="32" height="32" src="../images/' + imageName + '.svg"></div>';
    oneDiv.onclick = function(){
        openWindow(getHTML(array, true), array);
        history.pushState("", "", "?n=" + array[0]);
    };
    contentDiv.appendChild(oneDiv);
}
var windowTop = document.getElementById("windowtop");
var windowContent = document.getElementById("windowcontent");
var closeWindowButton = document.getElementById("closewindow");
function closeWindow(){
    windowOverlay.style.display = "none";
    document.getElementsByTagName("BODY")[0].style.overflow = "visible";
    windowContent.innerHTML = '';
    if(contentDiv.innerHTML == ""){
        loadContent();
    }
}
closeWindowButton.onclick = function(){
    closeWindow();
    history.pushState("", "", "/view2");
};
function getID(){
    return (new URL(window.location.href)).searchParams.get("n");
}
function openID(){
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "../?view&n=" + getID() + "&raw=1");
    ajax.onload = function(){
        if(this.responseText != ""){
            var array = JSON.parse(this.responseText);
            openWindow(getHTML(array, true), array);
        }
    };
    ajax.send();
}
document.getElementById("open").onclick = function(){
    location.assign("../?view&n=" + getID());
};
document.getElementById("opennewtab").onclick = function(){
    window.open("../?view&n=" + getID());
};
document.getElementById("download").onclick = function(){
    var a = document.createElement("a");
    a.download = "";
    a.href = "../?download=" + getID();
    a.click();
};
document.getElementById("share").onclick = function(){
    navigator.share({url: window.location.href});
};
var openAll = document.getElementById("openall");
var openAllNewTab = document.getElementById("openallnewtab");
openAll.onclick = function(){
    location.assign("../?view&n=" + getID() + "&all=file");
};
openAllNewTab.onclick = function(){
    window.open("../?view&n=" + getID() + "&all=file");
};
function openWindow(content, array){
    if(array[1].length > 1){
        openAll.style.display = "flex";
        openAllNewTab.style.display = "flex";
    }else{
        openAll.style.display = "none";
        openAllNewTab.style.display = "none";
    }
    windowContent.innerHTML = content;
    windowOverlay.style.display = "flex";
    document.getElementsByTagName("BODY")[0].style.overflow = "hidden";
}
try{
    var loaderStyle = document.createElement("link");
    loaderStyle.rel = "stylesheet";
    loaderStyle.href = "../styles/loader.css";
    document.head.appendChild(loaderStyle);
}catch(e){}
function loaderSetup(loader, loadError){
    loader.style.display = "none";
    loadError.style.display = "none";
    loadError.innerText = "LOAD ERROR!";
    var reloadButton = document.createElement("button");
    reloadButton.innerHTML = 'RELOAD';
    reloadButton.addEventListener("click", function(){
        loadError.style.display = "none";
        loader.style.display = "inline-block";
        loadContent();
    });
    loadError.appendChild(reloadButton);
    loadError.style.fontSize = "20px";
    loadError.style.fontWeight = "bold";
    loadError.style.color = "#ff0000";
}
function scrollLoad(){
    loadContentHeight = mainDiv.clientHeight * 3 / 4 - mainDiv.clientHeight;
    if(document.body.scrollTop > loadContentHeight || document.documentElement.scrollTop > loadContentHeight){
        window.removeEventListener("scroll", scrollLoad);
        loader.style.display = "inline-block";
        loadContent();
    }
}
try{
    var loader = document.getElementById("loader");
    var loadError = document.getElementById("loaderror");
    loaderSetup(loader, loadError);
    var loaderTop = document.getElementById("loadertop");
    var loadErrorTop = document.getElementById("loaderrortop");
    loaderSetup(loaderTop, loadErrorTop);
    var loadContentHeight;
    window.addEventListener("scroll", scrollLoad);
}catch(e){}
try{
    var topSpaceDiv = document.createElement("div");
    topSpaceDiv.style.height = topDiv.clientHeight + "px";
    mainDiv.insertBefore(topSpaceDiv, mainDiv.childNodes[0]);
    var icon = document.getElementById("icon");
    window.addEventListener("scroll", function(){
        if(window.scrollY > 0){
            icon.children[0].width = "32";
            icon.children[0].height = "32";
        }else{
            icon.children[0].width = "64";
            icon.children[0].height = "64";
        }
    });
    icon.addEventListener("click", function(e){
        if(window.scrollY > 0){
            e.preventDefault();
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth"
            });
            loaderTop.style.display = "inline-block";
            contentDiv.style.opacity = "0.5";
            loadContent(true);
        }
    });
}catch{}
window.onpopstate = function(){
    if(getID()){
        openID();
    }else{
        closeWindow();
    }
};
window.onload = function(){
    if(getID()){
        openID();
    }else{
        loadContent();
    }
};