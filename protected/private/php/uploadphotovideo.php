<?php
    if(isset($_FILES["photovideo"]) || isset($_POST["filelink"]))    {
        define("upload", protectedPublicPath . "uploads/");
        define("uploadfiles", upload . "files/");
        // define("uploadstrings", upload . "strings/");
        define("photovideos", uploadfiles . "photovideos/");
        // define("photovideotimes", uploadstrings . "photovideotimes/");
        // define("descriptiontimes", uploadstrings . "descriptiontimes/");
        // define("locationtimes", uploadstrings . "locationtimes/");
        // define("voicetimes", uploadstrings . "voicetimes/");
        // define("descriptions", uploadstrings . "descriptions/");
        // define("locations", uploadstrings . "locations/");
        define("voices", uploadfiles . "voices/");
        //define("maxFilesQuantity", 1000);
        define("secretPath", protectedPrivatePath . "secret/");
        define("uploadSecretsPath", secretPath . "uploads/");
        define("idsPath", uploadSecretsPath . "ids/");
        define("keysPath", uploadSecretsPath . "keys/");
        define("tmpPath", protectedPrivatePath . "tmp/");
        $htmlMode = (isset($_POST["submitform"]) || isset($_POST["submit"]) || isset($_POST["ps"]) || isset($_POST["a"]) || isset($_POST["0"]));
        /*function returnError($error){
            if($GLOBALS["htmlMode"]){
                return "<div style=\"border:2px solid #ff0000;overflow-wrap:break-word;\">" . $error . "</div>";
            }else{
                return $error;
            }
        }*/
        if($htmlMode){
            $errorHTML = "";
        }
        function echoError($error){
            if($GLOBALS["htmlMode"]){
                $GLOBALS["errorHTML"] .= "<div style=\"border:2px solid #ff0000;overflow-wrap:break-word;\">" . $error . "</div>";
            }else{
                echo $error;
            }
        }
        if(!function_exists("getString")){
            function getString($key){
                return $GLOBALS["langJSON"][$key];
            }
        }
        $correct = 1;
        $uploaded = 0;
        function exitError($error){
            echoError($error);
            $GLOBALS["correct"] = 0;
        }
        function getKey($n/*, $digitsOnly = 0*/)   {
            $key = "";
            for($i = 0; $i < $n; $i++)   {
                /*if($digitsOnly){
                    $mode = 0;
                }else{
                    $mode = random_int(0, 2);
                }*/
                $mode = random_int(0, 2);
                if($mode == 0){
                    $key .= random_int(0, 9);
                }else if($mode == 1){
                    $key .= chr(random_int(65, 90));
                }else{
                    $key .= chr(random_int(97, 122));
                }
            }
            return $key;
        }
        //$filesQuantity = count(scandir(photovideos)) - 2;
        //$filesName = hrtime(1);
        function getID(){
            $t = microtime(/*1*/);
            //return $t * 10**strlen(substr($t, strpos($t, ".") + 1));
            $t = explode(" ", $t);
            return $t[1] . substr($t[0], 2, -2);
        }
        if(isset($_POST["id"]) && isset($_POST["key"]) && ctype_alnum($_POST["id"]) && ctype_alnum($_POST["key"])/*ctype_digit($_POST["id"])*/){
            $uploadID = $_POST["id"];
            $uploadKey = $_POST["key"];
            $idPath = idsPath . $uploadID;
            $keyPath = keysPath . $uploadID;
            if(!(file_exists($idPath) && file_exists($keyPath) && password_verify($uploadKey, file_get_contents($keyPath))))    {
                exit("-7");
            }
            $uploadMainID = file_get_contents($idPath);
            $appendFileMode = 1;
        }else{
            $uploadMainID = getID();
        }
        /*if($filesQuantity >= maxFilesQuantity)    {
            exit("server total files quantity limit: " . maxFilesQuantity);
        }*/
        if(isset($_FILES["photovideo"])){
            if(empty($_FILES["photovideo"]["tmp_name"]))    {
                exitError("file is not chosen");
            }
        }else{
            if(isset($_POST["filelink"]) && strpos($_POST["filelink"], "http://") !== 0 && strpos($_POST["filelink"], "https://") !== 0){
                $_POST["filelink"] = "http://" . $_POST["filelink"];
            }
            if(empty($_POST["filelink"]))    {
                exitError("link is empty");
            }else if(!filter_var($_POST["filelink"], FILTER_VALIDATE_URL)){
                exitError("invalid URL");
            }else if(parse_url($_POST["filelink"], PHP_URL_SCHEME) != "http" && parse_url($_POST["filelink"], PHP_URL_SCHEME) != "https"){
                exitError("only http protocol is allowed");
            }
        }
        if($GLOBALS["correct"]){
            // define("maxFileSize", 25000000);
            $uploadLimits = parse_ini_file(protectedPrivatePath . "uploadlimits.ini");
            define("maxFileSize", $uploadLimits["max_file_size"]);
            define("allowedExtensions", array(/*image*/"bmp", "gif", "ico", "jpg", "png",/* "svg",*/ "tif", "webp", /*video*/"avi", "mpeg", "ogv", "ts", "webm", "3gp", "3g2", "mp4"));
            function upload($filePath, $fileName, $fileIndex, $uploadedFilesQuantity, $httppostuploadfile){
                // $fileIndex += $GLOBALS["dirFilesQuantity"];
                if((maxFileSize != -1) && (filesize($filePath) > maxFileSize))    {
                    echoError(getString("maxfilesize") . ": " . (maxFileSize / 1000000) . "MB. (" . $fileName . ")");
                    return;
                }
                $mimeContentType = mime_content_type($filePath);
                if(!$mimeContentType || (strpos($mimeContentType, '/') === FALSE)){
                    echoError("0 (" . $fileName . ")");
                    return;
                }
                $file_info_array = explode("/", $mimeContentType);
                $type = $file_info_array[0];
                $extension = $file_info_array[1];
                if(($extension === "vnd.microsoft.icon") || ($extension === "x-icon"))	{
                    $extension = "ico";
                }
                else if($extension === "jpeg")	{
                    $extension = "jpg";
                }
                else if($extension === "svg+xml")	{
                    $extension = "svg";
                }
                else if($extension === "tiff")	{
                    $extension = "tif";
                }
                else if($extension === "x-msvideo")	{
                    $extension = "avi";
                }
                else if($extension === "ogg")	{
                    $extension = "ogv";
                }
                else if($extension === "mp2t")	{
                    $extension = "ts";
                }
                else if($extension === "3gpp")	{
                    $extension = "3gp";
                }
                else if($extension === "3gpp2")	{
                    $extension = "3g2";
                }
                if(!(($type === "image") || ($type === "video")))    {
                    echoError(getString("onlyimgvid") . " (" . $fileName . ")");
                    return;
                }
                if(!in_array($extension, allowedExtensions))    {
                    echoError(getString("allowedext") . ": " . implode(", ", allowedExtensions) . ". (" . $fileName . ")");
                    return;
                }
                $dirPath = photovideos . $GLOBALS["uploadMainID"] . '/';
                if(!file_exists($dirPath)){
                    if(!mkdir($dirPath)){
                        exitError("-6");
                    }
                }
                $GLOBALS["photovideoName"] = getID();
                $path = $dirPath . $GLOBALS["photovideoName"] . '.' . $extension;
                if(($httppostuploadfile && move_uploaded_file($filePath, $path)) || rename($filePath, $path))  {
                    $GLOBALS["photovideoTime"] = time();
                    if($type === "image"){
                        $GLOBALS["photovideoType"] = 0;
                    }else{
                        $GLOBALS["photovideoType"] = 1;
                    }
                    $GLOBALS["photovideoExtension"] = $extension;
                    $GLOBALS["stmt"]->execute();
                    // $dirPath = photovideotimes . $GLOBALS["uploadMainID"] . '/';
                    // if(!file_exists($dirPath)){
                    //     mkdir($dirPath);
                    // }
                    // if(file_exists($dirPath)){
                    //     $dirFilePath = $dirPath . /*$fileIndex*/getID() . ".txt";
                    //     file_put_contents($dirFilePath, $GLOBALS["photovideoTime"]);
                    //     if(!file_exists($dirFilePath)){
                    //         echoError("-4 (" . $fileName . ")");
                    //     }
                    // }else{
                    //     echoError("-3");
                    // }
                    /*if(($uploadedFilesQuantity - $fileIndex) != 1){
                        return;
                    }*/
                    $GLOBALS["uploaded"] = 1;
                }else{
                    echoError("-1 (" . $fileName . ")");
                }
            }
            $directoryPath = photovideos . $GLOBALS["uploadMainID"];
            if(file_exists($directoryPath)){
                $dirFilesQuantity = count(scandir($directoryPath)) - 2;
            }else{
                $dirFilesQuantity = 0;
            }
            $mysqliConn = parse_ini_file(protectedPrivatePath . "mysqliconn.ini");
            $serverName = $mysqliConn["serverName"];
            $userName = $mysqliConn["userName"];
            $password = $mysqliConn["password"];
            $dbname = $mysqliConn["dbname"];
            $conn = mysqli_connect($serverName, $userName, $password, $dbname);
            function prepareMysqlPhotovideo(){
                $GLOBALS["stmt"] = $GLOBALS["conn"]->prepare("INSERT INTO uploads_photovideo (id, file_name, t, file_type, file_extension) VALUES (?, ?, ?, ?, ?)");
                $GLOBALS["stmt"]->bind_param("ssiis", $GLOBALS["uploadMainID"], $GLOBALS["photovideoName"], $GLOBALS["photovideoTime"], $GLOBALS["photovideoType"], $GLOBALS["photovideoExtension"]);
            }
            if(isset($_FILES["photovideo"])){
                if(is_countable($_FILES["photovideo"]["tmp_name"])){
                    $uploadedFilesQuantity = count($_FILES["photovideo"]["tmp_name"]);
                    define("maxNumFiles", $uploadLimits["max_num_files"]);
                    if((maxNumFiles != -1) && ($uploadedFilesQuantity > maxNumFiles)){
                        exitError(getString("maxfilesnum") . " " . maxNumFiles);
                    }
                    if($GLOBALS["correct"]){
                        prepareMysqlPhotovideo();
                        for($fileIndex = 0; $fileIndex < $uploadedFilesQuantity; $fileIndex++){
                            if(!empty($_FILES["photovideo"]["tmp_name"][$fileIndex])){
                                upload($_FILES["photovideo"]["tmp_name"][$fileIndex], $_FILES["photovideo"]["name"][$fileIndex], $fileIndex, $uploadedFilesQuantity, 1);
                            }else{
                                echoError(getString("filenotchosen"));
                            }
                        }
                        $stmt->close();
                    }
                }else{
                    prepareMysqlPhotovideo();
                    upload($_FILES["photovideo"]["tmp_name"], $_FILES["photovideo"]["name"], 0, 1, 1);
                    $stmt->close();
                }
            }else{
                $urldata = @file_get_contents($_POST["filelink"]);
                if($urldata === FALSE){
                    exitError("ERROR! (" . $_POST["filelink"] . ")");
                }else{
                    // $tmp = tmpPath . $filesName;
                    $tmp = tempnam(tmpPath, "linkphotovideofile");
                    file_put_contents($tmp, $urldata);
                    if(file_exists($tmp)){
                        prepareMysqlPhotovideo();
                        upload($tmp, $_POST["filelink"], 0, 1, 0);
                        $stmt->close();
                    }else{
                        exitError("-2 (" . $_POST["filelink"] . ")");
                    }
                    if(file_exists($tmp)){
                        unlink($tmp);
                    }
                }
            }
            if($GLOBALS["uploaded"]){
                // if(isset($GLOBALS["uploadID"]) && ctype_digit($GLOBALS["uploadID"]) && isset($GLOBALS["uploadKey"])){
                if(isset($GLOBALS["appendFileMode"]) && $GLOBALS["appendFileMode"] == 1){
                    $id = $GLOBALS["uploadID"];
                    $key = $GLOBALS["uploadKey"];
                }else{
                    $t = time();
                    $id = getKey(32/*, 1*/);
                    $secretIDpath = idsPath . $id;
                    file_put_contents($secretIDpath, $GLOBALS["uploadMainID"]);
                    if(!file_exists($secretIDpath)){
                        echoError("-8");
                    }
                    $key = getKey(1000);
                    $keyPath = keysPath . $id;
                    $keyHash = password_hash($key, PASSWORD_DEFAULT);
                    file_put_contents($keyPath, $keyHash);
                    if(!file_exists($keyPath)){
                        echoError("-5");
                    }
                    if($conn){
                        // $stmt = $conn->prepare("INSERT INTO uploads_main (id, t, id_key, password_key) VALUES (?, ?, ?, ?)");
                        // $stmt->bind_param("siss", $GLOBALS["uploadMainID"], $t, $id, $keyHash);
                        $stmt = $conn->prepare("INSERT INTO uploads_main (id, t) VALUES (?, ?)");
                        $stmt->bind_param("si", $GLOBALS["uploadMainID"], $t);
                        $stmt->execute();
                        $stmt->close();
                        mysqli_close($conn);
                    }
                }
                if($GLOBALS["htmlMode"])    {
                    if(isset($_POST["0"])){
                        include $_SERVER["DOCUMENT_ROOT"] . "/0/index.php";
                    }else{
                        define("maxDescriptionLength", $uploadLimits["max_description_length"]);
                        define("maxVoiceFileSize", $uploadLimits["max_voice_file_size"]);
                        $filesHTML = file_get_contents(htmlPath . "uploadfiles.html");
                        if(isset($GLOBALS["uploadID"])){
                            $filesHTML .= "<div style=\"border:1px solid #00ff00;padding:1px;\"><img width=\"16\" height=\"16\" src=\"/images/photovideo.svg\"> <string>files</string>; <string>uploadcompleted</string></div>";
                        }
                        $descriptionHTML = file_get_contents(htmlPath . "uploaddescription.html");
                        $descriptionHTML = str_replace("<php>MAX_DESCRIPTION_LENGTH</php>", maxDescriptionLength, $descriptionHTML);
                        $voiceHTML = file_get_contents(htmlPath . "uploadvoice.html");
                        $voiceHTML = str_replace("<php>MAX_VOICE_SIZE</php>", maxVoiceFileSize / 1000000, $voiceHTML);
                        $filesHTML = str_replace("value_id", $id, str_replace("value_key", $key, $filesHTML));
                        $descriptionHTML = str_replace("value_id", $id, str_replace("value_key", $key, $descriptionHTML));
                        $voiceHTML = str_replace("value_id", $id, str_replace("value_key", $key, $voiceHTML));
                        // $uploadLocationAfterGot = !file_exists(locations . $GLOBALS["uploadMainID"]);
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
                            $html = $errorHTML . "<div style=\"border:2px solid #00ff00;\">" . getString("uploadcompleted") . "<br><a href=\"../?view&v0&n=" . $GLOBALS["uploadMainID"] . "\">" . getString("viewupload") . "</a></div>";
                            $html .= '<div>' . setLanguage($filesHTML) . '<br>' . setLanguage($descriptionHTML) . '<br>' . setLanguage($voiceHTML) . '<br>' . $locationHTML . '</div>';
                            include(phpPath . "index.php");
                        }else if(isset($_POST["ps"]))    {
                            //$psContent = file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/ps/index.php");
                            //echo(str_replace("}label", "}label,.buttons", str_replace("</h1>", "</h1>" . $errorHTML . "<div style=\"border:2px solid #00ff00;\">upload completed<br><a href=\"../?view&n=" . $GLOBALS["uploadMainID"] . "\">view upload</a></div>", substr($psContent, strpos($psContent, "<!DOCTYPE html>")))));
                            $filesHTML = str_replace("</form>", "<input type=\"hidden\" name=\"ps\"></form>", $filesHTML);
                            $descriptionHTML = str_replace("</form>", "<input type=\"hidden\" name=\"ps\"></form>", $descriptionHTML);
                            $voiceHTML = str_replace("</form>", "<input type=\"hidden\" name=\"ps\"></form>", $voiceHTML);
                            $filesHTML = str_replace(".svg", ".png", $filesHTML);
                            $descriptionHTML = str_replace(".svg", ".png", $descriptionHTML);
                            $voiceHTML = str_replace(".svg", ".png", $voiceHTML);
                            //echo '<div>' . setLanguage($filesHTML/*, $GLOBALS["langJSON"]*/) . '<br>' . setLanguage($descriptionHTML/*, $GLOBALS["langJSON"]*/) . '<br>' . setLanguage($voiceHTML/*, $GLOBALS["langJSON"]*/) . '<br>' . $locationHTML . '</div>';
                            $topHtml = $errorHTML . "<div style=\"border:2px solid #00ff00;\">" . getString("uploadcompleted") . "<br><a href=\"../?view&v0&n=" . $GLOBALS["uploadMainID"] . "\">" . getString("viewupload") . "</a></div>";
                            $bottomHtml = '<div>' . setLanguage($filesHTML/*, $GLOBALS["langJSON"]*/) . '<br>' . setLanguage($descriptionHTML/*, $GLOBALS["langJSON"]*/) . '<br>' . setLanguage($voiceHTML/*, $GLOBALS["langJSON"]*/) . '<br>' . $locationHTML . '</div>';
                            include($_SERVER["DOCUMENT_ROOT"] . "/ps/index.php");
                        }else{
                            if($GLOBALS["lang"] != defaultLang)    {
                                $langget = "&lang=" . $GLOBALS["lang"];
                            }else{
                                $langget = "";
                            }
                            if(isset($_POST["submit"])){
                                $noscript = "noscript";
                                $filesHTML = str_replace("<form", "<form action=\"?noscript" . $langget . "\"", $filesHTML);
                                $descriptionHTML = str_replace("<form", "<form action=\"?noscript" . $langget . "\"", $descriptionHTML);
                                $voiceHTML = str_replace("<form", "<form action=\"?noscript" . $langget . "\"", $voiceHTML);
                            }else{
                                $noscript = "";
                            }
                            $html = "<div class=\"boxs\">";
                            $html .= "<div class=\"texts\">#: " . $GLOBALS["uploadMainID"] . "</div><div><label for=\"link" . $GLOBALS["uploadMainID"] . "\"><img width=\"16\" height=\"16\" src=\"/images/link.svg\"><span class=\"link title\"><string>link</string></span></label><input type=\"text\" readonly value=\"" . getMainWebAddress() . "/?view&n=" . $GLOBALS["uploadMainID"] . "\" id=\"link" . $GLOBALS["uploadMainID"] . "\"></div><a href=\"?view&n=" . $GLOBALS["uploadMainID"] . $langget . "\" class=\"buttons afteruploadbuttons viewuploadsbuttons\"><img width=\"32\" height=\"32\" src=\"/images/viewicon.svg\">&nbsp;<span><string>viewupload</string></span></a><a href=\"?view&n=" . $GLOBALS["uploadMainID"] . $langget . "\" target=\"_blank\" class=\"buttons afteruploadbuttons viewuploadsbuttons\"><img width=\"32\" height=\"32\" src=\"/images/viewicon.svg\">&nbsp;<span><string>viewupload</string></span>&nbsp;<img width=\"32\" height=\"32\" src=\"/images/newtab.svg\"></a><br><br>";
                            $html .= $filesHTML;
                            $html .= "<br><br>";
                            $html .= $descriptionHTML;
                            $html .= "<br><br>";
                            $html .= $voiceHTML;
                            $html .= "<br><br>";
                            $html .= $locationHTML;
                            $html .= "</div>";
                            $html = str_replace("<!--AFTER_UPLOAD-->", $html, str_replace("<!--UPLOAD_RESPONSE-->", $errorHTML . "<div class=\"texts\" style=\"border:1px solid #00ff00;padding:1px;\"><string>uploadcompleted</string></div><br>", file_get_contents(htmlPath . "indexapp" . $noscript . ".html")));
                            $html = str_replace("<htmllang>lang</htmllang>", $GLOBALS["lang"], $html);
                            $html = setLanguage($html/*, $GLOBALS["langJSON"]*/);
                            $html = str_replace("<php>LANG</php>", $langget, $html);
                            $html = str_replace("<php>langoptions</php>", getLangOptions(), $html);
                            echo $html;
                        }
                    }
                }
                else    {
                    if(isset($GLOBALS["uploadID"])){
                        echo "1";
                    }else{
                        echo '#' . $GLOBALS["uploadMainID"] . '|' . $id . '|' . $key;
                    }
                }
            }
        }
        if($GLOBALS["htmlMode"] && !empty($errorHTML) && !$GLOBALS["uploaded"]){
            if(isset($_POST["a"])){
                $html = $errorHTML;
                include(phpPath . "index.php");
                exit;
            }else if(isset($_POST["ps"])){
                $topHtml = $errorHTML;
                include($_SERVER["DOCUMENT_ROOT"] . "/ps/index.php");
                exit;
            }else{
                if(isset($_POST["submit"])){
                    $noscript = "noscript";
                }else{
                    $noscript = "";
                }
                if($GLOBALS["lang"] != defaultLang)    {
                    $langget = "&lang=" . $GLOBALS["lang"];
                }else{
                    $langget = "";
                }
                exit(str_replace("<!--UPLOAD_RESPONSE-->", $errorHTML, str_replace("<php>LANG</php>", $langget, str_replace("<php>langoptions</php>", getLangOptions(), str_replace("<htmllang>lang</htmllang>", $GLOBALS["lang"], (setLanguage(file_get_contents(htmlPath . "indexapp" . $noscript . ".html"))))))));
            }
        }
        else if(($GLOBALS["correct"] && $GLOBALS["uploaded"]) || !$GLOBALS["htmlMode"]){
            exit;
        }
    }
?>