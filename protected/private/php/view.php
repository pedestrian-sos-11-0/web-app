<?php
    define("upload", protectedPublicPath . "uploads/");
    define("uploadfiles", upload . "files/");
    // define("uploadstrings", upload . "strings/");
    define("photovideos", uploadfiles . "photovideos/");
    // define("photovideotimes", uploadstrings . "photovideotimes/");
    // define("descriptiontimes", uploadstrings . "descriptiontimes/");
    // define("descriptions", uploadstrings . "descriptions/");
    // define("locations", uploadstrings . "locations/");
    // define("locationtimes", uploadstrings . "locationtimes/");
    define("voices", uploadfiles . "voices/");
    // define("voicetimes", uploadstrings . "voicetimes/");
    define("voicePublicPath", "?view&v=uploads/files/voices/");
    if(isset($_GET["v"])){
        $path = realpath(protectedPublicPath . $_GET["v"]);
        if(strpos($path, realpath(protectedPublicPath)) === 0){
            if(is_file($path)){
                $mimeContentType = mime_content_type($path);
                if((strpos($mimeContentType, "image/") === FALSE) && (strpos($mimeContentType, "video/") === FALSE) && (strpos($mimeContentType, "audio/") === FALSE)){
                    // header("X-Frame-Options: DENY");
                    header("X-Frame-Options: SAMEORIGIN");
                }
                header("Content-Type: " . $mimeContentType);
                header("Content-Length: " . filesize($path));
                // if(strpos($path, "descriptions") !== FALSE){
                    // echo htmlspecialchars(file_get_contents($path));
                // }else{
                    // echo file_get_contents($path);
                    readfile($path);
                // }
            }else{
                // header("X-Frame-Options: DENY");
                header("X-Frame-Options: SAMEORIGIN");
                foreach(scandir($path) as $link){
                    echo "<a href=\"?view&v=" . $_GET["v"] . "/" . $link . "\">" . $link . "</a><br>";
                }
            }
            exit;
        }else{
            http_response_code(404);
            exit("ERROR 404");
        }
    }
    // header("X-Frame-Options: DENY");
    header("X-Frame-Options: SAMEORIGIN");
    function setValue($name, $value, $html) {
        return str_replace("<php>" . $name . "</php>", $value, $html);
    }
    function setTimezone($timezone, $invert){
        if(ctype_digit($timezone)){
            $timezone = "+" . $timezone;
        }
        $timezonesign = substr($timezone, 0, 1);
        if($invert){
            if($timezonesign == "+"){
                $timezonesign = "-";
            }else if($timezonesign == "-"){
                $timezonesign = "+";
            }
        }
        $timezonenum = substr($timezone, 1);
        if(($timezonesign == "+") || ($timezonesign == "-") && (ctype_digit($timezonenum))){
            if(!$invert){
                $timezonenum /= 60;
            }
            $timezonenum = round($timezonenum);
            if($timezonesign == "-"){
                $maxGMT = 14;
            }else if($timezonesign == "+"){
                $maxGMT = 12;
            }
            if($timezonenum > $maxGMT){
                $timezonenum = $maxGMT;
            }
            date_default_timezone_set("Etc/GMT" . $timezonesign . $timezonenum);
        }
    }
    $rawData = isset($_GET["raw"]) && ($_GET["raw"] == 1);
    $v0 = isset($_GET["v0"]);
    if($rawData){
        header("Access-Control-Allow-Origin: *");
    }
    if(!$rawData){
        if(!empty($_COOKIE["settingstimezone"])){
            setTimezone($_COOKIE["settingstimezone"], 1);
        }else if(!empty($_COOKIE["timezone"])){
            setTimezone($_COOKIE["timezone"], 0);
        }
    }
    function getT($t){
        if($GLOBALS["rawData"]){
            return $t;
        }else{
            $datetime = date("Y-m-d H:i:s", $t);
            $timezone = date('O');
            return $datetime . "<br><div>" . $timezone . "<br>" . $t . "</div>";
        }
    }
    define("textLengthDisplay", 100);
    define("textNewlineDisplay", 4);
    function getNoData(){
        return "<span style=\"background-color:#ff000080;\" class=\"nodata\">" . $GLOBALS["langJSON"]["nodata"] . "</span>";
    }
    function getVal($val){
        if($val){
            return $val;
        }else{
            if($GLOBALS["rawData"]){
                return "-";
            }else{
                return getNoData();
            }
        }
    }
    function getData($mainRow, $rawData, $v0)  {
        $emergencyMode = $mainRow["emergencymode_t"];
        if($rawData)    {
            $dataArray = [$mainRow["id"]];
        }
        else if($v0){
            echo '#: ' . $mainRow["id"] . '<hr>';
        }
        else    {
            $html = file_get_contents(htmlPath . "view.html");
            $html = setValue("N", $mainRow["id"], $html);
            $html = setValue("LINK", $mainRow["id"] . $GLOBALS["langget"], $html);
            $html = setValue("FULLLINK", getMainWebAddress() . "/?view&n=" . $mainRow["id"], $html);
            $emergencyModeHtml = '';
            if(isset($emergencyMode)){
                $emergencyModeHtml = '
                    <div class="boxs">
                        <img width="16" height="16" src="/images/emergency.svg"><span class="emergencymode"><string>emergencymode</string></span>
                        <div>
                            ' . getT($emergencyMode) . '
                        </div>
                    </div>
                ';
            }
            $html = setValue("EMERGENCYMODE", $emergencyModeHtml, $html);
        }
        $dirPublicPath = "?view&v=uploads/files/photovideos/" . $mainRow["id"] . "/";
        $sql = "SELECT * from uploads_photovideo WHERE id=" . $mainRow["id"];
        $result = mysqli_query($GLOBALS["conn"], $sql);
        $numRows = mysqli_num_rows($result);
        if($numRows > 0){
            $i = 0;
            $allFile = (isset($_GET["all"]) && ($_GET["all"] == "file"));
            if($rawData){
                $filePaths = array();
                $timeDatas = array();
                $fileTypes = [];
            }else if(!$v0){
                $photovideoHTML = "";
            }
            while($row = mysqli_fetch_assoc($result)){
                if($i == 1 && !$allFile){
                    break;
                }
                if($row["file_type"] == 2){
                    // $path = "?view&v=uploads/livevideos/" . $row["file_name"] . "." . $row["file_extension"];
                    $path = "?view&v=uploads/livevideos/" . $row["file_name"];
                    if($v0){
                        echo $GLOBALS["langJSON"]["livestream"] . '<br>';
                    }
                }else{
                    $path = $dirPublicPath . $row["file_name"] . "." . $row["file_extension"];
                }
                if($rawData)    {
                    if($row["file_type"] == 0){
                        $fileType = "image";
                    }else if($row["file_type"] == 1){
                        $fileType = "video";
                    }else if($row["file_type"] == 2){
                        $fileType = "live";
                        // $path = "?view&v=uploads/livevideos/" . $row["file_name"] . "." . $row["file_extension"];
                    }
                    array_push($filePaths, $path);
                    array_push($timeDatas, $row["t"]);
                    array_push($fileTypes, $fileType);
                }else if($v0){
                    echo '<a href="'.$path.'">'.basename($path).'</a><br>';
                    echo getT($row["t"]);
                    if($numRows - $i != 1){
                        if(!$allFile && $i == 0){
                            echo "<br>";
                        }else{
                            echo "<hr>";
                        }
                    }
                }else{
                    if($row["file_type"] == 0)    {
                        $tagName = "img";
                        $attributes = "";
                        $fileTypeTag = "<img width=\"16\" height=\"16\" src=\"images/photo.svg\"><span class=\"photo\"><string>photo</string></span>";
                    }
                    else if($row["file_type"] == 1)   {
                        $tagName = "video";
                        $attributes = " controls";
                        $fileTypeTag = "<img width=\"16\" height=\"16\" src=\"images/video.svg\"><span class=\"video\"><string>video</string></span>";
                    }else if($row["file_type"] == 2){
                        $tagName = "video";
                        $attributes = " controls";
                        $fileTypeTag = "<img width=\"16\" height=\"16\" src=\"images/live.svg\"><span class=\"livestream\"><string>livestream</string></span>";
                        // $path = "?view&v=uploads/livevideos/" . $row["file_name"] . "." . $row["file_extension"];
                    }
                    $photovideoTag = "<" . $tagName . $attributes . " src=\"" . $path . "\"></" . $tagName . ">";
                    $photovideoHTML .= '
                        <div class="filetype">' . $fileTypeTag . '</div>
                        <br>
                        <div class="photovideo">' . $photovideoTag . '</div>
                        <br>
                        <div class="buttonsdivs">
                            <a href="' . $path . '" class="buttons"><img width="32" height="32" src="images/open.svg"> <span class="open"><string>open</string></span></a>
                            <a target="_blank" href="' . $path . '" class="buttons"><img width="32" height="32" src="images/newtab.svg"></a>
                            <a target="_blank" href="' . $path . '" download="' . $mainRow["id"] . "_" . $row["file_name"] . '" class="buttons"><img width="32" height="32" src="images/download.svg"> <span class="download"><string>download</string></span></a>
                        </div>
                        <br>
                        <div class="pvtime">' . getT($row["t"]) . '</div>
                    ';
                    if($row["file_type"] == 2){
                        $photovideoHTML .= '<br><a href="?view&v=uploads/livevideos/'.$row["file_name"].'">'.$row["file_name"].'</a>';
                    }
                    if($numRows - $i != 1){
                        if(!$allFile && $i == 0){
                            $photovideoHTML .= "<br>";
                        }else{
                            $photovideoHTML .= "<hr>";
                        }
                    }
                }
                $i++;
            }
            if($rawData){
                array_push($dataArray, $filePaths, $timeDatas, $fileTypes);
            }else if($v0){
                if($numRows > 1 && !$allFile){
                    echo '<a href="?view&v0&n=' . $mainRow["id"] . '&all=file">...</a>';
                }
            }else{
                if($numRows > 1 && !$allFile){
                    $photovideoHTML .= '<a href="?view&n=' . $mainRow["id"] . '&all=file" class="buttons"><img width="32" height="32" src="images/multiple.svg"> <span class="viewall"><string>viewall</string></span></a>';
                    $photovideoHTML .= '<a target="_blank" href="?view&n=' . $mainRow["id"] . '&all=file" class="buttons"><img width="32" height="32" src="images/newtab.svg"></a>';
                }
                $html = setValue("PHOTOVIDEO", $photovideoHTML, $html);
            }
        }
        $sql = "SELECT * from uploads_location WHERE id=" . $mainRow["id"];
        $result = mysqli_query($GLOBALS["conn"], $sql);
        $numRows = mysqli_num_rows($result);
        if($numRows > 0){
            if($rawData){
                $locationData = [];
                $locationTime = [];
            }else if($v0){
                echo '<hr>';
            }else{
                $locationHTML = '';
            }
            $i = 0;
            $allLocation = (isset($_GET["all"]) && ($_GET["all"] == "location"));
            while($row = mysqli_fetch_assoc($result)){
                if($i == 1 && !$allLocation){
                    break;
                }
                $latitude = getVal($row["latitude"]);
                $longitude = getVal($row["longitude"]);
                $altitude = getVal($row["altitude"]);
                $altitude = getVal($row["altitude"]);
                $accuracy = getVal($row["accuracy"]);
                $altitude_accuracy = getVal($row["altitude_accuracy"]);
                $location_time = getVal($row["location_time"]);
                if(is_numeric($location_time)){
                    $location_time = getT($row["location_time"] / 1000);
                }
                if($rawData){
                    array_push($locationData, [$latitude, $longitude, $altitude, $accuracy, $altitude_accuracy, $location_time]);
                    array_push($locationTime, $row["t"]);
                }else if($v0){
                    echo '<a href="?viewstring&location='.$row["n"].'">'.$GLOBALS["langJSON"]["locationcoordinates"].'</a><br>';
                    echo getT($row["t"]);
                    if($numRows - $i != 1){
                        if(!$allLocation && $i == 0){
                            echo "<br>";
                        }else{
                            echo "<hr>";
                        }
                    }
                }else{
                    $maps = '
                    <div class="boxs">
                        <div>
                            <img width="32" height="32" src="images/maps.svg">
                            <span class="maps title"><string>maps</string></span>
                        </div>
                        <br>
                        <div>
                            <a target="_blank" href="https://www.bing.com/maps?where1=' . $latitude . ',' . $longitude . '" class="buttons"><img width="32" height="32" src="images/maps/bingmaps.ico"> <span>Bing Maps</span> <img width="32" height="32" src="images/newtab.svg"> <img width="32" height="32" src="images/leaving.svg"></a>
                            <a target="_blank" href="https://www.google.com/maps/place/' . $latitude . ',' . $longitude . '" class="buttons"><img width="32" height="32" src="images/maps/googlemaps.ico"> <span>Google Maps</span> <img width="32" height="32" src="images/newtab.svg"> <img width="32" height="32" src="images/leaving.svg"></a>
                            <a target="_blank" href="https://www.openstreetmap.org/?mlat=' . $latitude . '&mlon=' . $longitude . '" class="buttons"><img width="32" height="32" src="images/maps/openstreetmap.png"> <span>OpenStreetMap</span> <img width="32" height="32" src="images/newtab.svg"> <img width="32" height="32" src="images/leaving.svg"></a>
                        </div>
                    </div>
                    ';
                    $locationPublicPath = "?viewstring&location=" . $row["n"];
                    $locationButtons = "<div class=\"buttonsdivs\">";
                    $locationButtons .= "<a href=\"" . $locationPublicPath . "\" class=\"buttons\"><img width=\"32\" height=\"32\" src=\"images/open.svg\"> <span class=\"open\"><string>open</string></span></a>";
                    $locationButtons .= "<a target=\"_blank\" href=\"" . $locationPublicPath . "\" class=\"buttons\"> <img width=\"32\" height=\"32\" src=\"images/newtab.svg\"></a>";
                    $locationButtons .= "<a href=\"" . $locationPublicPath . "\" download=\"" . $mainRow["id"] . "\" class=\"buttons\"><img width=\"32\" height=\"32\" src=\"images/download.svg\"><span class=\"download\"><string>download</string></span></a>";
                    $locationButtons .= "</div>";
                    $locationHTML .= '
                        <div>
                            <img width="16" height="16" src="images/location.svg">
                            <span class="locationcoordinates title"><string>locationcoordinates</string></span>
                        </div>
                        <br>
                        <div>
                        <div class="latitudelongitude title"><string>latitudelongitude</string></div>
                        <div class="latlong">' . $latitude . ", " . $longitude . '</div>
                        </div>
                        <div>
                        <div class="altitude title"><string>altitude</string></div>
                        <div class="z">' . $altitude . '</div>
                        </div>
                        <div>
                        <div class="accuracy title"><string>accuracy</string></div>
                            <div class="accuracydiv">' . $accuracy . '</div>
                        </div>
                        <div>
                            <div class="altitudeaccuracy title"><string>altitudeaccuracy</string></div>
                            <div class="accuracyz">' . $altitude_accuracy . '</div>
                        </div>
                        <div>
                            <div class="detectdatetime title"><string>detectdatetime</string></div>
                            <div class="detectdatetimediv">' . $location_time . '</div>
                        </div>
                        <br>
                        ' . $locationButtons . '
                        <br>
                        <div class="ltime">' . getT($row["t"]) . '</div>
                    ' . $maps;
                    if($numRows - $i != 1 && $allLocation){
                        $locationHTML .= "<hr>";
                    }
                }
                $i++;
            }
            if(!$rawData && $numRows > 1 && $i == 1){
                if($v0){
                    echo '<a href="?view&v0&n=' . $mainRow["id"] . '&all=location">...</a>';
                }else{
                    $locationHTML .= '<br><a href="?view&n=' . $mainRow["id"] . '&all=location" class="buttons"><img width="32" height="32" src="images/multiple.svg"> <span class="viewall"><string>viewall</string></span></a>';
                    $locationHTML .= '<a target="_blank" href="?view&n=' . $mainRow["id"] . '&all=location" class="buttons"><img width="32" height="32" src="images/newtab.svg"></a>';
                }
            }
            if($v0){
                echo '<br>';
            }
        }else{
            if($rawData){
                $locationData = "";
                $locationTime = "";
            }else if(!$v0){
                $locationHTML = '
                    <div>
                        <img width="16" height="16" src="images/location.svg">
                        <span class="locationcoordinates title"><string>locationcoordinates</string></span>
                    </div>
                ' . getNoData();
            }
        }
        if($rawData)    {
            array_push($dataArray, $locationData, $locationTime);
        }
        else if(!$v0)    {
            $html = setValue("LOCATION", $locationHTML, $html);
        }
        $sql = "SELECT * from uploads_description WHERE id=" . $mainRow["id"];
        $result = mysqli_query($GLOBALS["conn"], $sql);
        $numRows = mysqli_num_rows($result);
        if($rawData){
            $descriptionData = [];
            $descriptionTime = [];
        }else if(!$v0){
            $descriptionHTML = "";
        }
        if($numRows > 0){
            if($v0){
                echo '<hr>';
            }    
            $allDescription = (isset($_GET["all"]) && ($_GET["all"] == "description"));
            $i = 0;
            while($row = mysqli_fetch_assoc($result)){
                if($i == 1 && !$allDescription){
                    break;
                }
                $row["description_text"] = htmlspecialchars($row["description_text"]);
                if($rawData){
                    array_push($descriptionData, $row["description_text"]);
                    array_push($descriptionTime, $row["t"]);
                }else if($v0){
                    echo '<a href="?viewstring&description='.$row["n"].'">'.$GLOBALS["langJSON"]["description"].'</a><br>';
                    echo getT($row["t"]);
                    if($numRows - $i != 1){
                        if(!$allDescription && $i == 0){
                            echo "<br>";
                        }else{
                            echo "<hr>";
                        }
                    }
                    if($numRows - $i != 1 && $allDescription){
                        echo "<hr>";
                    }
                }else{
                    if((substr_count($row["description_text"], "\n") + 1) > textNewlineDisplay){
                        $lastPos = 0;
                        for($i = 0; $i < textNewlineDisplay; $i++){
                            $lastPos = strpos($row["description_text"], "\n", $lastPos);
                            $lastPos++;
                        }
                        $moreTextIndex = $lastPos;
                    }
                    else if(strlen($row["description_text"]) > textLengthDisplay){
                        $moreTextIndex = textLengthDisplay;
                    }
                    if(isset($moreTextIndex)){
                        $description = substr_replace($row["description_text"], "<span id=\"moretext" . $mainRow["id"] . "\" class=\"moretext\" style=\"display:inline;vertical-align:initial;\">", $moreTextIndex, 0) . "</span><button id=\"seemore" . $mainRow["id"] . "\" class=\"seemore\" style=\"display:none;\">...&#62;&#62;</button>";
                    }else{
                        $description = $row["description_text"];
                    }
                    $descriptionPublicPath = "?viewstring&description=" . $row["n"];
                    $descriptionButtons = "<div class=\"buttonsdivs\">";
                    $descriptionButtons .= "<a href=\"" . $descriptionPublicPath . "\" class=\"buttons\"><img width=\"32\" height=\"32\" src=\"images/open.svg\"> <span class=\"open\"><string>open</string></span></a>";
                    $descriptionButtons .= "<a target=\"_blank\" href=\"" . $descriptionPublicPath . "\" class=\"buttons\"> <img width=\"32\" height=\"32\" src=\"images/newtab.svg\"></a>";
                    $descriptionButtons .= "<a href=\"" . $descriptionPublicPath . "\" download=\"" . $mainRow["id"] . "\" class=\"buttons\"><img width=\"32\" height=\"32\" src=\"images/download.svg\"><span class=\"download\"><string>download</string></span></a>";
                    $descriptionButtons .= "</div>";
                    $descriptionHTML .= '
                        <div>
                            <img width="16" height="16" src="images/description.svg">
                            <span class="description title"><string>description</string></span>
                        </div>
                        <br>
                        <div class="descriptiondiv">' . $description . '</div>
                        <br>
                        ' . $descriptionButtons . '
                        <br>
                        <div class="dtime">' . getT($row["t"]) . '</div>
                    ';
                    if($numRows - $i != 1 && $allDescription){
                        $descriptionHTML .= "<hr>";
                    }
                }
                $i++;
            }
            if(!$rawData && !$allDescription && $numRows > 1){
                if($v0){
                    echo '<a href="?view&v0&n=' . $mainRow["id"] . '&all=description">...</a>';
                }else{
                    $descriptionHTML .= '<br><a href="?view&n=' . $mainRow["id"] . '&all=description" class="buttons"><img width="32" height="32" src="images/multiple.svg"> <span class="viewall"><string>viewall</string></span></a>';
                    $descriptionHTML .= '<a target="_blank" href="?view&n=' . $mainRow["id"] . '&all=description" class="buttons"><img width="32" height="32" src="images/newtab.svg"></a>';
                }
            }
        }else{
            if($rawData){
                $descriptionData = "";
                $descriptionTime = "";
            }else if(!$v0){
                $descriptionHTML .= '
                    <div>
                        <img width="16" height="16" src="images/description.svg">
                        <span class="description title"><string>description</string></span>
                    </div>
                    ' . getNoData() . '
                ';
            }
        }
        if($rawData)    {
            array_push($dataArray, $descriptionData, $descriptionTime);
        }
        else if(!$v0)    {
            $html = setValue("DESCRIPTION", $descriptionHTML, $html);
        }
        $sql = "SELECT * from uploads_voice WHERE id=" . $mainRow["id"];
        $result = mysqli_query($GLOBALS["conn"], $sql);
        $numRows = mysqli_num_rows($result);
        if($rawData){
            $voicePaths = [];
            $voiceTimes = [];
        }else if(!$v0){
            $voiceHTML = '';
            $link = '';
        }
        if($numRows > 0){
            if($v0){
                echo '<hr>' . $GLOBALS["langJSON"]["voice"] . '<br>';
            }
            $i = 0;
            $allVoice = (isset($_GET["all"]) && ($_GET["all"] == "voice"));
            while($row = mysqli_fetch_assoc($result)){
                if($i == 1 && !$allVoice){
                    break;
                }
                $voicePath = voicePublicPath . $mainRow["id"] . "/" . $row["file_name"] . "." . $row["file_extension"];
                if($rawData){
                    array_push($voicePaths, $voicePath);
                    array_push($voiceTimes, $row["t"]);
                }else if($v0){
                    echo '<a href="'.$voicePath.'">'.basename($voicePath).'</a><br>';
                    echo getT($row["t"]);
                    if($numRows - $i != 1){
                        if(!$allVoice && $i == 0){
                            echo "<br>";
                        }else{
                            echo "<hr>";
                        }
                    }
                }else{
                    $voiceTag = "<audio controls src=\"" . $voicePath . "\"></audio>";
                    $voiceButtons = "<div class=\"buttonsdivs\">";
                    $voiceButtons .= "<a href=\"" . $voicePath . "\" class=\"buttons\"><img width=\"32\" height=\"32\" src=\"images/open.svg\"> <span class=\"open\"><string>open</string></span></a>";
                    $voiceButtons .= "<a target=\"_blank\" href=\"" . $voicePath . "\" class=\"buttons\"> <img width=\"32\" height=\"32\" src=\"images/newtab.svg\"></a>";
                    $voiceButtons .= "<a href=\"" . $voicePath . "\" download=\"" . $mainRow["id"] . "\" class=\"buttons\"><img width=\"32\" height=\"32\" src=\"images/download.svg\"><span class=\"download\"><string>download</string></span></a>";
                    $voiceButtons .= "</div>";
                    $voiceHTML .= '
                        <div>
                            <img width="16" height="16" src="images/microphone.svg">
                            <span class="voice title"><string>voice</string></span>
                        </div>
                        <br>
                        <div class="voicediv">' . $voiceTag . '</div>
                        <br>
                        ' . $voiceButtons . '
                        <br>
                        <div class="vtime">' . getT($row["t"]) . '</div>
                    ';
                    if($numRows - $i != 1 && $allVoice){
                        $voiceHTML .= "<hr>";
                    }
                }
                $i++;
            }
            if(!$rawData){
                if(!$allVoice && ($numRows > 1)){
                    if($v0){
                        echo '<a href="?view&v0&n=' . $mainRow["id"] . '&all=voice">...</a>';
                        echo '<hr>';
                    }else{
                        $voiceHTML .= '<br><a href="?view&n=' . $mainRow["id"] . '&all=voice" class="buttons"><img width="32" height="32" src="images/multiple.svg"> <span class="viewall"><string>viewall</string></span></a>';
                        $voiceHTML .= '<a target="_blank" href="?view&n=' . $mainRow["id"] . '&all=voice" class="buttons"><img width="32" height="32" src="images/newtab.svg"></a>';
                    }
                }
                if(!$v0){
                    $link = '<a href="' . voicePublicPath . $mainRow["id"] . '">..voices/' . $mainRow["id"] . '</a>';
                }
            }
        }else{
            if($rawData){
                $voicePaths = "";
                $voiceTimes = "";
            }else if(!$v0){
                $voiceHTML = '
                    <div>
                        <img width="16" height="16" src="images/microphone.svg">
                        <span class="voice title"><string>voice</string></span>
                    </div>
                ' . getNoData();
            }
        }
        if($rawData){
            array_push($dataArray, $voicePaths, $voiceTimes);
        }else if(!$v0){
            $html = setValue("VOICE", $voiceHTML, $html);
            $html = setValue("VLINK", $link, $html);
        }
        if($emergencyMode){
            if($rawData){
                array_push($dataArray, $emergencyMode);
            }else if($emergencyMode && $v0){
                echo '<hr>' . $GLOBALS["langJSON"]["emergencymode"] . '<br>' . getT($emergencyMode);
            }
        }
        if($rawData)    {
            return json_encode($dataArray);
        }
        else if($v0){
            return '<hr><a download href="?download='.$mainRow["id"].'">.zip</a><hr><a href="?view&v0&n='.$mainRow["id"].'">&#62;</a><hr><hr>';
        }
        else    {
            return setLanguage($html);
        }
    }
    $ajax = isset($_GET["ajax"]) && ($_GET["ajax"] == 1);
    $nGotAndCorrect = isset($_GET["n"]) && ctype_digit($_GET["n"]) && (strlen($_GET["n"]) <= 16);
    if($nGotAndCorrect){
        $nGetParameter = '&n='.$_GET["n"];
    }else{
        $nGetParameter = '';
    }
    if($v0){
        echo '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta charset="UTF-8"><title>' . $langJSON["viewuploads"] . ' | ' . $langJSON["pedestrian"] . ' SOS!</title></head>';
        echo '<body><a href="/">' . $langJSON["gomainpage"] . '</a><hr>';
        echo '<a href="?view'.$nGetParameter.'">'.$langJSON["viewuploads"].' 1</a><hr>';
    }
    else if(!$rawData && !$ajax)    {
        $topHTML = "<!DOCTYPE html><html><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><meta charset=\"UTF-8\"><link rel=\"stylesheet\" href=\"styles/view.css\"><title><string>viewuploads</string> | <string>pedestrian</string> SOS!</title></head>";
        $topHTML .= "<body><div id=\"main\"><div id=\"top\"><a href=\"/\" style=\"text-decoration: none;\"><img width=\"64\" height=\"64\" src=\"images/pedestriansos.svg\"> <h1><span class=\"pedestrian\"><string>pedestrian</string></span>&nbsp;<span id=\"sos\">SOS!</span></h1></a></div>";
        echo setLanguage($topHTML);
        echo '
        <h2>
            <span class="viewuploads">' . $langJSON["viewuploads"] . '</span>
        </h2>
        <a href="/" class="buttons">
            <img width="32" height="32" src="images/homepage.svg">&nbsp;<span class="gomainpage">' . $langJSON["gomainpage"] . '</span>
        </a>
        <br>
        ';
        echo '<br><a href="?view&v0'.$nGetParameter.'">'.$langJSON["viewuploads"].' 0</a><br>';
    }
    if(!$rawData){
        if($lang != defaultLang){
            $langget = "&lang=" . $lang;
        }
        else{
            $langget = "";
        }
    }
    $mysqliConn = parse_ini_file(protectedPrivatePath . "mysqliconn.ini");
    $serverName = $mysqliConn["serverName"];
    $userName = $mysqliConn["userName"];
    $password = $mysqliConn["password"];
    $dbname = $mysqliConn["dbname"];
    $conn = mysqli_connect($serverName, $userName, $password, $dbname);
    if($conn){
        if($nGotAndCorrect)    {
            if($v0){
                echo '<hr><hr>';
            }
            $sql = "SELECT * from uploads_main WHERE id=" . $_GET["n"];
            $result = mysqli_query($GLOBALS["conn"], $sql);
            if(mysqli_num_rows($result) > 0){
                while($row = mysqli_fetch_assoc($result)){
                    echo getData($row, $rawData, $v0);
                }
            }else{
                if($rawData)    {
                    /*return*/echo "0";
                }
                else    {
                    echo "<br>#: " . $_GET["n"] . "<br>" . getNoData() . "<br>";
                    // return;
                }
            }
        }
        else    {
            if(!$rawData && !$ajax){
                if($v0){
                    echo '<a href="?view&v=uploads/">..uploads/</a><hr><hr><hr>';
                }else{
                    echo '<br><a href="?view&v=uploads/">..uploads/</a><br>';
                }
            }
            $page = 0;
            $limitSQL = "";
            if(!$rawData || ($rawData && ((isset($_GET["t"]) && ctype_digit($_GET["t"])) || (isset($_GET["p"]) && ctype_digit($_GET["p"])))))    {
                define("maxQuantity", 10);
                if(isset($_GET["p"]) && ctype_digit($_GET["p"]))    {
                    $page = $_GET["p"];
                }
                $limitSQL = " LIMIT " . (maxQuantity * $page) . ", " . maxQuantity;
                $count = 0;
            }
            $timeFromSQL = "";
            if(isset($_GET["t"]) && ctype_digit($_GET["t"]))    {
                $topN = $_GET["t"];
                $timeFromSQL = " WHERE t < " . $_GET["t"];
            }
            $sql = "SELECT * from uploads_main" . $timeFromSQL . " ORDER BY n DESC" . $limitSQL;
            $result = mysqli_query($conn, $sql);
            if(mysqli_num_rows($result) > 0){
                if(!$rawData && !$ajax){
                    echo '<div id="content">';
                }
                $firstLoop = 1;
                while($row = mysqli_fetch_assoc($result)){
                    if($rawData){
                        if($firstLoop){
                            $firstLoop = 0;
                        }else{
                            echo ">";
                        }
                    }
                    echo getData($row, $rawData, $v0);
                    if(isset($count)){
                        if($count == 0){
                            if($timeFromSQL == ""){
                                $topN = $row["t"];
                            }   
                        }
                        $count++;
                    }
                }
                if(!$rawData && !$ajax && !$v0){
                    echo '</div>';
                }
                if(!$rawData)    {
                    $nextAvailable = ($count == maxQuantity);
                    if($nextAvailable && !$v0){
                        echo '<br><button class="buttons" id="viewmore" onclick="viewMore(this)" page="' . ($page + 1) . '" topn="' . $topN . '"><img width="32" height="32" src="images/viewmore.svg"> <span class="viewmore">' . $langJSON["viewmore"] . '</span></button><br>';
                    }
                    if(!$ajax){
                        if($v0){
                            if($page){
                                echo '<a href="?view&v0&p=' . ($page - 1) . "&t=" . $topN . $langget . '">&#60;&#60;&#160;' . $langJSON["previous"] . '</a>';
                            }
                            if($nextAvailable){
                                echo '<hr><a href="?view&v0&p=' . ($page + 1) . "&t=" . $topN . $langget . '">&#62;&#62;&#160;' . $langJSON["next"] . '</a>';   
                            }
                            if(isset($_GET["t"]) && ctype_digit($_GET["t"])){
                                echo '<hr>' . getT($_GET["t"]);
                                echo '<a href="?view&v0">' . $langJSON["viewnewest"] . '</a>';
                            }
                        }else{
                            echo '<div id="newcontent"></div><div class="loader" id="loader"></div><br><div id="loaderror"></div>';
                            if($page){
                                echo "<a href=\"?view&p=" . ($page - 1) . "&t=" . $topN . $langget . "\" class=\"buttons\"><span style=\"color:#256aff;font-size:32px;\">&#60;&#60;</span> <span class=\"previous\">" . $langJSON["previous"] . "</span></a>";
                            }
                            if($nextAvailable){
                                echo "<a href=\"?view&p=" . ($page + 1) . "&t=" . $topN . $langget . "\" class=\"buttons\"><span style=\"color:#256aff;font-size:32px;\">&#62;&#62;</span> <span class=\"next\">" . $langJSON["next"] . "</span></a>";   
                            }
                            if(isset($_GET["t"]) && ctype_digit($_GET["t"])){
                                echo '<br>' . getT($_GET["t"]);
                                echo '<br><a href="?view" class="buttons"><img width="32" height="32" src="images/viewicon.svg"> <span class="viewnewest">' . $langJSON["viewnewest"] . '</span></a>';
                            }
                        }
                    }
                }
            }else{
                if($rawData){
                    echo "0";
                }else{
                    echo("<br><br>" . getNoData());
                }
            }
        }
        mysqli_close($conn);
    }else{
        echo "-1";
    }
    if(!$rawData && !$ajax && !$v0)    {
        echo "<br><br></div><script src=\"scripts/view.js\"></script>";
        echoConsoleWarningScript();
        echo "</body></html>";
    }
?>