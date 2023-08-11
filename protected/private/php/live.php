<?php
    if(isset($_GET["live"]) && $_GET["live"] == "1"){
        define("upload", protectedPublicPath . "uploads/");
        define("uploadfiles", upload . "files/");
        define("livevideos", upload . "livevideos/");
        // define("livevideos2", upload . "livevideos2/");
        // define("livevideos3", upload . "livevideos3/");
        // define("livevideos4", upload . "livevideos4/");
        define("secretPath", protectedPrivatePath . "secret/");
        define("liveSecretsPath", secretPath . "live/");
        define("liveIdsPath", liveSecretsPath . "ids/");
        define("liveKeysPath", liveSecretsPath . "keys/");
        // define("uploadstrings", upload . "strings/");
        define("photovideos", uploadfiles . "photovideos/");
        // define("photovideotimes", uploadstrings . "photovideotimes/");
        define("uploadSecretsPath", secretPath . "uploads/");
        define("idsPath", uploadSecretsPath . "ids/");
        define("keysPath", uploadSecretsPath . "keys/");
        define("ffmpegPath", protectedPrivatePath . "ffmpeg.exe");
        function getID(){
            $t = microtime();
            $t = explode(" ", $t);
            return $t[1] . substr($t[0], 2, -2);
        }
        if(isset($_GET["setup"]) && $_GET["setup"] == "1"){
            function getKey($n)   {
                $key = "";
                for($i = 0; $i < $n; $i++)   {
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
            $live_n = getID();
            $live_id = getKey(32);
            $live_key = getKey(1000);
            $liveKeyHash = password_hash($live_key, PASSWORD_DEFAULT);
            $extension = "webm";
            // file_put_contents(livevideos . $live_n . "." . $extension, "");
            mkdir(livevideos . $live_n);
            file_put_contents(liveIdsPath . $live_id, $live_n);
            file_put_contents(liveKeysPath . $live_id, $liveKeyHash);
            $n = getID();
            $id = getKey(32);
            $key = getKey(1000);
            $keyHash = password_hash($key, PASSWORD_DEFAULT);
            // $dirPath = photovideos . $n . "/";
            $t = time();
            // if(mkdir($dirPath)){
                // $mysqliConn = parse_ini_file(protectedPrivatePath . "mysqliconn.ini");
                // $serverName = $mysqliConn["serverName"];
                // $userName = $mysqliConn["userName"];
                // $password = $mysqliConn["password"];
                // $dbname = $mysqliConn["dbname"];
                // $conn = mysqli_connect($serverName, $userName, $password, $dbname);
                // if($conn){
                //     $stmt = $conn->prepare("INSERT INTO uploads (id, t) VALUES (?, ?)");
                //     $stmt->bind_param("si", $n, $t);
                //     $stmt->execute();
                //     $stmt->close();
                //     mysqli_close($conn);
                // } 
                
            // }
            // file_put_contents($dirPath . $live_n, "");
            // $t = time();
            // $dirPath = photovideotimes . $n . '/';
            // if(!file_exists($dirPath)){
                // mkdir($dirPath);
            // }
            // file_put_contents($dirPath . getID() . ".txt", $t);
            file_put_contents(idsPath . $id, $n);
            file_put_contents(keysPath . $id, $keyHash);
            $mysqliConn = parse_ini_file(protectedPrivatePath . "mysqliconn.ini");
            $serverName = $mysqliConn["serverName"];
            $userName = $mysqliConn["userName"];
            $password = $mysqliConn["password"];
            $dbname = $mysqliConn["dbname"];
            $conn = mysqli_connect($serverName, $userName, $password, $dbname);
            if($conn){
                // $stmt = $conn->prepare("INSERT INTO uploads_main (id, t, id_key, password_key) VALUES (?, ?, ?, ?)");
                // $stmt->bind_param("siss", $n, $t, $id, $keyHash);
                $stmt = $conn->prepare("INSERT INTO uploads_main (id, t) VALUES (?, ?)");
                $stmt->bind_param("si", $n, $t);
                $stmt->execute();
                $stmt->close();
                $stmt = $conn->prepare("INSERT INTO uploads_photovideo (id, file_name, t, file_type, file_extension) VALUES (?, ?, ?, ?, ?)");
                $type = 2;
                $stmt->bind_param("ssiis", $n, $live_n, $t, $type, $extension);
                $stmt->execute();
                $stmt->close();
                // $stmt = $conn->prepare("INSERT INTO uploads_live (id, id_key, password_key) VALUES (?, ?, ?)");
                // $stmt->bind_param("sss", $n, $live_id, $liveKeyHash);
                // $stmt->execute();
                // $stmt->close();
                mysqli_close($conn);
            }
            if(/*file_exists(livevideos . $live_n . ".webm")*/file_exists(livevideos . $live_n) && file_exists(liveIdsPath . $live_id) && file_exists(liveKeysPath . $live_id)){
                echo "#" . $live_n . "|" . $live_id . "|" . $live_key . "|" . $n . "|" . $id . "|" . $key;
                // mkdir(livevideos2 . $live_n);
                // mkdir(livevideos3 . $live_n);
            }else{
                echo "0";
            }
        }else{
            if(isset($_POST["id"]) && isset($_POST["key"]) && ctype_alnum($_POST["id"]) && ctype_alnum($_POST["key"]) && file_exists(liveIdsPath . $_POST["id"]) && file_exists(liveKeysPath . $_POST["id"]) && password_verify($_POST["key"], file_get_contents(liveKeysPath . $_POST["id"]))){
                // $fileResource = fopen(livevideos . file_get_contents(liveIdsPath . $_POST["id"]) . ".webm", "a");
                // if(fwrite($fileResource, file_get_contents($_FILES["chunk"]["tmp_name"]))){
                //     echo "1";
                // }else{
                //     echo "-2";
                // }
                // fclose($fileResource);
                if(isset($_POST["chunk_n"]) && ctype_digit($_POST["chunk_n"])){
                    $chunkN = $_POST["chunk_n"];
                }else{
                    $chunkN = getID();
                }
                // file_put_contents(livevideos . file_get_contents(liveIdsPath . $_POST["id"]) . "/" . $_POST["chunk_n"] . ".webm", file_get_contents($_FILES["chunk"]["tmp_name"]));
                $additionalInfoNum = '';
                if(isset($_POST["additionalinfo"])){
                    if($_POST["additionalinfo"] == 1){
                        $additionalInfoNum = '1';
                    }else if($_POST["additionalinfo"] == 2){
                        $additionalInfoNum = '2';
                    }
                    if(!empty($additionalInfoNum)){
                        $additionalInfoNum = '_' . $additionalInfoNum;
                    }
                }
                $liveN = file_get_contents(liveIdsPath . $_POST["id"]);
                $livePath = livevideos . $liveN . "/";
                $chunkFilePath = $livePath . $chunkN . $additionalInfoNum . ".webm";
                // if(!file_exists($chunkFilePath)){
                //     move_uploaded_file($_FILES["chunk"]["tmp_name"], $chunkFilePath);
                // }
                if(file_exists($chunkFilePath)){
                    $chunkFilePath = substr($chunkFilePath, 0, -5) . "_" . getID() . "a.webm";
                }
                function getBeforeChar($string, $char){
                    if(strpos($string, $char) !== FALSE){
                        return substr($string, 0, strpos($string, $char));
                    }
                    return $string;
                }
                if(move_uploaded_file($_FILES["chunk"]["tmp_name"], $chunkFilePath)){
                    echo "1";
                    // for($i = 0; $i < count(array_slice(scandir($livePath), 2)); $i++){
                    //     $files = array_slice(scandir($livePath), 2);
                    //     natsort($files);
                    //     $n0 = count(array_slice(scandir(livevideos2 . $liveN), 2));
                    //     if(getBeforeChar(getBeforeChar($files[0], "_"), ".") != $n0){
                    //         break;
                    //     }
                    //     file_put_contents(livevideos4 . $liveN . ".webm", file_get_contents($livePath . $files[$i]), FILE_APPEND);
                    //     rename($livePath . $files[$i], livevideos2 . $liveN . "/" . $files[$i]);
                    //     $videoID = $n0 + $i;
                    //     // exec(ffmpegPath . ' -i ' . livevideos4 . $liveN . ".webm" . ' -ss ' . $videoID . ' -t 1 ' . livevideos3 . $liveN . '/' . $videoID . '.mp4');
                    //     exec(ffmpegPath . ' avconv -i ' . livevideos4 . $liveN . ".webm" . ' -ss ' . $videoID . ' -t 1 -codec: copy ' . livevideos3 . $liveN . '/' . $videoID . '.mp4');
                    // }
                }else{
                    echo "-2";
                }
                // move_uploaded_file($_FILES["chunk"]["tmp_name"], livevideos . file_get_contents(liveIdsPath . $_POST["id"]) . "lastlivechunk");
            }else{
                echo "-1";
            }
        }
        exit;
    }
?>