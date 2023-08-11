<?php
    define("protectedPath", dirname($_SERVER["DOCUMENT_ROOT"]) . "/protected/");
    define("protectedPublicPath", protectedPath . "public/");
    define("protectedPrivatePath", protectedPath . "private/");
    define("htmlPath", protectedPublicPath . "html/");
    define("phpPath", protectedPrivatePath . "php/");
    //define("jsonLanguagesPath", $_SERVER["DOCUMENT_ROOT"] . "/json/languages/");
    if(file_exists(phpPath . "setup.php")){
        require_once(phpPath . "setup.php");
    }
    function getMainWebAddress(){
        if(isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] === "on"){
            $protocol = "https";
        }else{
            $protocol = "http";
        }
        return $protocol . "://" . $_SERVER["HTTP_HOST"];
    }
    include(phpPath . "language.php");
    // if(isset($_GET["gethtml"]) && $_GET["gethtml"] == "settings"){
    //     //exit(str_replace("<php>langoptions</php>", getLangOptions(), file_get_contents(htmlPath . "settings.html")));
    //     exit(/*setLanguage(*/setLanguage(str_replace("<php>langoptions</php>", getLangOptions(), file_get_contents(htmlPath . "settings.html"))/*, $GLOBALS["langJSON"]*/)/*, getJSON("settings/"))*/);
    // }
    function echoConsoleWarningScript(){
        if((isset($GLOBALS["rawData"]) && !$GLOBALS["rawData"]) || !isset($GLOBALS["rawData"])){
            echo '<script>try{function consoleWarning(a,b){for(var i=0;i<3;i++){console.log("%c!!!!!!!!!!","color:#ff0000;font-size:64px;font-weight:bold;");console.log("%c"+a+"!","color:#ff0000;font-size:32px;font-weight:bold;");console.log("%c"+b,"font-size:25px");console.log("%c!!!!!!!!!!","color:#ff0000;font-size:64px;font-weight:bold;");}}consoleWarning("' . $GLOBALS["langJSON"]["warning"] . '","' . $GLOBALS["langJSON"]["consolewarning"] . '");}catch(e){}</script>';
        }
    }
    // if(strpos($_SERVER["REQUEST_URI"], /*"/" . basename(getcwd()) . */"/?") === 0)    {
    //     if(strpos($_SERVER["REQUEST_URI"], "&") !== FALSE)    {
    //         $_GET["n"] = substr($_SERVER["REQUEST_URI"], /*6*/2, strpos($_SERVER["REQUEST_URI"], "&") - 2);
    //     }
    //     else    {
    //         $_GET["n"] = substr($_SERVER["REQUEST_URI"], /*6*/2);
    //     }
    //     if(ctype_digit($_GET["n"]) || isset($_GET["view"]))    {
    //         include(phpPath . "view.php");
    //         //echoConsoleWarningScript();
    //         exit;
    //     }
    // }
    if((isset($_GET["view"]) && isset($_GET["n"]) && ctype_digit($_GET["n"])) || isset($_GET["view"]))    {
        include(phpPath . "view.php");
        exit;
    }
    if(isset($_GET["viewstring"]))    {
        include(phpPath . "viewstring.php");
    }
    if(!empty($_GET["download"])){
        include(phpPath . "download.php");
    }
    // header("X-Frame-Options: DENY");
    header("X-Frame-Options: SAMEORIGIN");
    require(phpPath . "security.php");
    include(phpPath . "uploadphotovideo.php");
    include(phpPath . "uploadstring.php");
    include(phpPath . "uploadvoice.php");
    include(phpPath . "live.php");
    include(phpPath . "emergencymode.php");
    /*if(!defined("notmain")){
        if(isset($_GET["noscript"])){
            $indexHTML = file_get_contents(htmlPath . "indexnoscript.html");
        }else{
            $indexHTML = file_get_contents(htmlPath . "index.html");
        }
        if($lang != defaultLang){
            $langget = "&lang=" . $lang;
        }
        else{
            $langget = "";
        }
        $indexHTML = str_replace("<php>LANG</php>", $langget, $indexHTML);
        $indexHTML = str_replace("<htmllang>lang</htmllang>", $lang, $indexHTML);
        $indexHTML = str_replace("<php>langoptions</php>", getLangOptions(), $indexHTML);
        $indexHTML = setLanguage($indexHTML);
        echo $indexHTML;
    }*/
    if(!defined("notmain")){
        include(phpPath . "index.php");
    }
    //echoConsoleWarningScript();
?>