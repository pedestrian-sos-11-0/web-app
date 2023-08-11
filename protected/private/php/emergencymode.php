<?php
    if(isset($_POST["emergencymode"]) && $_POST["emergencymode"] == "1"){
        if(isset($_POST["id"]) && isset($_POST["key"]) && ctype_alnum($_POST["id"]) && ctype_alnum($_POST["key"])){
            define("secretPath", protectedPrivatePath . "secret/");
            define("uploadSecretsPath", secretPath . "uploads/");
            define("idsPath", uploadSecretsPath . "ids/");
            define("keysPath", uploadSecretsPath . "keys/");
            $id = $_POST["id"];
            $key = $_POST["key"];
            $idPath = idsPath . $id;
            $keyPath = keysPath . $id;
            if(!(file_exists($idPath) && file_exists($keyPath) && password_verify($key, file_get_contents($keyPath))))    {
                exit;
            }
            define("upload", protectedPublicPath . "uploads/");
            // define("uploadstrings", upload . "strings/");
            // define("emergencymodes", uploadstrings . "emergencymodes/");
            // file_put_contents(emergencymodes . file_get_contents($idPath) . ".txt", time());
            // $path = emergencymodes . file_get_contents($idPath) . ".txt";
            // if(file_exists($path)){
            //     exit("-2");
            // }
            $t = time();
            $mysqliConn = parse_ini_file(protectedPrivatePath . "mysqliconn.ini");
            $serverName = $mysqliConn["serverName"];
            $userName = $mysqliConn["userName"];
            $password = $mysqliConn["password"];
            $dbname = $mysqliConn["dbname"];
            $conn = mysqli_connect($serverName, $userName, $password, $dbname);
            if($conn){
                // $stmt = $conn->prepare("UPDATE uploads_main SET emergencymode_t = ? WHERE id_key = ? AND emergencymode_t IS NULL");
                // $stmt->bind_param("is", $t, $id);
                $n = file_get_contents($idPath);
                $stmt = $conn->prepare("UPDATE uploads_main SET emergencymode_t = ? WHERE id = ? AND emergencymode_t IS NULL");
                $stmt->bind_param("is", $t, $n);
                if($stmt->execute()){
                    echo "1";
                }else{
                    echo "0";
                }
                $stmt->close();
                mysqli_close($conn);
            }else{
                echo "-3";
            }
            // if(file_put_contents($path, $t)){
            //     // echo "1";
            // }else{
            //     // echo "0";
            // }
        }else{
            echo "-1";
        }
        exit;
    }
?>