<?php
header('Access-Control-Allow-Origin: http://localhost:3000');

$key = 3647828203;

$roll = openssl_decrypt($_GET["rollNo"], "AES-128-CTR", "hostel3aimlcs", 0, "1234567891011121") / $key;
$start = $_GET['from'];
$end = $_GET['to'];

$db = new SQLite3('data.sqlite');
$smt = $db->prepare('SELECT StartTime, EndTime FROM allRequests WHERE RollNo = :roll AND NOT Status=0');
$smt->bindParam(':roll', $roll);
$out = $smt->execute();

$overlapping = 0;

while ($ret_ = $out->fetchArray(SQLITE3_ASSOC)) {
    if (max($ret_['EndTime'], $end) - min($ret_['StartTime'], $start) <= $end - $start + $ret_['EndTime'] - $ret_['StartTime']) {
        $overlapping = 1;
        break;
    }
}

echo $overlapping;
