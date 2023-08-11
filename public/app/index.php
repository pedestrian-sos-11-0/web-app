<?php
define("notmain", "");
include($_SERVER["DOCUMENT_ROOT"] . "/index.php");
$uploadLimits = parse_ini_file(protectedPrivatePath . "uploadlimits.ini");
// if($lang != defaultLang){
//     $langget = "&lang=" . $lang;
// }
// else{
//     $langget = "";
// }
// if(isset($_GET["noscript"])){
//     include(htmlPath . "indexappnoscript.html");
// }else{
//     include(htmlPath . "indexapp.html");
// }
if(isset($_GET["noscript"])){
    $indexHTML = file_get_contents(htmlPath . "indexappnoscript.html");
}else{
    $indexHTML = file_get_contents(htmlPath . "indexapp.html");
}
if($lang != defaultLang){
    $langget = "&lang=" . $lang;
}
else{
    $langget = "";
}
$indexHTML = str_replace("<php>LANG</php>", $langget, $indexHTML);
$indexHTML = str_replace("<htmllang>lang</htmllang>", $lang, $indexHTML);
$indexHTML = str_replace("<php>langoptions</php>", getLangOptions(), $indexHTML);
if($uploadLimits["max_file_size"] == -1){
    $uploadLimits["max_file_size"] = "-";
}else{
    $uploadLimits["max_file_size"] = $uploadLimits["max_file_size"] / 1000000;
}
if($uploadLimits["max_num_files"] == -1){
    $uploadLimits["max_num_files"] = "-";
}
$indexHTML = str_replace("<php>max_file_size</php>", $uploadLimits["max_file_size"], $indexHTML);
$indexHTML = str_replace("<php>max_num_files</php>", $uploadLimits["max_num_files"], $indexHTML);
$indexHTML = setLanguage($indexHTML);
echo $indexHTML;
?>