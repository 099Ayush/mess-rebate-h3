<?php
header('Access-Control-Allow-Origin: http://localhost:3000');

$key = 3647828203;

$roll = openssl_decrypt($_GET["rollNo"], "AES-128-CTR", "hostel3aimlcs", 0, "1234567891011121") / $key;
$db = new SQLite3('data.sqlite');
$ret = array();

$smt = $db->prepare('SELECT SNo, StartTime, EndTime, Reason, Filepath, Status FROM allRequests WHERE RollNo = :roll');
$smt->bindParam(':roll', $roll);
$out = $smt->execute();

while ($ret_ = $out->fetchArray(SQLITE3_ASSOC)) {
    $r = array(
        "id"        =>  openssl_encrypt($ret_["SNo"] * $key, "AES-128-CTR", "hostel3aimlcs", 0, "1234567891011121"),
        "from"      =>  $ret_["StartTime"],
        "to"        =>  $ret_["EndTime"],
        "reason"    =>  $ret_["Reason"],
        "file"      =>  $ret_["Filepath"] === 0 ? "" : openssl_encrypt("uploads/" . $ret_["Filepath"] . ".pdf", "AES-128-CTR", "hostel3aimlcs", 0, "1234567891011121"),
        "status"    =>  $ret_["Status"]
    );
    array_push($ret, $r);
}

$db->close();
echo json_encode($ret);
