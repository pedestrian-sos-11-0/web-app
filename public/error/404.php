<?php
    http_response_code(404);
    define("notmain", "");
    define("nocaptcha", "");
    include("../index.php");
?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $langJSON["error"]; ?> 404 | <?php echo $langJSON["pedestrian"] ?> SOS!</title>
    <style>
        body{
            margin: 0;
            padding: 0;
        }
        #main{
            text-align: center;
            font-family: sans-serif;
            min-height: 100vh;
        }
        .pedestrian {
            color: #256aff;
        }
        .sos    {
            color: #ec0400;
        }
        .top *{
            display: inline-block;
            vertical-align: middle;
            text-decoration: none;
        }
        #content{
            border: 2px solid #ff0000;
            padding: 2px;
        }
    </style>
</head>
<body>
    <div id="main">
        <div class="top">
            <a href="/">
                <img width="64" height="64" src="/images/pedestriansos.svg">
                <h1>
                    <span class="pedestrian"><?php echo $langJSON["pedestrian"]; ?></span>&#160;<span class="sos">SOS!</span>
                </h1>
            </a>
        </div>
        <div id="content">
            <div class="top">
                <img width="32" height="32" src="/images/404.svg">
                <h2>
                    <span><?php echo $langJSON["error"]; ?> 404</span>
                </h2>
            </div>
            <h3>
                <?php echo $langJSON["pagenotfound"]; ?>
            </h3>
            <div>
                URL: "<?php echo htmlspecialchars($_SERVER["REQUEST_URI"]); ?>"
            </div>
        </div>
        <a href="/">
            <img alt width="32" height="32" src="/images/homepage.svg">&#160;<span><?php echo $langJSON["gomainpage"]; ?></span>
        </a>
    </div>
    <?php echoConsoleWarningScript(); ?>
</body>
</html>