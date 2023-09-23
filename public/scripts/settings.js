var mainDiv = document.getElementById("main");
var strings = null;
var darkModeEnabled;
function getString(key)  {
    if(strings && strings[key])return strings[key];
    return "";
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
try{
    var matchmedia = window.matchMedia("(prefers-color-scheme: dark)");
    function onDarkModeChange(checked){
        if(typeof darkmodecheckbox != "undefined"){
            darkmodecheckbox.checked = checked;
        }
    }
    function defaultdarkmode()  {
        setDarkMode(matchmedia.matches);
        matchmedia.onchange = function(e){
            setDarkMode(e.matches);
            onDarkModeChange(e.matches);
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
var darkmodediv = document.getElementById("darkmodediv");
var darkmodecheckbox = document.getElementById("darkmodecheckbox");
var defaultTheme = document.getElementById("defaulttheme");
function changeDarkMode()   {
    if(defaultTheme.checked)defaultTheme.checked=0;
    matchmedia.onchange=function(){};
    setDarkMode(!darkModeEnabled);
    localStorage.setItem("darkmode", darkModeEnabled);
    // setWindowDarkMode(/*settingsWindowOverlay, */settingsWindow);
}
darkmodecheckbox.addEventListener("click", function(){changeDarkMode();});
darkmodediv.addEventListener("click", function(){darkmodecheckbox.checked = !darkmodecheckbox.checked;changeDarkMode();});
defaultTheme.onchange = function(){
    if(this.checked){
        defaultdarkmode();
        // setWindowDarkMode(/*settingsWindowOverlay, */settingsWindow);
        localStorage.removeItem("darkmode");
    }else {
        matchmedia.onchange=function(){};
        localStorage.setItem("darkmode",darkModeEnabled);
    }
    darkmodecheckbox.checked=darkModeEnabled;
};
darkmodecheckbox.checked=darkModeEnabled;
if(localStorage.getItem("darkmode")==null)defaultTheme.checked=1;
var settingsStrings;
function setSettingsLanguage(lang,get)  {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "/json/languages/settings/" + lang + ".json");
    ajax.onload = function()    {
        if(this.status == 200){
            var json = JSON.parse(this.responseText);
            settingsStrings = json;
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
                            }else{
                                elements[element].innerText=json[key];
                            }
                        };
                    }
                }
            }
            document.title = getString("settings") + " | " + getString("title");
            try{
                consoleWarning(strings["warning"],strings["consolewarning"]);
            }catch(e){}
        }
        else{
            var getlang = (new URL(window.location.href)).searchParams.get("lang");
            if(getlang != null && get != 1){
                lang = getlang;
                setSettingsLanguage(lang,1);
            }else if(lang != "en"){
                lang = "en";
                setSettingsLanguage(lang);
            }
        }
    };
    ajax.send();
}
var defaultLang = document.getElementById("defaultlang");
if(localStorage.getItem("lang") == null){
    defaultLang.checked = 1;
}
var languageSelect = document.getElementById("setlang");
try{
    var getLanguagesAjax = new XMLHttpRequest();
    getLanguagesAjax.onload = function(){
        var languagesArray = JSON.parse(this.response);
        var optionTag;
        var documentFragment = document.createDocumentFragment();
        for(var i = 0; i < languagesArray.length; i++){
            optionTag = document.createElement("option");
            optionTag.value = languagesArray[i][0];
            optionTag.innerText = languagesArray[i][1];
            documentFragment.appendChild(optionTag);
        }
        languageSelect.appendChild(documentFragment);
        defaultLang.onchange = function(){
            if(this.checked){
                localStorage.removeItem("lang");
                setCookie("lang", "");
                lang = navigator.language.substring(0, 2);
                setLanguage(lang);
                setSettingsLanguage(lang);
                languageSelect.value = lang;
                window.onlanguagechange = function(){onLanguageChange();};
            }else{
                localStorage.setItem("lang", lang);
                window.onlanguagechange = function(){};
            }
        };
        languageSelect.value = lang;
        languageSelect.onchange = function(){
            lang = this.value;
            setLanguage(lang);
            setSettingsLanguage(lang);
            localStorage.setItem("lang", lang);
            defaultLang.checked = 0;
            window.onlanguagechange = function(){};
        };
    };
    getLanguagesAjax.open("GET", "/getlanguages.php");
    getLanguagesAjax.send();
}catch(e){}
try{
    var timeZoneValueDiv = document.getElementById("timezonevalue");
    var timezoneSelect = document.getElementById("settimezone");
    var defaultTimezone = document.getElementById("defaulttimezone");
    function setTimeZoneHTML(value){
        if(value > 0){
            value = '+' + value;
        }
        timeZoneValueDiv.innerText = value;
    }
    if(localStorage.getItem("timezone") == null){
        defaultTimezone.checked = 1;
        setTimeZoneHTML(getCookie("timezone") / -60);
    }else{
        setTimeZoneHTML(localStorage.getItem("timezone"));
    }
    timezoneSelect.value = Math.round(timeZoneValueDiv.innerText);
    defaultTimezone.onchange = function(){
        if(this.checked){
            localStorage.removeItem("timezone");
            setCookie("settingstimezone", "");
            setTimeZoneHTML((new Date()).getTimezoneOffset() / -60);
            timezoneSelect.value = Math.round((new Date()).getTimezoneOffset() / -60);
        }
    };
    timezoneSelect.onchange = function(){
        localStorage.setItem("timezone", this.value);
        setCookie("settingstimezone", this.value, 1000);
        setTimeZoneHTML(this.value);
        defaultTimezone.checked = 0;
    };
    
}catch(e){}
function checkboxSettingSetup(id, checkbox, storagename/*, checkeddefault*/){
    if(!checkbox){
        var checkbox = document.getElementById(id);
    }
    if(!storagename){
        if(id){
            storagename = id;
        }else{
            storagename = checkbox.id;
        }
    }
    /*if(checkeddefault){
        if(!localStorage.getItem(storagename)){
            localStorage.setItem(storagename, true);
        }
    }*/
    if(localStorage.getItem(storagename) == "true"){
        checkbox.checked = 1;
    }else{
        checkbox.checked = 0;
    }
    checkbox.onchange = function(){
        localStorage.setItem(storagename, this.checked);
        try{
            setLocationSettingDiv(storagename, null, true);
        }catch(e){}
    };
}
function inputSettingSetup(id, input, storagename, defaultval){
    if(!input){
        var input = document.getElementById(id);
    }
    if(!storagename){
        if(id){
            storagename = id;
        }else{
            storagename = input.id;
        }
    }
    if(defaultval){
        if(!localStorage.getItem(storagename)){
            localStorage.setItem(storagename, defaultval);
        }
    }
    input.value = localStorage.getItem(storagename);
    input.oninput = function(){
        localStorage.setItem(storagename, this.value);
    };
}
try{
    var checkboxSettings = [
        ["saveuploads", true],
        ["savelocalstorage_all", true],
        ["savelocalstorage_video", true],
        ["savelocalstorage_location", true],
        ["savelocalstorage_locationupload", true],
        ["savelocalstorage_description", true],
        ["savelocalstorage_ids", true],
        ["currentlocationmode", false],
        ["locationhighaccuracymode", true],
        ["locationinitializationmode", false],
        ["locationcachemode", true],
        ["takephotoautomaticdownload", true],
        ["recordvideoautomaticdownload", true],
        ["cameratakephotoautomaticdownload", true],
        ["camerarecordvideoautomaticdownload", true],
        ["cameralivestreamautomaticdownload", true],
        ["hiddencameratakephotoautomaticdownload", true],
        ["hiddencamerarecordvideoautomaticdownload", true],
        ["hiddencameralivestreamautomaticdownload", true],
        ["hiddencameracolorfulindicator", true],
        ["camerawindowonfocusactions", false],
        ["takephotolocationattach", true],
        ["recordvideolocationattach", true],
        ["choosephotoslocationattach", false],
        ["choosevideoslocationattach", false],
        ["choosefileslocationattach", false],
        ["enterlinklocationattach", false],
        ["cameratakephotolocationattach", true],
        ["camerarecordvideolocationattach", true],
        ["cameralivestreamlocationattach", true],
        ["cameralivestreamconstantlylocationattach", true],
        ["cameratakephotoonvideoclick", false],
        ["hiddencameratakephotolocationattach", true],
        ["hiddencamerarecordvideolocationattach", true],
        ["hiddencameralivestreamlocationattach", true],
        ["hiddencameralivestreamconstantlylocationattach", true]
    ];
    function setCheckboxSettings(){
        for(var i = 0; i < checkboxSettings.length; i++){
            checkboxSettingSetup(checkboxSettings[i][0]);
        }
    }
    function resetCheckboxSettings(){
        for(var i = 0; i < checkboxSettings.length; i++){
            localStorage.setItem(checkboxSettings[i][0], checkboxSettings[i][1]);
        }
    }
    if(!localStorage.getItem(checkboxSettings[0][0])){
        resetCheckboxSettings();
    }
    setCheckboxSettings();
}catch(e){}
try{
    /*var locationSettingsNames = ["currentlocationmode", "locationhighaccuracymode", "locationinitializationmode", "locationcachemode"];
    var locationSettingsValues = [false, true, false, true];
    function setLocationSettings(){
        for(var i = 0; i < locationSettingsNames.length; i++){
            checkboxSettingSetup(locationSettingsNames[i]);
        }
    }
    function resetLocationSettings(){
        for(var i = 0; i < locationSettingsNames.length; i++){
            localStorage.setItem(locationSettingsNames[i], locationSettingsValues[i]);
        }
    }
    if(!localStorage.getItem(locationSettingsNames[0])){
        resetLocationSettings();
    }
    setLocationSettings();*/
    var locationCacheTimeout = document.getElementById("locationcachetimeout");
    locationCacheTimeout.oninput = function(){
        localStorage.setItem(this.id, this.value * 1000);
        //locationCacheValue.innerText = localStorage.getItem("locationcachetimeout") / 1000;
    };
    function locationCacheTimeoutInputSetup(){
        if(!localStorage.getItem("locationcachetimeout")){
            localStorage.setItem("locationcachetimeout", 1000);
        }
        locationCacheTimeout.value = localStorage.getItem("locationcachetimeout") / 1000;
    }
    locationCacheTimeoutInputSetup();
}catch(e){}
/*try{
    var locationAttachSettingsNames = [
        "takephotolocationattach",
        "recordvideolocationattach",
        "choosephotoslocationattach",
        "choosevideoslocationattach",
        "choosefileslocationattach",
        "enterlinklocationattach",
        "cameratakephotolocationattach",
        "camerarecordvideolocationattach",
        "cameralivestreamlocationattach",
        "cameralivestreamconstantlylocationattach"
    ];
    var locationAttachSettingsValues = [
        true,
        true,
        false,
        false,
        false,
        false,
        true,
        true,
        true,
        true
    ];
    function setLocationAttachSettings(){
        for(var i = 0; i < locationAttachSettingsNames.length; i++){
            checkboxSettingSetup(locationAttachSettingsNames[i]);
        }
    }
    function resetLocationAttachSettings(){
        for(var i = 0; i < locationAttachSettingsNames.length; i++){
            localStorage.setItem(locationAttachSettingsNames[i], locationAttachSettingsValues[i]);
        }
    }
    if(!localStorage.getItem(locationAttachSettingsNames[0])){
        resetLocationAttachSettings();
    }
    setLocationAttachSettings();
}catch(e){}*/
/*try{
    var reopenSettingsNames = ["takephotoreopen", "recordvideoreopen", "choosephotosreopen", "choosevideosreopen", "choosefilesreopen"];
    var reopenSettingsValues = [false, false, false, false, false, false];
    function setReopenSettings(){
        for(var i = 0; i < reopenSettingsNames.length; i++){
            checkboxSettingSetup(reopenSettingsNames[i]);
        }
    }
    function resetReopenSettings(){
        for(var i = 0; i < reopenSettingsNames.length; i++){
            localStorage.setItem(reopenSettingsNames[i], reopenSettingsValues[i]);
        }
    }
    if(!localStorage.getItem(reopenSettingsNames[0])){
        resetReopenSettings();
    }
    setReopenSettings();
}catch(e){}*/
/*try{
    function startupRadioSetup(id0){
        document.getElementById(id0 + "startup").onchange = function(){
            localStorage.setItem("startupmode", id0);
        };
    }
    function startupSettingSetup(){
        var startupCurrentVal = localStorage.getItem("startupmode");
        if(!startupCurrentVal){
            startupCurrentVal = "default";
        }
        document.getElementById(startupCurrentVal + "startup").checked = 1;
    }
    startupRadioSetup("default");
    startupRadioSetup("takephoto");
    startupRadioSetup("recordvideo");
    startupRadioSetup("choosephotos");
    startupRadioSetup("choosevideos");
    startupRadioSetup("choosefiles");
    startupSettingSetup();
    
}catch(e){}*/
/*try{
    var colorFilterCheckbox = document.getElementById("colorfiltercheckbox");
    var colorFilterRange = document.getElementById("colorfilterrange");
    var colorFilterNumber = document.getElementById("colorfilternumber");
    function setColorFilterSettings(){
        if(localStorage.getItem("colorfilterenabled") == "true"){
            colorFilterCheckbox.checked = 1;
        }else{
            colorFilterCheckbox.checked = 0;
        }
        colorFilterRange.value = localStorage.getItem("colorfiltervalue");
        colorFilterNumber.value = localStorage.getItem("colorfiltervalue");
    }
    setColorFilterSettings();
    colorFilterCheckbox.onchange = function(){
        if(this.checked){
            lightFilter.style.display = "block";
        }else{
            lightFilter.style.display = "none";
        }
        localStorage.setItem("colorfilterenabled", this.checked);
    };
    colorFilterRange.oninput = function(){
        setFilterValue(this.value);
        colorFilterNumber.value = this.value;
    };
    colorFilterNumber.oninput = function(){
        setFilterValue(this.value);
        colorFilterRange.value = this.value;
    };
}catch(e){}*/
function setLoadOnScroll(){
    if(localStorage.getItem("loadonscroll") != "false"){
        loadOnScroll.checked = 1;
    }else{
        loadOnScroll.checked = 0;
    }
}
try{
    var loadOnScroll = document.getElementById("loadonscroll");
    setLoadOnScroll();
    loadOnScroll.onchange = function(){
        localStorage.setItem("loadonscroll", this.checked);
    };
}catch(e){}
try{
    var cameramoveabletakephotobutton = document.getElementById("cameramoveabletakephotobutton");
    var camerafullscreenonclick = document.getElementById("camerafullscreenonclick");
    var cameravideoonlyonclick = document.getElementById("cameravideoonlyonclick");
    var camerablackscreenondblclick = document.getElementById("camerablackscreenondblclick");
}catch(e){}
try{
    var cameraemergencymode = document.getElementById("cameraemergencymode");
    var directrecordvideo = document.getElementById("directrecordvideo");
    var directlivestream = document.getElementById("directlivestream");
    var directemergencymode = document.getElementById("directemergencymode");
}catch(e){}
try{
    var mobilewebappmodemainapppage = document.getElementById("mobilewebappmodemainapppage");
    var mobilewebappmodecamera = document.getElementById("mobilewebappmodecamera");
    var mobilewebappmodehiddencamera = document.getElementById("mobilewebappmodehiddencamera");
}catch(e){}
try{
    var takephotohiddencamera = document.getElementById("takephotohiddencamera");
    var recordvideohiddencamera = document.getElementById("recordvideohiddencamera");
    var livestreamhiddencamera = document.getElementById("livestreamhiddencamera");
    // var hiddencameracolorfulindicator = document.getElementById("hiddencameracolorfulindicator");
    var hiddencameravibration = document.getElementById("hiddencameravibration");
}catch(e){}
try{
    function setCheckboxOnstorage(checkbox, storageid){
        try{
            if(localStorage.getItem(storageid) == "true"){
                checkbox.checked = 1;
            }else{
                checkbox.checked = 0;
            }
        }catch(e){}
    }
    window.addEventListener("storage", function(){
        try{
            if(this.localStorage.getItem("darkmode")=="true"){
                onDarkModeChange(1);
            }else{
                onDarkModeChange(0);
                if(this.localStorage.getItem("darkmode")==null){
                    defaultTheme.checked=1;
                }else{
                    defaultTheme.checked=0;
                }
            }
        }catch(e){}
        try{
            languageSelect.value = lang;
            if(this.localStorage.getItem("lang")==null){
                defaultLang.checked=1;
            }else{
                defaultLang.checked=0;
            }
        }catch(e){}
        // setCheckboxOnstorage(saveUploads, "saveuploads");
        try{
            // setLocationSettings();
            setCheckboxSettings();
        }catch(e){}
        try{
            locationCacheTimeoutInputSetup();
        }catch(e){}
        /*try{
            setLocationAttachSettings();
        }catch(e){}*/
        /*try{
            startupSettingSetup();
        }catch(e){}*/
        /*try{
            setReopenSettings();
        }catch(e){}*/
        /*try{
            setColorFilterSettings();
        }catch(e){}*/
        try{
            setLoadOnScroll();
        }catch(e){}
        setCheckboxOnstorage(cameramoveabletakephotobutton, "cameramoveabletakephotobutton");
        setCheckboxOnstorage(camerafullscreenonclick, "camerafullscreenonclick");
        setCheckboxOnstorage(cameravideoonlyonclick, "cameravideoonlyonclick");
        setCheckboxOnstorage(camerablackscreenondblclick, "camerablackscreenondblclick");
        setCheckboxOnstorage(cameraemergencymode, "cameraemergencymode");
        setCheckboxOnstorage(directrecordvideo, "directrecordvideo");
        setCheckboxOnstorage(directlivestream, "directlivestream");
        setCheckboxOnstorage(directemergencymode, "directemergencymode");
        setCheckboxOnstorage(mobilewebappmodemainapppage, "mobilewebappmodemainapppage");
        setCheckboxOnstorage(mobilewebappmodecamera, "mobilewebappmodecamera");
        setCheckboxOnstorage(mobilewebappmodehiddencamera, "mobilewebappmodehiddencamera");
        setCheckboxOnstorage(takephotohiddencamera, "takephotohiddencamera");
        setCheckboxOnstorage(recordvideohiddencamera, "recordvideohiddencamera");
        setCheckboxOnstorage(livestreamhiddencamera, "livestreamhiddencamera");
        // setCheckboxOnstorage(hiddencameracolorfulindicator, "hiddencameracolorfulindicator");
        setCheckboxOnstorage(hiddencameravibration, "hiddencameravibration");
        try{
            setSettingsLanguage(lang);
        }catch(e){}
    });
}catch(e){}
try{
    function colorInputSetup(name, defaultColor){
        var input = document.getElementById(name);
        var storage = localStorage.getItem(name);
        if(storage){
            input.value = storage;
        }else{
            input.value = defaultColor;
        }
        input.onchange = function(){
            localStorage.setItem(name, this.value);
            setDarkMode(darkModeEnabled);
        }
    }
    colorInputSetup("lightcolor", "#000000");
    colorInputSetup("lightbackgroundcolor", "#ffffff");
    colorInputSetup("darkcolor", "#ffffff");
    colorInputSetup("darkbackgroundcolor", "#000000");
}catch(e){}
try{
    var resetSettings = document.getElementById("resetsettings");
    resetSettings.onclick = function(){
        if(confirm(settingsStrings["resetsettings"]+"?")){
            localStorage.removeItem("darkmode");
            localStorage.removeItem("lang");
            localStorage.removeItem("timezone");
            setCookie("lang", "");
            setCookie("settingstimezone", "");
            // localStorage.setItem("saveuploads", true);
            // localStorage.removeItem("saveuploads");
            // resetLocationSettings();
            resetCheckboxSettings();
            try{
                for(var i = 0; i < 4; i++){
                    setLocationSettingDiv(checkboxSettings[i][0], null, true);
                }
            }catch(e){}
            localStorage.removeItem("locationcachetimeout");
            // resetLocationAttachSettings();
            //resetReopenSettings();
            //localStorage.removeItem("startupmode");
            //localStorage.removeItem("colorfilterenabled");
            //localStorage.setItem("colorfiltervalue", colorFilterDefaultValue);
            localStorage.removeItem("lightcolor");
            localStorage.removeItem("lightbackgroundcolor");
            localStorage.removeItem("darkcolor");
            localStorage.removeItem("darkbackgroundcolor");
            localStorage.removeItem("loadonscroll");
            darkmode();
            language();
            //colorfilter();
            localStorage.removeItem("cameramoveabletakephotobutton");
            localStorage.removeItem("camerafullscreenonclick");
            localStorage.removeItem("cameravideoonlyonclick");
            localStorage.removeItem("camerablackscreenondblclick");
            localStorage.removeItem("cameraemergencymode");
            localStorage.removeItem("directrecordvideo");
            localStorage.removeItem("directlivestream");
            localStorage.removeItem("directemergencymode");
            // localStorage.setItem("mobilewebappmodemainapppage", true);
            // localStorage.setItem("mobilewebappmodecamera", true);
            localStorage.removeItem("mobilewebappmodemainapppage");
            localStorage.removeItem("mobilewebappmodecamera");
            localStorage.removeItem("mobilewebappmodehiddencamera");
            localStorage.removeItem("takephotohiddencamera");
            localStorage.removeItem("recordvideohiddencamera");
            localStorage.removeItem("livestreamhiddencamera");
            // localStorage.removeItem("hiddencameracolorfulindicator");
            localStorage.removeItem("hiddencameravibration");
            localStorage.removeItem("hiddencameratitletakephoto");
            localStorage.removeItem("hiddencameratitlerecordvideo");
            localStorage.removeItem("hiddencameratitlelivestream");
            localStorage.removeItem("hiddencameraicontakephoto");
            localStorage.removeItem("hiddencameraiconrecordvideo");
            localStorage.removeItem("hiddencameraiconlivestream");
            localStorage.removeItem("hiddencameraopenfullscreenonclick");
            localStorage.removeItem("hiddencamerafullscreenbutton");
            localStorage.removeItem("hiddencameracolorfulindicatorsize");
            localStorage.removeItem("hiddencameracamerareadycolor");
            localStorage.removeItem("hiddencameracameranotreadycolor");
            localStorage.removeItem("hiddencameracameranotworkcolor");
            localStorage.removeItem("hiddencameracolorfulindicatorrecordingstarted");
            localStorage.removeItem("hiddencameracolorfulindicatoruploading");
            localStorage.removeItem("hiddencameracolorfulindicatoruploaded");
            localStorage.removeItem("hiddencameracolorfulindicatorerror");
            localStorage.removeItem("hiddencameravibrationrecordingstarted");
            localStorage.removeItem("hiddencameravibrationuploading");
            localStorage.removeItem("hiddencameravibrationuploaded");
            localStorage.removeItem("hiddencameravibrationerror");
            localStorage.removeItem("hiddencameradirectrecordvideo");
            localStorage.removeItem("hiddencameradirectlivestream");
            localStorage.removeItem("hiddencamerabackgroundimage");
            localStorage.removeItem("hiddencamerabackgroundimagecameraready");
            localStorage.removeItem("hiddencamerabackgroundimagecameranotready");
            localStorage.removeItem("hiddencamerabackgroundimagecameranotwork");
            localStorage.removeItem("hiddencamerabackgroundimagerecordingstarted");
            localStorage.removeItem("hiddencamerabackgroundimageuploading");
            localStorage.removeItem("hiddencamerabackgroundimageuploaded");
            localStorage.removeItem("hiddencamerabackgroundimageerror");
            localStorage.removeItem("hiddencamerafacingmode");
            localStorage.removeItem("camerawindowonfocusbuttonrecord_video");
            localStorage.removeItem("camerawindowonfocusbuttonlive");
            localStorage.removeItem("camerawindowonfocusbuttonemergency");
            try{
                setSettingsWindow(true);
            }catch(e){
                location.reload();
            }
        }
    };
}catch(e){}
try{
    checkboxSettingSetup(null, cameramoveabletakephotobutton/*, "cameramoveabletakephotobutton"*/);
    checkboxSettingSetup(null, camerafullscreenonclick/*, "camerafullscreenonclick"*/);
    checkboxSettingSetup(null, cameravideoonlyonclick/*, "cameravideoonlyonclick"*/);
    checkboxSettingSetup(null, camerablackscreenondblclick/*, "camerablackscreenondblclick"*/);
    checkboxSettingSetup(null, cameraemergencymode);
    checkboxSettingSetup(null, directrecordvideo/*, "directrecordvideo"*/);
    checkboxSettingSetup(null, directlivestream/*, "directlivestream"*/);
    checkboxSettingSetup(null, directemergencymode);
    checkboxSettingSetup(null, mobilewebappmodemainapppage/*, "mobilewebappmodemainapppage"*//*, 1*/);
    checkboxSettingSetup(null, mobilewebappmodecamera/*, "mobilewebappmodecamera"*//*, 1*/);
    checkboxSettingSetup(null, mobilewebappmodehiddencamera/*, "mobilewebappmodehiddencamera"*/);
    checkboxSettingSetup(null, takephotohiddencamera/*, "takephotohiddencamera"*/);
    checkboxSettingSetup(null, recordvideohiddencamera/*, "recordvideohiddencamera"*/);
    checkboxSettingSetup(null, livestreamhiddencamera/*, "livestreamhiddencamera"*/);
    // checkboxSettingSetup(null, hiddencameracolorfulindicator/*, "hiddencameracolorfulindicator"*/);
    checkboxSettingSetup(null, hiddencameravibration/*, "hiddencameravibration"*/);
    checkboxSettingSetup("hiddencameraopenfullscreenonclick");
    checkboxSettingSetup("hiddencamerafullscreenbutton");
    checkboxSettingSetup("hiddencameradirectrecordvideo");
    checkboxSettingSetup("hiddencameradirectlivestream");
}catch(e){}
try{
    inputSettingSetup("hiddencameratitletakephoto", null, null, ".");
    inputSettingSetup("hiddencameratitlerecordvideo", null, null, "..");
    inputSettingSetup("hiddencameratitlelivestream", null, null, "...");
}catch(e){}
function getBase64(file, onloadFunc){
    if(!file){
        return;
    }
    var fileReader = new FileReader();
    fileReader.onload = function(){
        onloadFunc(this.result);
    };
    fileReader.readAsDataURL(file);
}
function previewButtonSetup(button, id){
    button.onclick = function(){
        window.open().document.body.innerHTML = '<img src="' + localStorage.getItem(id) + '" style="width: 100%;height: 100%;object-fit: contain;">';
    };
    button.disabled = 0;
}
function clearButtonSetup(id, preview, buttonmode){
    var button = document.getElementById(id+"clear");
    button.onclick = function(){
        localStorage.removeItem(id);
        button.disabled = 1;
        if(buttonmode){
            preview.disabled = 1;
        }else{
            preview.src = "";
        }
    };
    button.disabled = 0;
}
function setImageSettingSetup(id, buttonmode){
    var input = document.getElementById(id);
    var preview = document.getElementById(id + "preview");
    if(localStorage.getItem(id)){
        if(buttonmode){
            previewButtonSetup(preview, id);
        }else{
            preview.src = localStorage.getItem(id);
        }
        clearButtonSetup(id, preview, buttonmode);
    }
    input.oninput = function(){
        getBase64(this.files[0], function(result){
            localStorage.setItem(id, result);
            if(buttonmode){
                previewButtonSetup(preview, id);
            }else{
                preview.src = localStorage.getItem(id);
            }
            clearButtonSetup(id, preview, buttonmode);
        });
    };
}
try{
    setImageSettingSetup("hiddencameraicontakephoto");
    setImageSettingSetup("hiddencameraiconrecordvideo");
    setImageSettingSetup("hiddencameraiconlivestream");
    setImageSettingSetup("hiddencamerabackgroundimage", true);
    setImageSettingSetup("hiddencamerabackgroundimagecameraready", true);
    setImageSettingSetup("hiddencamerabackgroundimagecameranotready", true);
    setImageSettingSetup("hiddencamerabackgroundimagecameranotwork", true);
    setImageSettingSetup("hiddencamerabackgroundimagerecordingstarted", true);
    setImageSettingSetup("hiddencamerabackgroundimageuploading", true);
    setImageSettingSetup("hiddencamerabackgroundimageuploaded", true);
    setImageSettingSetup("hiddencamerabackgroundimageerror", true);
}catch(e){}
try{
    inputSettingSetup("hiddencameracolorfulindicatorsize", null, null, 1);
    colorInputSetup("hiddencameracolorfulindicatorrecordingstarted", "#000040");
    colorInputSetup("hiddencameracolorfulindicatoruploading", "#404000");
    colorInputSetup("hiddencameracolorfulindicatoruploaded", "#004000");
    colorInputSetup("hiddencameracolorfulindicatorerror", "#400000");
}catch(e){}
try{
    inputSettingSetup("hiddencameravibrationrecordingstarted", null, null, 50);
    inputSettingSetup("hiddencameravibrationuploading", null, null, 50);
    inputSettingSetup("hiddencameravibrationuploaded", null, null, 100);
    inputSettingSetup("hiddencameravibrationerror", null, null, 150);
}catch(e){}
try{
    colorInputSetup("hiddencameracamerareadycolor", "#000000");
    colorInputSetup("hiddencameracameranotreadycolor", "#808080");
    colorInputSetup("hiddencameracameranotworkcolor", "#ff0000");
}catch(e){}
setSettingsLanguage(lang);
try{
    document.getElementById("opendirectrecordvideopage").onclick = function(){
        window.open("/app/camera/?recordvideo=1");
    };
    document.getElementById("opendirectlivestreampage").onclick = function(){
        window.open("/app/camera/?livestream=1");
    };
    document.getElementById("opendirectemergencymodepage").onclick = function(){
        window.open("/app/camera/?emergencymode=1");
    };
    document.getElementById("openhiddencameratakephotopage").onclick = function(){
        window.open("/hiddencamera?mode=takephoto");
    };
    document.getElementById("openhiddencamerarecordvideopage").onclick = function(){
        window.open("/hiddencamera?mode=recordvideo");
    };
    document.getElementById("openhiddencameralivestreampage").onclick = function(){
        window.open("/hiddencamera?mode=livestream");
    };
}catch(e){}
try{
    inputSettingSetup("hiddencamerafacingmode", null, null, "environment");
}catch(e){}
try{
    function consoleWarning(a,b){for(var i=0;i<3;i++){console.log("%c!!!!!!!!!!","color:#ff0000;font-size:64px;font-weight:bold;");console.log("%c"+a+"!","color:#ff0000;font-size:32px;font-weight:bold;");console.log("%c"+b,"font-size:25px");console.log("%c!!!!!!!!!!","color:#ff0000;font-size:64px;font-weight:bold;");}}
}catch(e){}
try{
    if("serviceWorker" in navigator){
        navigator.serviceWorker.register("/app/offlineserviceworker.js");
    }
}catch(e){}