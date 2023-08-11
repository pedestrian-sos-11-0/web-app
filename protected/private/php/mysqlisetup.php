<?php
$mysqliConn = parse_ini_file(protectedPrivatePath . "mysqliconn.ini");
$serverName = $mysqliConn["serverName"];
$userName = $mysqliConn["userName"];
$password = $mysqliConn["password"];
$dbname = $mysqliConn["dbname"];
$conn = mysqli_connect($serverName, $userName, $password);
if($conn){
    $sql = "CREATE DATABASE pedestriansos";
    if(mysqli_query($conn, $sql)){
        if(mysqli_select_db($conn, $dbname)){
            $sql = "CREATE TABLE uploads_main (
                n BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                id VARCHAR(16),
                t INT UNSIGNED,
                -- id_key VARCHAR(32),
                -- password_key TINYTEXT,
                emergencymode_t INT UNSIGNED
            )";
            mysqli_query($conn, $sql);   
            $sql = "CREATE TABLE uploads_photovideo (
                n BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                id VARCHAR(16),
                file_name VARCHAR(16),
                t INT UNSIGNED,
                file_type BIT(2),
                file_extension VARCHAR(4)
            )";
            mysqli_query($conn, $sql);  
            $sql = "CREATE TABLE uploads_voice (
                n BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                id VARCHAR(16),
                file_name VARCHAR(16),
                t INT UNSIGNED,
                file_extension VARCHAR(4)
            )";
            mysqli_query($conn, $sql);
            $sql = "CREATE TABLE uploads_location (
                n BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                id VARCHAR(16),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                altitude DECIMAL(19, 15),
                accuracy DECIMAL(20, 15),
                altitude_accuracy DECIMAL(20, 15),
                location_time BIGINT,
                t INT UNSIGNED
            )";
            mysqli_query($conn, $sql);   
            $sql = "CREATE TABLE uploads_description (
                n BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                id VARCHAR(16),
                description_text MEDIUMTEXT COLLATE utf8mb4_unicode_ci,
                t INT UNSIGNED
            )";
            mysqli_query($conn, $sql);   
            /*$sql = "CREATE TABLE uploads_live (
                n BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                id VARCHAR(16),
                id_key VARCHAR(32),
                password_key TINYTEXT
            )";
            mysqli_query($conn, $sql);*/
        }
    }else{
        echo mysqli_error($conn);
    }
    mysqli_close($conn);
}
?>