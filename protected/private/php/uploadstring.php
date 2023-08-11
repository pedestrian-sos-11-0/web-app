<?php
    if(isset($_POST["id"]) && isset($_POST["key"])
    &&
    ctype_alnum($_POST["id"]) && ctype_alnum($_POST["key"])/*ctype_digit($_POST["id"])*//* && ctype_digit($_POST["key"])*//* && ctype_digit($_POST["string"]) && ctype_digit($_POST["type"])*/
    &&
    (isset($_POST["description"]) || (isset($_POST["latitude"]) || isset($_POST["longitude"]) || isset($_POST["altitude"]) || isset($_POST["accuracy"]) || isset($_POST["altitudeAccuracy"]) || isset($_POST["location_time"])))
    )    {
        define("upload", protectedPublicPath . "uploads/");
        // define("uploadstrings", upload . "strings/");
        // define("descriptions", uploadstrings . "descriptions/");
        // define("descriptiontimes", uploadstrings . "descriptiontimes/");
        // define("locations", uploadstrings . "locations/");
        // define("locationtimes", uploadstrings . "locationtimes/");
        define("secretPath", protectedPrivatePath . "secret/");
        define("uploadSecretsPath", secretPath . "uploads/");
        define("idsPath", uploadSecretsPath . "ids/");
        define("keysPath", uploadSecretsPath . "keys/");
        define("uploadfiles", upload . "files/");
        define("voices", uploadfiles . "voices/");
        $idPath = idsPath . $_POST["id"];
        $keyPath = keysPath . $_POST["id"];
        if(!(file_exists($idPath) && file_exists($keyPath) && password_verify($_POST["key"], file_get_contents($GLOBALS["keyPath"]))))    {
            exit("-1");
        }
        $n = file_get_contents($idPath);
        function getID(){
            $t = microtime();
            $t = explode(" ", $t);
            return $t[1] . substr($t[0], 2, -2);
        }
        // function saveData($dataPath, $timePath, $string)  {
        //     $dirPath = $dataPath . $GLOBALS["n"] . "/";
        //     if(!file_exists($dirPath))    {
        //         mkdir($dirPath);
        //     }
        //     $path = $dirPath . /*(count(scandir($dirPath)) - 2)*/getID() . ".txt";
        //     $dirPathT = $timePath . $GLOBALS["n"] . "/";
        //     if(!file_exists($dirPathT))    {
        //         mkdir($dirPathT);
        //     }
        //     $pathT = $dirPathT . /*(count(scandir($dirPathT)) - 2)*/getID() . ".txt";
        //     if(file_put_contents($path, $string))   {
        //         if(!file_put_contents($pathT, $GLOBALS["t_upload"])){
        //             echo("-5");
        //         }
        //         return TRUE;
        //     }
        //     return FALSE;
        // }
        $uploadLimits = parse_ini_file(protectedPrivatePath . "uploadlimits.ini");
        if(isset($_POST["description"]))    {
            define("maxDescriptionLength", $uploadLimits["max_description_length"]);
            $t_upload = time();
            if(maxDescriptionLength != -1){
                $descriptionText = mb_substr($_POST["description"], 0, maxDescriptionLength);
            }else{
                $descriptionText = $_POST["description"];
            }
            $mysqliConn = parse_ini_file(protectedPrivatePath . "mysqliconn.ini");
            $serverName = $mysqliConn["serverName"];
            $userName = $mysqliConn["userName"];
            $password = $mysqliConn["password"];
            $dbname = $mysqliConn["dbname"];
            $conn = mysqli_connect($serverName, $userName, $password, $dbname);
            if($conn){
                $stmt = $conn->prepare("INSERT INTO uploads_description (id, description_text, t) VALUES (?, ?, ?)");
                $stmt->bind_param("ssi", $n, $descriptionText, $t_upload);
                if($stmt->execute()){
                    if(isset($_POST["submit"]) || isset($_POST["ps"]))    {
                        /*if(!file_exists(descriptions . $_POST["id"] . ".txt"))    {
                            $descriptionHTML = file_get_contents(htmlPath . "uploaddescription.html");
                            $descriptionHTML = str_replace("value_n", $_POST["id"], str_replace("value_key", $_POST["key"], $descriptionHTML));
                            $descriptionHTML = str_replace("<php>MAX_DESCRIPTION_LENGTH</php>", maxDescriptionLength, $descriptionHTML);
                        }
                        else    {
                            $descriptionHTML = "<div style=\"border:1px solid #00ff00;padding:1px;\"><img width=\"16\" height=\"16\" src=\"/images/description.svg\"> <string>description</string>; <string>uploadcompleted</string></div>";
                        }
                        if(!glob(voices . $_POST["id"] . ".*"))    {
                            define("maxVoiceFileSize", 25000000);
                            $voiceHTML = file_get_contents(htmlPath . "uploadvoice.html");
                            $voiceHTML = str_replace("<php>MAX_VOICE_SIZE</php>", maxVoiceFileSize / 1000000, $voiceHTML);
                            $voiceHTML = str_replace("value_n", $_POST["id"], str_replace("value_key", $_POST["key"], $voiceHTML));
                        }
                        else    {
                            $voiceHTML = "<div style=\"border:1px solid #00ff00;padding:1px;\"><img width=\"16\" height=\"16\" src=\"/images/microphone.svg\"> <string>voice</string>; <string>uploadcompleted</string></div>";
                        }*/
                        $filesHTML = file_get_contents(htmlPath . "uploadfiles.html");
                        $filesHTML = str_replace("value_id", $_POST["id"], str_replace("value_key", $_POST["key"], $filesHTML));
                        $descriptionHTML = file_get_contents(htmlPath . "uploaddescription.html");
                        $descriptionHTML = str_replace("value_id", $_POST["id"], str_replace("value_key", $_POST["key"], $descriptionHTML));
                        $descriptionHTML = str_replace("<php>MAX_DESCRIPTION_LENGTH</php>", maxDescriptionLength, $descriptionHTML);
                        //if(file_exists(descriptions . $_POST["id"] . "/0.txt"))    {
                            $descriptionHTML .= "<div style=\"border:1px solid #00ff00;padding:1px;\"><img width=\"16\" height=\"16\" src=\"/images/description.svg\"> <string>description</string>; <string>uploadcompleted</string></div>";
                        //}
                        define("maxVoiceFileSize", $uploadLimits["max_voice_file_size"]);
                        $voiceHTML = file_get_contents(htmlPath . "uploadvoice.html");
                        $voiceHTML = str_replace("<php>MAX_VOICE_SIZE</php>", maxVoiceFileSize / 1000000, $voiceHTML);
                        $voiceHTML = str_replace("value_id", $_POST["id"], str_replace("value_key", $_POST["key"], $voiceHTML));
                        /*if(glob(voices . $_POST["id"] . "/0.*"))    {
                            $voiceHTML .= "<div style=\"border:1px solid #00ff00;padding:1px;\"><img width=\"16\" height=\"16\" src=\"/images/microphone.svg\"> <string>voice</string>; <string>uploadcompleted</string></div>";
                        }*/
                        $id = $_POST["id"];
                        $key = $_POST["key"];
                        // $uploadLocationAfterGot = !file_exists(locations . $n);
                        ob_start();
                        include(phpPath . "locationjs.php");
                        $locationHTML = ob_get_clean();
                        if(isset($_POST["a"])){
                            $filesHTML = str_replace("</form>", "<input type=\"hidden\" name=\"a\"></form>", $filesHTML);
                            $descriptionHTML = str_replace("</form>", "<input type=\"hidden\" name=\"a\"></form>", $descriptionHTML);
                            $voiceHTML = str_replace("</form>", "<input type=\"hidden\" name=\"a\"></form>", $voiceHTML);
                            $filesHTML = str_replace(".svg", ".png", $filesHTML);
                            $descriptionHTML = str_replace(".svg", ".png", $descriptionHTML);
                            $voiceHTML = str_replace(".svg", ".png", $voiceHTML);
                            $html = "<div style=\"border:2px solid #00ff00;\">" . getString("uploadcompleted") . "<br><a href=\"../?view&v0&n=" . $n . "\">" . getString("viewupload") . "</a></div>";
                            $html .= '<div>' . setLanguage($filesHTML) . '<br>' . setLanguage($descriptionHTML) . '<br>' . setLanguage($voiceHTML) . '<br>' . $locationHTML . '</div>';
                            include(phpPath . "index.php");
                        }else if(isset($_POST["ps"])){
                            //$psContent = file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/ps/index.php");
                            //echo(str_replace("}label", "}label,.buttons", str_replace("</h1>", "</h1><div style=\"border:2px solid #00ff00;\">upload completed<br><a href=\"../?view&n=" . $n . "\">view upload</a></div>", substr($psContent, strpos($psContent, "<!DOCTYPE html>")))));
                            $filesHTML = str_replace("</form>", "<input type=\"hidden\" name=\"ps\"></form>", $filesHTML);
                            $descriptionHTML = str_replace("</form>", "<input type=\"hidden\" name=\"ps\"></form>", $descriptionHTML);
                            $voiceHTML = str_replace("</form>", "<input type=\"hidden\" name=\"ps\"></form>", $voiceHTML);
                            $filesHTML = str_replace(".svg", ".png", $filesHTML);
                            $descriptionHTML = str_replace(".svg", ".png", $descriptionHTML);
                            $voiceHTML = str_replace(".svg", ".png", $voiceHTML);
                            //echo '<div>' . setLanguage($filesHTML/*, $GLOBALS["langJSON"]*/) . '<br>' . setLanguage($descriptionHTML/*, $GLOBALS["langJSON"]*/) . '<br>' . setLanguage($voiceHTML/*, $GLOBALS["langJSON"]*/) . '<br>' . $locationHTML . '</div>';
                            $topHtml = "<div style=\"border:2px solid #00ff00;\">" . getString("uploadcompleted") . "<br><a href=\"../?view&v0&n=" . $n . "\">" . getString("viewupload") . "</a></div>";
                            $bottomHtml = '<div>' . setLanguage($filesHTML/*, $GLOBALS["langJSON"]*/) . '<br>' . setLanguage($descriptionHTML/*, $GLOBALS["langJSON"]*/) . '<br>' . setLanguage($voiceHTML/*, $GLOBALS["langJSON"]*/) . '<br>' . $locationHTML . '</div>';
                            include($_SERVER["DOCUMENT_ROOT"] . "/ps/index.php");
                        }else{
                            if($lang != defaultLang)    {
                                $langget = "&lang=" . $lang;
                                $langinput = "<input type=\"hidden\" name=\"lang\" value=\"" . $lang . "\">";
                            }else{
                                $langget = "";
                                $langinput = "";
                            }
                            if(isset($_GET["noscript"])){
                                $noscript = "noscript";
                                $filesHTML = str_replace("<form", "<form action=\"?noscript" . $langget . "\"", $filesHTML);
                                $descriptionHTML = str_replace("<form", "<form action=\"?noscript" . $langget . "\"", $descriptionHTML);
                                $voiceHTML = str_replace("<form", "<form action=\"?noscript" . $langget . "\"", $voiceHTML);
                            }else{
                                $noscript = "";
                            }
                            $html = "<div class=\"boxs texts\">";
                            $html .= "<div class=\"texts\">#: " . $n . "</div><div><label for=\"link" . $n . "\"><img width=\"16\" height=\"16\" src=\"/images/link.svg\"><span class=\"link title\"><string>link</string></span></label><input type=\"text\" readonly value=\"" . getMainWebAddress() . "/?view&n=" . $n . "\" id=\"link" . $n . "\"></div><a href=\"?view&n=" . $n . $langget . "\" class=\"buttons afteruploadbuttons viewuploadsbuttons\"><img width=\"32\" height=\"32\" src=\"/images/viewicon.svg\">&nbsp;<span><string>viewupload</string></span></a><a href=\"?view&n=" . $n . $langget . "\" target=\"_blank\" class=\"buttons afteruploadbuttons viewuploadsbuttons\"><img width=\"32\" height=\"32\" src=\"/images/viewicon.svg\">&nbsp;<span><string>viewupload</string></span>&nbsp;<img width=\"32\" height=\"32\" src=\"/images/newtab.svg\"></a><br><br>";
                            $html .= $filesHTML;
                            $html .= "<br><br>";
                            $html .= $descriptionHTML;
                            $html .= "<br><br>";
                            $html .= $voiceHTML;
                            $html .= "<br><br>";
                            $html .= $locationHTML;
                            $html .= "</div>";
                            $html = str_replace("<!--AFTER_UPLOAD-->", $html, str_replace("<!--UPLOAD_RESPONSE-->", "<div class=\"texts\" style=\"border:1px solid #00ff00;padding:1px;\"><string>uploadcompleted</string></div><br>", file_get_contents(htmlPath . "indexapp" . $noscript . ".html")));
                            $html = str_replace("<htmllang>lang</htmllang>", $lang, $html);
                            $html = setLanguage($html/*, $GLOBALS["langJSON"]*/);
                            $html = str_replace("<php>LANG</php>", $langget, $html);
                            $html = str_replace("<!--LANG-->", $langinput, $html);
                            $html = str_replace("<php>langoptions</php>", getLangOptions(), $html);
                            echo $html;
                        }
                    }
                    else    {
                        echo("1");
                    }
                }else{
                    echo "-9";
                }
                $stmt->close();
                mysqli_close($conn);
            }
            // if(saveData(descriptions, descriptiontimes, $descriptionText)){
                
            // }else{
            //     exit("-6");
            // }
        }
        else/* if(isset($_POST["latitude"]) || isset($_POST["longitude"]) || isset($_POST["altitude"]) || isset($_POST["accuracy"]) || isset($_POST["altitudeAccuracy"]))*/   {
            define("maxLocationStringLength", $uploadLimits["max_location_string_length"]);
            // $location = substr($_POST["latitude"], 0, maxLocationStringLength) . ", " . substr($_POST["longitude"], 0, maxLocationStringLength);
            // $location = "";
            $correct = 0;
            function addLocationString($postname)    {
                // if($postname != "latitude"){
                //     if($postname == "longitude"){
                //         $GLOBALS["location"] .= ", ";
                //     }else{
                //         $GLOBALS["location"] .= "; ";
                //     }
                // }
                if(isset($_POST[$postname]) && is_numeric($_POST[$postname]))    {
                    // $GLOBALS["location"] .= substr($_POST[$postname], 0, maxLocationStringLength);
                    if(maxLocationStringLength != -1){
                        $GLOBALS[$postname] = substr($_POST[$postname], 0, maxLocationStringLength);
                    }else{
                        $GLOBALS[$postname] = $_POST[$postname];
                    }
                    if(!$GLOBALS["correct"]){
                        $GLOBALS["correct"] = 1;
                    }
                }
                else    {
                    // $GLOBALS["location"] .= '-';
                    $GLOBALS[$postname] = NULL;
                }
            }
            addLocationString("latitude");
            addLocationString("longitude");
            addLocationString("altitude");
            addLocationString("accuracy");
            addLocationString("altitudeAccuracy");
            addLocationString("location_time");
            if(!$correct){
                exit("-8");
            }
            $t_upload = time();
            $mysqliConn = parse_ini_file(protectedPrivatePath . "mysqliconn.ini");
            $serverName = $mysqliConn["serverName"];
            $userName = $mysqliConn["userName"];
            $password = $mysqliConn["password"];
            $dbname = $mysqliConn["dbname"];
            $conn = mysqli_connect($serverName, $userName, $password, $dbname);
            if($conn){
                $stmt = $conn->prepare("INSERT INTO uploads_location (id, latitude, longitude, altitude, accuracy, altitude_accuracy, location_time, t) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("sdddddii", $n, $GLOBALS["latitude"], $GLOBALS["longitude"], $GLOBALS["altitude"], $GLOBALS["accuracy"], $GLOBALS["altitudeAccuracy"], $GLOBALS["location_time"], $t_upload);
                if($stmt->execute()){
                    echo "1";
                }else{
                    echo "-7";
                }
                $stmt->close();
                mysqli_close($conn);
            }
            // if(saveData(locations, locationtimes, $location)){
                // echo "1";
            // }else{
                // echo "-7";
            // }
        }
        exit;
    }
?>