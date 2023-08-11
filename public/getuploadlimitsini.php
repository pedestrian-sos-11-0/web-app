<?php
echo json_encode(parse_ini_file(dirname($_SERVER["DOCUMENT_ROOT"])."/protected/private/uploadlimits.ini"));
?>