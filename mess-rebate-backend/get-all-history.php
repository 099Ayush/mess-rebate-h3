<?php
header('Access-Control-Allow-Origin: http://localhost:3000');

$key = 3647828203;

$roll = $_GET["rollNoEnc"];
$allowedRolls = array('Q82AjvO1f70Cn54HdjbEAZU9');

if (!in_array($roll, $allowedRolls)) {
    header('HTTP/1.1 500 Internal Server Error');
    die();
}

$db = new SQLite3('data.sqlite');
$ret = array();

$smt = $db->prepare('SELECT * FROM allRequests');
$out = $smt->execute();

while ($ret_ = $out->fetchArray(SQLITE3_ASSOC)) {
    $smt = $db->prepare('SELECT * FROM userData WHERE rollNo=:roll');
    $smt->bindParam(':roll', $ret_["RollNo"]);
    $out2 = ($smt->execute())->fetchArray();

    $r = array(
        "id"        =>  openssl_encrypt($ret_["SNo"] * $key, "AES-128-CTR", "hostel3aimlcs", 0, "1234567891011121"),
        "rollNoEnc" =>  openssl_encrypt($ret_["RollNo"] * $key, "AES-128-CTR", "hostel3aimlcs", 0, "1234567891011121"),
        "rollNo"    =>  $ret_["RollNo"],
        "userName"  =>  $out2["name"],
        "roomNo"    =>  $out2["roomNo"],
        "email"     =>  $out2["email"],
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
