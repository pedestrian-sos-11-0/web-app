<?php
define("jsonLanguagesPath", $_SERVER["DOCUMENT_ROOT"] . "/json/languages/main/");
$jsonLangFiles = array_slice(scandir(jsonLanguagesPath), 2);
$languages = [];
foreach($jsonLangFiles as $file){
    $file = jsonLanguagesPath . $file;
    array_push($languages, [pathinfo($file, PATHINFO_FILENAME), json_decode(file_get_contents($file), TRUE)["langname"]]);
}
echo json_encode($languages);
?>