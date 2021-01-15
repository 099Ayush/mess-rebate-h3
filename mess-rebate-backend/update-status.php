<?php
header('Access-Control-Allow-Origin: http://localhost:3000');

$key = 3647828203;
$id = openssl_decrypt($_GET['id'], "AES-128-CTR", "hostel3aimlcs", 0, "1234567891011121") / $key;
$roll = openssl_decrypt($_GET['rollNoEnc'], "AES-128-CTR", "hostel3aimlcs", 0, "1234567891011121") / $key;
$val = $_GET['status'];

$db = new SQLite3('data.sqlite');
$smt = $db->prepare('UPDATE allRequests SET Status = :status WHERE SNo = :id AND RollNo = :roll');
$smt->bindParam(':status', $val);
$smt->bindParam(':id', $id);
$smt->bindParam(':roll', $roll);
$smt->execute();

$db->close();
