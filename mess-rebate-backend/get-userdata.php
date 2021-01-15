<?php
header('Access-Control-Allow-Origin: http://localhost:3000');

$key = 3647828203;

$roll = openssl_decrypt($_GET["rollNo"], "AES-128-CTR", "hostel3aimlcs", 0, "1234567891011121") / $key;

$db = new SQLite3('data.sqlite');

$smt = $db->prepare('SELECT * FROM userData WHERE RollNo = :roll');
$smt->bindParam(':roll', $roll, SQLITE3_INTEGER);
$out = $smt->execute();

$ret = $out->fetchArray(SQLITE3_ASSOC);

$nDaysLeft = 15;

$smt = $db->prepare('SELECT StartTime, EndTime FROM allRequests WHERE RollNo = :roll AND NOT Status=0');
$smt->bindParam(':roll', $roll);
$out = $smt->execute();

while ($ret_ = $out->fetchArray(SQLITE3_ASSOC)) {
    $nDaysLeft -= ($ret_['EndTime'] - $ret_['StartTime']) / 24 / 3600 + 1;
}

$ret['nDaysLeft'] = $nDaysLeft;

$db->close();
echo json_encode($ret);
