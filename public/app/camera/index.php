<?php
    define("notmain", "");
    include($_SERVER["DOCUMENT_ROOT"] . "/index.php");
?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
    <head>
        <meta charset="UTF-8">
        <title><?php echo $langJSON["camera"]; ?> | <?php echo $langJSON["pedestrian"]; ?> SOS!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/styles/camera.css">
        <meta name="title" content="<?php echo $langJSON["pedestrian"]; ?> SOS!">
        <meta name="description" content="<?php echo $langJSON["camera"]; ?>">
        <!-- <link rel="apple-touch-icon" sizes="57x57" href="/images/favicons/apple-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60" href="/images/favicons/apple-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72" href="/images/favicons/apple-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76" href="/images/favicons/apple-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/images/favicons/apple-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/images/favicons/apple-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/images/favicons/apple-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/images/favicons/apple-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicons/apple-icon-180x180.png">
        <link rel="icon" type="image/png" sizes="192x192"  href="/images/favicons/android-icon-192x192.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicons/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="96x96" href="/images/favicons/favicon-96x96.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicons/favicon-16x16.png">
        <meta name="msapplication-TileImage" content="/images/favicons/ms-icon-144x144.png"> -->
        <link rel="icon" type="image/svg" href="/images/pedestriansos.svg" id="favicon">
        <!-- <meta name="mobile-web-app-capable" content="yes"> -->
    </head>
    <body>
        <div id="main">
            <div id="camera">
                <video id="video" autoplay muted></video>
                <div id="bottombuttons">
                    <!-- <button id="recordvideo" class="buttons" disabled title="<?php echo $langJSON["recordvideo"]; ?>"><div><div></div></div></button> -->
                    <button id="recordvideo" class="buttons" title="<?php echo $langJSON["recordvideo"]; ?>"><div><div></div></div></button>
                    <button id="takephoto" class="buttons" disabled title="<?php echo $langJSON["takephoto"]; ?>"><div><div></div></div></button>
                    <!-- <button id="live" class="buttons" disabled title="<?php echo $langJSON["livestream"]; ?>"><img alt width="54" height="54" src="/images/live.svg"></button> -->
                    <button id="live" class="buttons" title="<?php echo $langJSON["livestream"]; ?>"><img alt width="54" height="54" src="/images/live.svg"></button>
                </div>
                <button id="emergencymode" class="buttons singlebuttons" title="<?php echo $langJSON["emergencymode"]; ?>"><img alt width="54" height="54" src="/images/emergency.svg"></button>
                <button id="takephotodraggable" class="buttons" disabled title="<?php echo $langJSON["cameramoveabletakephotobutton"]; ?>"><div><div></div></div></button>
                <button id="rotate" class="buttons singlebuttons" disabled title="<?php echo $langJSON["rotate"]; ?>"><img alt width="32" height="32" src="/images/rotate.svg"></button>
                <button id="microphone" class="buttons singlebuttons" disabled title="<?php echo $langJSON["microphone"]; ?>"><img alt width="32" height="32" src="/images/disabledmicrophone.svg" class="whiteicon"></button>
                <button id="flashlight" class="buttons singlebuttons" disabled title="<?php echo $langJSON["flashlight"]; ?>"><img alt width="32" height="32" src="/images/flashlight0.svg"></button>
                <button id="fullscreen" class="buttons singlebuttons" disabled title="<?php echo $langJSON["fullscreen"]; ?>"><img alt width="32" height="32" src="/images/fullscreen.svg" class="whiteicon"></button>
                <button id="pictureinpicture" class="buttons singlebuttons" disabled title="<?php echo $langJSON["pictureinpicture"]; ?>"><img alt width="32" height="32" src="/images/pictureinpicture.svg" class="whiteicon"></button>
                <a href="/app/" style="text-decoration: none;top: 0;left: 0;" class="buttons singlebuttons" id="psbutton" title="<?php echo $langJSON["gomainpage"]; ?>">
                    <img width="32" height="32" src="/images/pedestriansos.svg" alt>
                </a>
                <div id="statusBox">
                    <div id="status2" class="progressbardiv">
                        <img class="whiteicon" width="32" height="32" id="statusphotovideo">
                        <div id="progressbartop" class="progressbar"></div>
                    </div>
                    <div id="statuslocation">
                        <img width="32" height="32">
                    </div>
                </div>
                <div id="statusBigBox"></div>
                <div id="locationDetails"></div>
                <div id="phototakenicon" title="<?php echo $langJSON["phototaken"]; ?>">
                    <img width="32" height="32" src="/images/take_photo.svg" class="whiteicon" alt>
                </div>
                <div id="recordstatus" class="statusValueBoxes">
                    <img width="32" height="32" id="recordicon">
                    <span id="recordduration" class="statusValueSpan">--:--:--</span>
                </div>
                <div id="livechunkstatus" class="statusValueBoxes">
                    <img width="32" height="32" src="/images/live.svg">
                    <img width="32" height="32" src="/images/uploadicon.svg" class="whiteicon">
                    <span id="livechunksvalue" class="statusValueSpan"></span>
                </div>
                <div id="iframeOverlayDiv" style="display:none;">
                    <div>
                        <a id="psbutton2" href="/app/">
                            <img width="32" height="32" src="/images/pedestriansos.svg" style="position:absolute;left:0;" class="whiteicon" title="<?php echo $langJSON["gomainpage"]; ?>" alt>
                        </a>
                        <img width="32" height="32" src="/images/camera.svg" class="whiteicon" title="<?php echo $langJSON["camera"]; ?>" alt>
                    </div>
                    <iframe id="overlayIframe"></iframe>
                </div>
            </div>
        </div>
        <canvas id="canvas"></canvas>
        <script src="/scripts/camera.js"></script>
        <?php echoConsoleWarningScript(); ?>
    </body>
</html>