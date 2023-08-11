<?php
    define("notmain", "");
    define("nocaptcha", "");
    include("../index.php");
?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $langJSON["rules"]; ?> | <?php echo $langJSON["pedestrian"] ?> SOS!</title>
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
        #top *{
            display: inline-block;
            vertical-align: middle;
            text-decoration: none;
        }
        #content{
            text-align: initial;
            margin: 1%;
            padding: 1%;
            border: 2px solid #256aff80;
        }
        @media(prefers-color-scheme: dark)    {
            :root   {
                color-scheme: dark;
            }
        }
    </style>
</head>
<body>
    <div id="main">
        <div id="top">
            <a href="../">
                <img width="64" height="64" src="../images/pedestriansos.svg">
                <h1>
                    <span class="pedestrian"><?php echo $langJSON["pedestrian"]; ?></span>&nbsp;<span class="sos">SOS!</span>
                </h1>
            </a>
        </div>
        <h2>
            <?php echo $langJSON["rules"]; ?>
        </h2>
        <div id="content">
            <?php
                echo nl2br(file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/text/languages/" . $lang . ".txt"));
            ?>
        </div>
        <form style="border: 2px dotted #256aff;padding: 4px;display: inline-block;" method="get">
            <label for="lang">
                <img width="26" height="26" src="../images/language.svg">
                <?php echo $langJSON["language"]; ?>
            </label>
            <select name="lang" id="lang" required>
                <option value="" disabled selected hidden>...</option>
                <?php echo getLangOptions(); ?>
            </select>
            <button type="submit"><?php echo $langJSON["open"]; ?></button>
        </form>
        <br><br>
        <a href="/" style="border: 2px solid #256aff;padding: 4px;display: inline-block;">
            <img width="32" height="32" src="../images/homepage.svg">&nbsp;<span><?php echo $langJSON["gomainpage"]; ?></span>
        </a>
    </div>
    <?php echoConsoleWarningScript(); ?>
</body>
</html>