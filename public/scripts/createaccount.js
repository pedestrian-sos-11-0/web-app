var mainDiv = document.getElementById("main");
var strings;
function setLanguage(lang,get)  {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "json/languages/createaccount/" + lang + ".json");
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
            ajax.open("GET", "json/languages/main/" + lang + ".json");
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
var matchmedia = window.matchMedia("(prefers-color-scheme: dark)");
function onDarkModeChange(checked){
    if(typeof darkmodecheckbox != "undefined"){
        darkmodecheckbox.checked = checked;
    }
    if(typeof settingsWindowOverlay != "undefined" && typeof settingsWindow != "undefined"){
        setWindowDarkMode(settingsWindowOverlay, settingsWindow);
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
window.addEventListener("storage", function(){
    try{
        darkmode();
    }catch(e){}
    try{
        language();
    }catch(e){}
});
var agreeVerifyBtn = document.getElementById("agreeverifybutton");
var agreeVerifyCheckbox = document.getElementById("agreeverifycheckbox");
var registerDiv = document.getElementById("registerDiv");
agreeVerifyCheckbox.onchange = function(){
    agreeVerifyBtn.disabled = !this.checked;
    if(!this.checked){
        registerDiv.classList.add("disabled");
    }
};
agreeVerifyBtn.onclick = function(){
    registerDiv.classList.remove("disabled");
};