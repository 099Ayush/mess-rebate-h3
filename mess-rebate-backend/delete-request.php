<?php
header('Access-Control-Allow-Origin: http://localhost:3000');

$key = 3647828203;

$sno = openssl_decrypt($_GET["id"], "AES-128-CTR", "hostel3aimlcs", 0, "1234567891011121") / $key;
$db = new SQLite3('data.sqlite');

$smt = $db->prepare('SELECT RollNo, StartTime, EndTime, Filepath FROM allRequests WHERE SNo = :sno');
$smt->bindParam(':sno', $sno);
$out = $smt->execute();

$days = $out->fetchArray();
$nDays = ($days['EndTime'] - $days['StartTime']) / 3600 / 24 + 1;
$roll = $days['RollNo'];

$file = $days['Filepath'];

$smt = $db->prepare('DELETE FROM allRequests WHERE SNo = :sno');
$smt->bindParam(':sno', $sno);
$out = $smt->execute();

if ($file !== 0) {
    unlink('uploads/' . $file . '.pdf');

    while (file_exists('lock')) {continue;};
    fopen('lock', 'w');

    $n = file_get_contents('count');
    $n -= 1;
    move_uploaded_file($_FILES['file']['tmp_name'], 'uploads/' . $n . '.pdf');

    file_put_contents('count', $n);
    unlink('lock');
}

$db->close();
echo json_encode($nDays);
