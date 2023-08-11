<?php
if(!defined("nocaptcha")){
    define("nocaptcha", "");
}
    define("userKeys", protectedPrivatePath . "secret/userkeys/");
    define("securityData", protectedPrivatePath . "securitydata/");
    //define("uploadminmicrointerval", 50000);
    //define("uploadblockinterval", 10000);
    define("maxuploadsperinterval", 50);
    define("uploadcountresetinterval", 60);
    define("maxuploadsperintervalblock", 100);
    if(!empty($_COOKIE["id"]) && ctype_alnum($_COOKIE["id"]) && ctype_alnum($_COOKIE["key"]) && !empty($_COOKIE["key"]) && file_exists(userKeys . $_COOKIE["id"]) && password_verify($_COOKIE["key"], file_get_contents(userKeys . $_COOKIE["id"]))){
        if(isset($_FILES["photovideo"]) || isset($_POST["filelink"]) || (isset($_POST["id"]) && isset($_POST["key"]))){
            $securitydataArray = unserialize(file_get_contents(securityData . $_COOKIE["id"]));
            if((isset($securitydataArray[0]) && !$securitydataArray[0]) || !isset($securitydataArray[0])){
                http_response_code(403);
                exit("BLOCKED");
            }/*else if(microtime(1) * 1000000 - $securitydataArray[1] < uploadblockinterval){
                $exitString = "TOO MANY UPLOADS IN PERIOD; BLOCKED";
                $securitydataArray[0] = 0;
            }else if(microtime(1) * 1000000 - $securitydataArray[1] < uploadminmicrointerval){
                $exitString = "TOO MANY UPLOADS IN PERIOD";
            }*/
            //$securitydataArray[1] = microtime(1) * 1000000;
            if(++$securitydataArray[2] > maxuploadsperinterval){
                $exitString = "TOO MANY UPLOADS IN PERIOD";
                if($securitydataArray[2] > maxuploadsperintervalblock){
                    $exitString = "TOO MANY UPLOADS IN PERIOD; BLOCKED";
                    $securitydataArray[0] = 0;
                }
            }
            if(time() - $securitydataArray[1] >= uploadcountresetinterval){
                $securitydataArray[2] = 0;
                $securitydataArray[1] = time();
            }
            file_put_contents(securityData . $_COOKIE["id"], serialize($securitydataArray));
            if(!empty($exitString)){
                http_response_code(403);
                exit($exitString);
            }
        }
    }else{
        function securitydataSetup(){
            function getKey_security($n)   {
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
            //$id = hrtime(1) . random_int(0, 9);
            $id = getKey_security(32);
            $key = getKey_security(1000);
            file_put_contents(userKeys . $id, password_hash($key, PASSWORD_DEFAULT));
            file_put_contents(securityData . $id, serialize([1, 0, 0]));
            setcookie("id", $id, time() + (86400 * 1000), "/", "", "", TRUE);
            setcookie("key", $key, time() + (86400 * 1000), "/", "", "", TRUE);
        }
        if(!defined("nocaptcha")){
            include phpPath . "captcha.php";
        }/*else{
            securitydataSetup();
        }*/
    }
?>