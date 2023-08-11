<?php
    if(!empty($_FILES["voice"]["tmp_name"]) && isset($_POST["id"]) && isset($_POST["key"]) && ctype_alnum($_POST["id"]) && ctype_alnum($_POST["key"])/*ctype_digit($_POST["id"])*//* && ctype_digit($_POST["key"])*/)    {
        define("upload", protectedPublicPath . "uploads/");
        define("uploadfiles", upload . "files/");
        // define("uploadstrings", upload . "strings/");
        define("voices", uploadfiles . "voices/");
        // define("voicetimes", uploadstrings . "voicetimes/");
        define("secretPath", protectedPrivatePath . "secret/");
        define("uploadSecretsPath", secretPath . "uploads/");
        define("idsPath", uploadSecretsPath . "ids/");
        define("keysPath", uploadSecretsPath . "keys/");
        $uploadLimits = parse_ini_file(protectedPrivatePath . "uploadlimits.ini");
        define("maxVoiceFileSize", $uploadLimits["max_voice_file_size"]);
        if((maxVoiceFileSize != -1) && (filesize($_FILES["voice"]["tmp_name"]) > maxVoiceFileSize))    {
            /*echoError*/exit("maximum voice file size is: " . (maxVoiceFileSize / 1000000) . "MB. (" . $_FILES["voice"]["name"] . ")");
            // return;
        }
        $idPath = idsPath . $_POST["id"];
        $keyPath = keysPath . $_POST["id"];
        if(!(file_exists($idPath) && file_exists($keyPath) && password_verify($_POST["key"], file_get_contents($keyPath))))    {
            exit("-1");
        }
        $n = file_get_contents($idPath);
        $allowedExtensions = array("avi", "mpeg", "ogv", "ts", "webm", "3gp", "3g2", "aac", "mp3", "oga", "opus", "wav", "weba", "mp4");
        //$extension = pathinfo($_FILES["voice"]["name"], PATHINFO_EXTENSION);
        $mimeContentType = mime_content_type($_FILES["voice"]["tmp_name"]);
        if(!$mimeContentType || (strpos($mimeContentType, '/') === FALSE))exit("-4");
        $file_info_array = explode("/", $mimeContentType);
        $type = $file_info_array[0];
        $extension = $file_info_array[1];
        if($extension === "x-msvideo")	{
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
        else if($extension === "mpeg")	{
            $extension = "mp3";
        }
        else if($extension === "ogg")	{
            $extension = "oga";
        }
        else if($extension === "webm")	{
            $extension = "weba";
        }
        if(($type !== "audio") && ($type !== "video"))    {
            exit("only audio files are allowed.");
        }
        if(!in_array($extension, $allowedExtensions))    {
            exit("allowed extensions are: " . implode(", ", $allowedExtensions) . '.');
        }
        $dirvoicepath = voices . $GLOBALS["n"] . "/";
        if(!file_exists($dirvoicepath)){
            mkdir($dirvoicepath);
        }
        function getID(){
            $t = microtime();
            $t = explode(" ", $t);
            return $t[1] . substr($t[0], 2, -2);
        }
        $fileName = getID();
        $voicepath = $dirvoicepath . /*(count(scandir($dirvoicepath)) - 2)*/$fileName . '.' . $extension;
        // $dirvoicepathT = voicetimes . $GLOBALS["n"] . "/";
        // if(!file_exists($dirvoicepathT)){
        //     mkdir($dirvoicepathT);
        // }
        // $voicepathT = $dirvoicepathT . /*(count(scandir($dirvoicepathT)) - 2)*/getID() . ".txt";
        if(move_uploaded_file($_FILES["voice"]["tmp_name"], $voicepath))  {
            $t = time();
            $mysqliConn = parse_ini_file(protectedPrivatePath . "mysqliconn.ini");
            $serverName = $mysqliConn["serverName"];
            $userName = $mysqliConn["userName"];
            $password = $mysqliConn["password"];
            $dbname = $mysqliConn["dbname"];
            $conn = mysqli_connect($serverName, $userName, $password, $dbname);
            if($conn){
                $stmt = $conn->prepare("INSERT INTO uploads_voice (id, file_name, t, file_extension) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("ssis", $n, $fileName, $t, $extension);
                $stmt->execute();
                $stmt->close();
                mysqli_close($conn);
            }
            // if(!file_put_contents($voicepathT, $t)){
            //     echo("-6");
            // }
            if(isset($_POST["submit"]) || isset($_POST["ps"]))    {
                /*if(!file_exists(uploadstrings . "descriptions/" . $_POST["id"] . ".txt"))    {
                    define("maxDescriptionLength", 100000);
                    $descriptionHTML = file_get_contents(htmlPath . "uploaddescription.html");
                    $descriptionHTML = str_replace("value_n", $_POST["id"], str_replace("value_key", $_POST["key"], $descriptionHTML));
                    $descriptionHTML = str_replace("<php>MAX_DESCRIPTION_LENGTH</php>", maxDescriptionLength, $descriptionHTML);
                }
                else    {
                    $descriptionHTML = "<div style=\"border:1px solid #00ff00;padding:1px;\"><img width=\"16\" height=\"16\" src=\"/images/description.svg\"> <string>description</string>; <string>uploadcompleted</string></div>";
                }
                if(!file_exists(glob(voices . $_POST["id"] . ".*")[0]))    {
                    $voiceHTML = file_get_contents(htmlPath . "uploadvoice.html");
                    $voiceHTML = str_replace("<php>MAX_VOICE_SIZE</php>", maxVoiceFileSize / 1000000, $voiceHTML);
                    $voiceHTML = str_replace("value_n", $_POST["id"], str_replace("value_key", $_POST["key"], $voiceHTML));
                }
                else    {
                    $voiceHTML = "<div style=\"border:1px solid #00ff00;padding:1px;\"><img width=\"16\" height=\"16\" src=\"/images/microphone.svg\"> <string>voice</string>; <string>uploadcompleted</string></div>";
                }*/
                $filesHTML = file_get_contents(htmlPath . "uploadfiles.html");
                $filesHTML = str_replace("value_id", $_POST["id"], str_replace("value_key", $_POST["key"], $filesHTML));
                define("maxDescriptionLength", $uploadLimits["max_description_length"]);
                $descriptionHTML = file_get_contents(htmlPath . "uploaddescription.html");
                $descriptionHTML = str_replace("value_id", $_POST["id"], str_replace("value_key", $_POST["key"], $descriptionHTML));
                $descriptionHTML = str_replace("<php>MAX_DESCRIPTION_LENGTH</php>", maxDescriptionLength, $descriptionHTML);
                /*if(file_exists(uploadstrings . "descriptions/" . $_POST["id"] . "/0.txt"))    {
                    $descriptionHTML .= "<div style=\"border:1px solid #00ff00;padding:1px;\"><img width=\"16\" height=\"16\" src=\"/images/description.svg\"> <string>description</string>; <string>uploadcompleted</string></div>";
                }*/
                $voiceHTML = file_get_contents(htmlPath . "uploadvoice.html");
                $voiceHTML = str_replace("<php>MAX_VOICE_SIZE</php>", maxVoiceFileSize / 1000000, $voiceHTML);
                $voiceHTML = str_replace("value_id", $_POST["id"], str_replace("value_key", $_POST["key"], $voiceHTML));
                //if(glob(voices . $_POST["id"] . "/0.*"))    {
                    $voiceHTML .= "<div style=\"border:1px solid #00ff00;padding:1px;\"><img width=\"16\" height=\"16\" src=\"/images/microphone.svg\"> <string>voice</string>; <string>uploadcompleted</string></div>";
                //}
                $id = $_POST["id"];
                $key = $_POST["key"];
                // $uploadLocationAfterGot = !file_exists(uploadstrings . "locations/" . $n);
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
            exit("-5");
        }
        exit;
    }
?>