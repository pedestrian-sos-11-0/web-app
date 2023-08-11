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
    <title>API | <?php echo $langJSON["pedestrian"] ?> SOS!</title>
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
        .tableDiv{
            display: inline-block;
            border: 1px solid #256aff80;
        }
        .tableDiv .tableDivs{
            margin: 1px;
        }
        .tableDivs{
            display: inline-block;
            padding: 1px;
            border: 1px solid #256aff;
        }
        .tableDivs *{
            border: 1px solid #0000ff;
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
        <div class="top">
            <a href="../">
                <img width="64" height="64" src="../images/pedestriansos.svg">
                <h1>
                    <span class="pedestrian"><?php echo $langJSON["pedestrian"]; ?></span>&nbsp;<span class="sos">SOS!</span>
                </h1>
            </a>
        </div>
        <div class="top">
            <img width="32" height="32" src="../images/code.svg">
            <h2>
                <span>API</span>
            </h2>
        </div>
        <div class="tableDiv">
            <h3>Request</h3>
            <div class="tableDivs">
                <table>
                    <thead>
                        <tr>
                            <th>URL</th>
                            <th>Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><?php echo getMainWebAddress(); ?>?view&raw=1</td>
                            <td>GET</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <br>
            <div class="tableDivs">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>n</td>
                            <td>ID of upload (optional)</td>
                        </tr>
                        <tr>
                            <td>p</td>
                            <td>Index of page (optional)</td>
                        </tr>
                        <tr>
                            <td>t</td>
                            <td>Upload ID of where to get from (optional)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="tableDiv">
            <h3>Response</h3>
            <div class="tableDivs">
                <table>
                    <thead>
                        <tr>
                            <th>Format</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>JSON</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <br>
            <div class="tableDivs">
                <table>
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>0</td>
                            <td>Upload unique ID (string-int)</td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td>Photo/Video URL path (array[string])</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>Photo/Video upload unix time (array[int])</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>File type (image; video) (array[string])</td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td>Location coordinates (array[string-float; string])</td>
                        </tr>
                        <tr>
                            <td>5</td>
                            <td>Location coordinates upload unix time (array[int])</td>
                        </tr>
                        <tr>
                            <td>6</td>
                            <td>Description (array[string])</td>
                        </tr>
                        <tr>
                            <td>7</td>
                            <td>Description upload unix time (array[int])</td>
                        </tr>
                        <tr>
                            <td>8</td>
                            <td>Voice URL path (array[string])</td>
                        </tr>
                        <tr>
                            <td>9</td>
                            <td>Voice upload unix time (array[int])</td>
                        </tr>
                        <tr>
                            <td>10</td>
                            <td>Emergency mode upload unix time (array[int])</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <br><br>
        <a href="/" style="border: 2px solid #256aff;padding: 4px;display: inline-block;">
            <img width="32" height="32" src="../images/homepage.svg">&nbsp;<span><?php echo $langJSON["gomainpage"]; ?></span>
        </a>
    </div>
    <?php echoConsoleWarningScript(); ?>
</body>
</html>