<!DOCTYPE html>
<html lang="<?php echo $GLOBALS["lang"]; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo getString("pedestrian"); ?> SOS! | <?php echo getString("security"); ?></title>
    <style>
        body{
            margin: 0;
            padding: 0;
        }
        #main{
            text-align: center;
            font-family: sans-serif;
        }
        .pedestrian {
            color: #256aff;
        }
        .sos    {
            color: #ec0400;
        }
        .header *{
            display: inline-block;
            vertical-align: middle;
        }
        input[type="checkbox"]{
            width: 32px;
            height: 32px;
        }
        button{
            background: none;
            font-size: 20px;
        }
        button *{
            vertical-align: middle;
        }
        form div, form div label{
            display: inline-block;
            border: 2px solid #0000ff;
            margin: 1px;
            padding: 1px;
        }
        form div{
            border-width: 1px;
        }
        input[type="checkbox"]:checked + label{
            border: 2px solid #0080ff;
        }
        .infotext{
            font-weight: bold;
            font-size: 20px;
            margin: 1px;
            padding: 1px;
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
        <div class="header">
            <img width="64" height="64" src="/images/pedestriansos.svg">
            <h1>
                <span class="pedestrian"><?php echo getString("pedestrian"); ?></span> <span class="sos">SOS!</span>
            </h1>
        </div>
        <div class="header">
            <img width="60" height="60" src="/images/securityps.svg">
            <h2>
                <?php echo getString("security"); ?>
            </h2>
        </div>
        <br>
        <?php if(isset($GLOBALS["correct"]) && !$GLOBALS["correct"]){echo '<div style="color:#ff0000;" class="infotext">' . getString("incorrectdata") . '</div>';} ?>
        <?php echo '<div class="infotext">' . getString("choosecorrectimages") . '</div>'; ?>
        <?php echo '<div class="infotext" style="font-size:25px;border: 1px solid #256aff;">' . $GLOBALS["captchaText"] . '</div>'; ?>
        <form method="post">
            <input type="hidden" name="submit">
            <?php
            for($i = 0; $i < $_SESSION["captchaImagesQuantity"]; $i++){
                echo '
                <div>
                    <input type="checkbox" name="captcha'.$i.'" id="'.$i.'">
                    <label for="'.$i.'">
                        <img width="128" height="128" src="'.getCaptchaImage($i).'">
                    </label>
                </div>
                ';
            }
            ?>
            <br>
            <input type="submit" id="submit">
            <label for="submit">
                <button><img width="32" height="32" src="/images/submit.svg"> <span><?php echo getString("done"); ?></span></button>
            </label>
        </form>
        <br>
        <form style="border: 2px dotted #256aff;padding: 4px;display: inline-block;" method="get">
            <label>
                <img width="26" height="26" src="../images/language.svg">
                <?php echo getString("language"); ?>
                <select name="lang" required>
                    <option value="" disabled selected hidden>...</option>
                    <?php echo getLangOptions(0); ?>
                </select>
            </label>
            <button type="submit"><?php echo getString("open"); ?></button>
        </form>
        <form style="border: 2px dotted #256aff;padding: 4px;display: inline-block;" method="get">
            <input type="hidden" name="asciionly" value="1">
            <label>
                <img width="26" height="26" src="../images/language.svg">
                <?php echo getString("language"); ?>
                <select name="lang" id="lang" required>
                    <option value="" disabled selected hidden>...</option>
                    <?php echo getLangOptions(1); ?>
                </select>
            </label>
            <button type="submit"><?php echo getString("open"); ?></button>
        </form>
    </div>
    <div>
        <a href="/rules?lang=<?php echo $GLOBALS["lang"]; ?>"><?php echo getString("rules"); ?></a>
        &nbsp;|&nbsp;
        <a href="/?view&lang=<?php echo $GLOBALS["lang"]; ?>"><?php echo getString("viewuploads"); ?></a>
        &nbsp;|&nbsp;
        <a href="/api">API</a>
    </div>
    <?php echoConsoleWarningScript(); ?>
</body>
</html>