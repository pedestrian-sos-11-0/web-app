<?php
    define("defaultLang", "en");
    define("jsonLanguagesPath", $_SERVER["DOCUMENT_ROOT"] . "/json/languages/main/");
    if(!empty($_GET["lang"])){
        $lang = $_GET["lang"];
    }
    else if(!empty($_COOKIE["lang"])){
        $lang = $_COOKIE["lang"];
    }
    else if(!empty($_SERVER['HTTP_ACCEPT_LANGUAGE'])){
        $lang = explode(",", $_SERVER['HTTP_ACCEPT_LANGUAGE'])[0];
    }
    else{
        $lang = defaultLang;
    }
    $lang = substr($lang, 0, 2);
    if(!(ctype_alnum($lang) && (strpos(realpath(jsonLanguagesPath/* . "main/"*/ . $lang . ".json"), realpath(jsonLanguagesPath)) === 0) && file_exists(jsonLanguagesPath/* . "main/"*/ . $lang . ".json"))){
        $lang = defaultLang;
    }
    /*function getJSON($path){
        return json_decode(file_get_contents(jsonLanguagesPath . $path . $GLOBALS["lang"] . ".json"), 1);
    }*/
    //$langJSON = getJSON("main/");
    $langJSON = json_decode(file_get_contents(jsonLanguagesPath . $lang . ".json"), 1);
    function getLangOptions($asciionly = ""){
        if($asciionly == ""){
            $asciionly = defined("asciionly");
        }
        $langOptions = '';
        $jsonLangFiles = array_slice(scandir(jsonLanguagesPath/* . "main/"*/), 2);
        if($asciionly){
            foreach($jsonLangFiles as $file){
                $file = jsonLanguagesPath . $file;
                $langOptions .= toAscii('<option value="' . pathinfo($file, PATHINFO_FILENAME) . '">' . json_decode(file_get_contents($file), TRUE)["langname"] . '</option>');
            }
        }else{
            foreach($jsonLangFiles as $file){
                $file = jsonLanguagesPath/* . "main/"*/ . $file;
                $langOptions .= '<option value="' . pathinfo($file, PATHINFO_FILENAME) . '">' . json_decode(file_get_contents($file), TRUE)["langname"] . '</option>';
            }
        }
        return $langOptions;
    }
    function setLanguage($html/*, $json*/) {
        if(defined("asciionly")){
            foreach($GLOBALS["langJSON"] as $key => $val)   {
                $html = str_replace("<string>" . $key . "</string>", toAscii($val), $html);
            }
        }else{
            foreach(/*$json*/$GLOBALS["langJSON"] as $key => $val)   {
                $html = str_replace("<string>" . $key . "</string>", $val, $html);
            }
        }
        return $html;
    }
    function toAscii($string){
        return transliterator_transliterate("Any", $string);
    }
    if(isset($_GET["asciionly"]) && $_GET["asciionly"] == 1){
        define("asciionly", "");
        function getString($key){
            return toAscii($GLOBALS["langJSON"][$key]);
        }
    }else{
        function getString($key){
            return $GLOBALS["langJSON"][$key];
        }
    }
    function echoString($key){
        echo getString($key);
    }
?>