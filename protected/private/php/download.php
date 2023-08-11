<?php
    if(ctype_digit($_GET["download"]) && (strlen($_GET["download"]) <= 16)){
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
        define("livevideos", upload . "livevideos/");
        if(file_exists(photovideos . $_GET["download"])){
            ignore_user_abort(TRUE);
            define("tmpPath", protectedPrivatePath . "tmp/");
            // $zipFileName = tmpPath . hrtime(1) . ".zip";
            $zipFileName = tempnam(tmpPath, "zip");
            $zip = new ZipArchive();
            if($zip->open($zipFileName, ZipArchive::CREATE)===TRUE){
                $zip->addFromString("id.txt", $_GET["download"]);
                function getT($path){
                    $t = file_get_contents($path);
                    $datetime = date("Y-m-d H:i:s", $t);
                    $timezone = date('O');
                    return $datetime . ";\n" . $timezone . ";\n" . $t;
                }
                function addDataFromFile($zipdir, $path){
                    $GLOBALS["zip"]->addEmptyDir($zipdir);
                    $dirpath = $path . $_GET["download"];
                    if(!file_exists($dirpath)){
                        return;
                    }
                    $files = array_slice(scandir($dirpath), 2);
                    foreach($files as $file){
                        $GLOBALS["zip"]->addFile($dirpath . "/" . $file, $zipdir . "/" . $file);
                    }
                }
                addDataFromFile("photovideos", photovideos);
                // addData("photovideotimes", photovideotimes);
                // addData("locations", locations);
                // addData("locationtimes", locationtimes);
                // addData("descriptions", descriptions);
                // addData("descriptiontimes", descriptiontimes);
                addDataFromFile("voices", voices);
                function addDataFromString($dataZipdir, $timeZipdir, $tableName){
                    $sql = "SELECT * from uploads_" . $tableName . " WHERE id=" . $_GET["download"];
                    $result = mysqli_query($GLOBALS["conn"], $sql);
                    if(mysqli_num_rows($result) > 0){
                        if($dataZipdir){
                            $GLOBALS["zip"]->addEmptyDir($dataZipdir);
                        }
                        while($row = mysqli_fetch_assoc($result)){
                            if($dataZipdir){
                                if($tableName == "location"){
                                    $stringData = $row["latitude"] . ", " . $row["longitude"] . "; " . $row["altitude"] . "; " . $row["accuracy"] . "; " . $row["altitude_accuracy"] . "; " . $row["location_time"];
                                }else if($tableName == "description"){
                                    $stringData = $row["description_text"];
                                }
                                if(isset($stringData)){
                                    $GLOBALS["zip"]->addFromString($dataZipdir . "/" . $row["n"] . "." . ".txt", $stringData);
                                }
                            }
                            if($timeZipdir){
                                if(isset($row["file_name"])){
                                    $timeFileName = $row["file_name"];
                                }else{
                                    $timeFileName = $row["n"];
                                }
                                $GLOBALS["zip"]->addFromString($timeZipdir . "/" . $timeFileName . "." . ".txt", $row["t"]);
                                if(isset($row["file_type"]) && $row["file_type"] == 2){
                                    $liveFilePath = $row["file_name"] . "." . $row["file_extension"];
                                    $GLOBALS["zip"]->addFile(livevideos . "/" . $liveFilePath, "livevideos/" . $liveFilePath);
                                }
                            }
                            if(isset($row["emergencymode_t"]) && $row["emergencymode_t"]){
                                $GLOBALS["zip"]->addFromString("emergencymode_t.txt", $row["emergencymode_t"]);
                            }
                        }
                    }
                }
                $GLOBALS["zip"]->addEmptyDir("livevideos");
                $mysqliConn = parse_ini_file(protectedPrivatePath . "mysqliconn.ini");
                $serverName = $mysqliConn["serverName"];
                $userName = $mysqliConn["userName"];
                $password = $mysqliConn["password"];
                $dbname = $mysqliConn["dbname"];
                $conn = mysqli_connect($serverName, $userName, $password, $dbname);
                if($conn){
                    addDataFromString("locations", "locationtimes", "location");
                    addDataFromString("descriptions", "descriptiontimes", "description");
                    addDataFromString(NULL, "photovideotimes", "photovideo");
                    addDataFromString(NULL, "voicetimes", "voice");
                    addDataFromString(NULL, NULL, "main");
                    mysqli_close($conn);
                }
                // addData("voicetimes", voicetimes);
                /*$zipphotovideos = "photovideos";
                $zip->addEmptyDir($zipphotovideos);
                $pvdirpath = photovideos . $_GET["download"];
                $pvfiles = array_slice(scandir($pvdirpath), 2);
                foreach($pvfiles as $file){
                    $zip->addFile($pvdirpath . "/" . $file, $zipphotovideos . "/" . $file);
                }
                $zipphotovideotimes = "photovideotimes";
                $zip->addEmptyDir($zipphotovideotimes);
                $pvtdirpath = photovideotimes . $_GET["download"];
                $pvtfiles = array_slice(scandir($pvtdirpath), 2);
                foreach($pvtfiles as $file){
                    $zip->addFromString($zipphotovideotimes . "/" . $file, getT($pvtdirpath . "/" . $file));
                }
                $locationpath = locations . $_GET["download"] . ".txt";
                if(file_exists($locationpath)){
                    $zip->addFile($locationpath, "location.txt");
                    $zip->addFromString("locationtime.txt", getT(locationtimes . $_GET["download"] . ".txt"));
                }
                $descriptionpath = descriptions . $_GET["download"] . ".txt";
                if(file_exists($descriptionpath)){
                    $zip->addFile($descriptionpath, "description.txt");
                    $zip->addFromString("descriptiontime.txt", getT(descriptiontimes . $_GET["download"] . ".txt"));
                }
                $vtimePath = voicetimes . $_GET["download"] . ".txt";
                if(file_exists($vtimePath))    {
                    $voicePath = glob(voices . $_GET["download"] . ".*")[0];
                    $zip->addFile($voicePath, "voice." . pathinfo($voicePath, PATHINFO_EXTENSION));
                    $zip->addFromString("voicetime.txt", getT($vtimePath));
                }*/
                $zip->close();
                header("Content-Type: " . mime_content_type($zipFileName));
                header('Content-Disposition: attachment; filename="' . $_GET["download"] . '.zip"');
                header("Content-Length: " . filesize($zipFileName));
                // echo(file_get_contents($zipFileName));
                readfile($zipFileName);
                if(file_exists($zipFileName)){
                    unlink($zipFileName);
                }
                exit;
            }
        }
    }
?>