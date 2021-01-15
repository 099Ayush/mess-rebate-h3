<?php
header('Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Request-With');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST');
date_default_timezone_set('Asia/Kolkata');

$_POST = json_decode(file_get_contents($_FILES['post']['tmp_name']),true);
$key = 3647828203;

$roll = openssl_decrypt($_POST["rollNoEnc"], "AES-128-CTR", "hostel3aimlcs", 0, "1234567891011121") / $key;
$from = $_POST['from'];
$to = $_POST['to'];
$reason = $_POST['reason'];

$file = $_FILES['file'];
$n = 0;

if ($file !== null) {
    if ($file['type'] !== 'application/pdf') {
        header('HTTP/1.1 500 Internal Server Error');
        die();
    }
    while (file_exists('lock')) {continue;};
    fopen('lock', 'w');

    $n = file_get_contents('count');
    $n += 1;
    move_uploaded_file($_FILES['file']['tmp_name'], 'uploads/' . $n . '.pdf');

    file_put_contents('count', $n);
    unlink('lock');
}

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

$timeLeftToday = - strtotime(date('H:i:s')) + strtotime('17:00:00');
$minTime = strtotime(date('Y-m-d')) + ($timeLeftToday >= 0 ? 3600 * 24 : 3600 * 24 * 2);

if ($from === 0 || $to === 0 || $to - $from < 2 * 24 * 3600 || $from < $minTime || $to - $from > ($nDaysLeft - 1) * 24 * 3600 || $reason === '' || is_null($reason)) {
    header('HTTP/1.1 500 Internal Server Error One');
    $db->close();
    die();
}

$smt = $db->prepare('INSERT INTO allRequests (RollNo, Reason, Filepath, StartTime, EndTime, Status) VALUES (:roll, :reason, :filepath, :start, :end, 1)');
$smt->bindParam(':roll', $roll);
$smt->bindParam(':reason', $reason);
$smt->bindParam(':filepath', $n);
$smt->bindParam(':start', $from);
$smt->bindParam(':end', $to);

if (!$smt->execute()) {
    header('HTTP/1.1 500 Internal Server Error');
    $db->close();
    die();
}

$db->close();
