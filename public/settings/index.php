<?php
define("notmain", "");
include "../index.php";
echo '<!DOCTYPE html><html><head>';
echo '<link rel="stylesheet" href="/styles/index.css"><link rel="stylesheet" href="/styles/settings.css">';
echo '<meta name="viewport" content="width=device-width, initial-scale=1.0"><meta charset="UTF-8">';
echo '</head><body><div id="main">';
echo '
    <div id="top">
        <a href="/" style="text-decoration: none;">
            <img width="64" height="64" src="/images/pedestriansos.svg">
            <h1>
                <span class="pedestrian">' . $langJSON["pedestrian"] . '</span>&nbsp;<span class="sos">SOS!</span>
            </h1>
        </a>
    </div>
';
echo '<div id="settingstop" style="display: flex;justify-content: space-between;align-items: center;padding: 4px;"><div style="display: flex;align-items: center;"><img width="32" height="32" src="/images/settings.svg">&nbsp;<h3 style="margin: 0;"><span class="settings">' . $langJSON["settings"] . '</span></h3></div></div><div class="settingsbottomline"></div><div id="settingscontent">';
echo str_replace("<php>langoptions</php>", getLangOptions(), /*setLanguage(*/setLanguage(file_get_contents(htmlPath . "settings.html")/*, $GLOBALS["langJSON"]*/)/*, getJSON("settings/"))*/);
echo '
    <br><br>
    <a href="/" class="buttons">
        <img width="64" height="64" src="/images/homepage.svg">&nbsp;<span class="gomainpage">' . $langJSON["gomainpage"] . '</span>
    </a>
    <br><br>
';
echo '</div></div><script src="/scripts/index.js"></script><script src="/scripts/settings.js"></script>';
echo '</body></html>';
?>