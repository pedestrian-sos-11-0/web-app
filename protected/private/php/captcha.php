<?php
define("captchafiles", protectedPrivatePath . "captchafiles/");
define("captchaimages", captchafiles . "captchaimages/");
define("captchatexts", captchafiles . "captchatexts/");
session_set_cookie_params(array("httponly"=>TRUE));
session_start();
$imagePaths = [];
function createCaptcha(){
    $pathsOfCaptchaImages = array_slice(scandir(captchaimages), 2);
    $captchaImagesMaxIndex = count($pathsOfCaptchaImages) - 1;
    if($captchaImagesMaxIndex == -1){
        securitydataSetup();
        return;
    }
    $correctImagePath0 = $pathsOfCaptchaImages[random_int(0, $captchaImagesMaxIndex)];
    $correctImagesTypeCode = explode("_", pathinfo($correctImagePath0, PATHINFO_FILENAME))[1];
    $GLOBALS["captchaText"] = htmlspecialchars(file_get_contents(captchatexts . $correctImagesTypeCode . "/" . $GLOBALS["lang"] . ".txt"));
    if(defined("asciionly")){
        $GLOBALS["captchaText"] = toAscii($GLOBALS["captchaText"]);
    }
    $_SESSION["captchaImagesQuantity"] = random_int(9, 10);
    $imagePaths_n = random_int(0, $_SESSION["captchaImagesQuantity"] - 1);
    $GLOBALS["imagePaths"][$imagePaths_n] = $correctImagePath0;
    $_SESSION["captcha" . $imagePaths_n] = 1;
    for($i = 0; $i < $_SESSION["captchaImagesQuantity"]; $i++){
        if($i != $imagePaths_n){
            $GLOBALS["imagePaths"][$i] = $pathsOfCaptchaImages[random_int(0, $captchaImagesMaxIndex)];
            // if($GLOBALS["imagePaths"][$i] == $correctImagePath){
            if(explode("_", pathinfo($GLOBALS["imagePaths"][$i], PATHINFO_FILENAME))[1] == $correctImagesTypeCode){
                $_SESSION["captcha" . $i] = 1;
            }else{
                $_SESSION["captcha" . $i] = 0;
            }
        }
    }
    function getCaptchaImage($n){
        $img1 = imagecreatefrompng(captchaimages . $GLOBALS["imagePaths"][$n]);
        // $path = captchaimages . $GLOBALS["imagePaths"][$n];
        // if(exif_imagetype($path) == IMAGETYPE_PNG){
        //     $img1 = imagecreatefrompng($path);
        // }
        // else if(exif_imagetype($path) == IMAGETYPE_JPEG){
        //     $img1 = imagecreatefromjpeg($path);
        // }
        // $img1 = imagescale($img1, 128, 128);
        $randomQuantity = random_int(2, 10);
        for($i = 0; $i < $randomQuantity; $i++){
            $noiseMode = random_int(0, 2);
            if($noiseMode == 0){
                $x0 = random_int(0, 127);
                $y0 = random_int(0, 127);
                $x1 = $x0 + random_int(10, 20);
                $y1 = $y0 + random_int(10, 20);
                imagefilledrectangle($img1, $x0, $y0, $x1, $y1, imagecolorallocate($img1, random_int(0, 255), random_int(0, 255), random_int(0, 255)));
            }else if($noiseMode == 1){
                imagefilledellipse($img1, random_int(0, 127), random_int(0, 127), random_int(10, 20), random_int(10, 20), imagecolorallocate($img1, random_int(0, 255), random_int(0, 255), random_int(0, 255)));
            }else if($noiseMode == 2){
                $pointsArray = [];
                $pointsNum = random_int(3, 13);
                $x0;
                $y0;
                for($i = 0; $i < $pointsNum; $i++){
                    if($i == 0){
                        $x0 = random_int(0, 127);
                        $y0 = random_int(0, 127);
                        array_push($pointsArray, $x0, $y0);
                    }else{
                        $x = $x0 + random_int(10, 20);
                        $y = $y0 + random_int(10, 20);
                        array_push($pointsArray, $x, $y);
                    }
                }
                imagefilledpolygon($img1, $pointsArray, $pointsNum, imagecolorallocate($img1, random_int(0, 255), random_int(0, 255), random_int(0, 255)));
            }
        }
        $img0 = imagecreatetruecolor(128, 128);
        for($i = 0; $i < 128; $i+=4){
            for($j = 0; $j < 128; $j+=4){
                imagesetpixel($img0, $i, $j, imagecolorallocate($img0, random_int(0, 255), random_int(0, 255), random_int(0, 255)));
                imagesetpixel($img0, random_int(0, 127), random_int(0, 127), imagecolorallocate($img0, random_int(0, 255), random_int(0, 255), random_int(0, 255)));
            }
        }
        imagecopymerge($img1, $img0, 0, 0, 0, 0, 128, 128, 50);
        ob_start();
        imagepng($img1);
        // echo "data:image/png;base64," . base64_encode(ob_get_clean());
        return "data:image/png;base64," . base64_encode(ob_get_clean());
    }
    include(phpPath . "securityhtml.php");
    exit;
}
if(isset($_POST["submit"])){
    $correct = 1;
    for($i = 0; $i < $_SESSION["captchaImagesQuantity"]; $i++){
        if(isset($_SESSION["captcha" . $i])){
            if(!((($_SESSION["captcha" . $i] == 1) && isset($_POST["captcha" . $i])) || (($_SESSION["captcha" . $i] == 0) && !isset($_POST["captcha" . $i])))){
                $correct = 0;
                break;
            }
        }else{
            exit("SESSION COOKIE ERROR!");
        }
    }
    if($correct){
        securitydataSetup();
        session_destroy();
    }else{
        createCaptcha();
    }
    header("Location: " . $_SERVER["REQUEST_URI"]);
}else{
    createCaptcha();
}
?>