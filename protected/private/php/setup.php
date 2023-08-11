<?php
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
define("secretPath", protectedPrivatePath . "secret/");
define("uploadSecretsPath", secretPath . "uploads/");
define("idsPath", uploadSecretsPath . "ids/");
define("keysPath", uploadSecretsPath . "keys/");
define("tmpPath", protectedPrivatePath . "tmp/");
// define("userKeys", secretPath . "userkeys/");
// define("securityData", protectedPrivatePath . "securitydata/");
define("livevideos", upload . "livevideos/");
define("liveSecretsPath", secretPath . "live/");
define("liveIdsPath", liveSecretsPath . "ids/");
define("liveKeysPath", liveSecretsPath . "keys/");
// define("emergencymodes", uploadstrings . "emergencymodes/");
function createDirectoryIfNotExists($path)    {
    if(!file_exists($path))
        mkdir($path, 0777, true);
}
createDirectoryIfNotExists(photovideos);
// define("photovideothumbnails", uploadfiles . "photovideothumbnails/");
// createDirectoryIfNotExists(photovideothumbnails);
// createDirectoryIfNotExists(photovideotimes);
// createDirectoryIfNotExists(descriptiontimes);
// createDirectoryIfNotExists(locationtimes);
// createDirectoryIfNotExists(voicetimes);
// createDirectoryIfNotExists(descriptions);
// createDirectoryIfNotExists(locations);
createDirectoryIfNotExists(voices);
createDirectoryIfNotExists(uploadSecretsPath);
createDirectoryIfNotExists(idsPath);
createDirectoryIfNotExists(keysPath);
createDirectoryIfNotExists(tmpPath);
// createDirectoryIfNotExists(userKeys);
// createDirectoryIfNotExists(securityData);
createDirectoryIfNotExists(livevideos);
createDirectoryIfNotExists(liveSecretsPath);
createDirectoryIfNotExists(liveIdsPath);
createDirectoryIfNotExists(liveKeysPath);
// createDirectoryIfNotExists(emergencymodes);
include(phpPath . "mysqlisetup.php");
rename(phpPath . "setup.php", phpPath . "setup.php.txt");
?>