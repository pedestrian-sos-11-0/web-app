<?php
if((isset($_GET["location"]) && ctype_digit($_GET["location"]) && (strlen($_GET["location"]) <= 20)) || (isset($_GET["description"]) && ctype_digit($_GET["description"]) && (strlen($_GET["description"]) <= 20))){
    $mysqliConn = parse_ini_file(protectedPrivatePath . "mysqliconn.ini");
    $serverName = $mysqliConn["serverName"];
    $userName = $mysqliConn["userName"];
    $password = $mysqliConn["password"];
    $dbname = $mysqliConn["dbname"];
    $conn = mysqli_connect($serverName, $userName, $password, $dbname);
    if($conn){
        if(isset($_GET["location"])){
            $tname = "location";
        }else{
            $tname = "description";
        }
        $sql = "SELECT * from uploads_" . $tname . " WHERE n=" . $_GET[$tname];
        $result = mysqli_query($conn, $sql);
        if(mysqli_num_rows($result) > 0){
            header("Content-Type: text/plain");
            while($row = mysqli_fetch_assoc($result)){
                if($tname == "location"){
                    echo $row["latitude"] . ", " . $row["longitude"] . "; " . $row["altitude"] . "; " . $row["accuracy"] . "; " . $row["altitude_accuracy"] . "; " . $row["location_time"];
                }else{
                    echo $row["description_text"];
                }
            }
            exit;
        }
        mysqli_close($conn);
    }
}
?>