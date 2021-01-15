<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Content-Type: application/pdf');

$filename = openssl_decrypt($_GET['id'], "AES-128-CTR", "hostel3aimlcs", 0, "1234567891011121");

header("Content-Transfer-Encoding: binary");
header("Accept-Ranges: binary");

@readfile($filename);
