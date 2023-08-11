<?php
    if(!isset($GLOBALS["filesName"])){
        define("notmain", "");
        include($_SERVER["DOCUMENT_ROOT"] . "/index.php");
    }
?>
<!DOCTYPE html><html><head><title>PS!</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body><form method="post" enctype="multipart/form-data"><input type="file" accept="image/*,video/*" required multiple name="photovideo[]"><input type="submit" name="0"></form><?php
    if(!empty($errorHTML)){
        echo '<br>' . $errorHTML . '<br>';
    }
    if(isset($GLOBALS["uploaded"]) && $GLOBALS["uploaded"] && isset($GLOBALS["filesName"])){
        echo '<br><a href="/?view&n=' . $GLOBALS["filesName"] . '">#' . $GLOBALS["filesName"] . '</a><br>';
    }
?><br><a href="/">/</a></body></html>