<?php
$servername = "mysql.punktownica.pl";
$dbUsername = "polska";
$password = "secret";
$dbname = "stock";

$conn = new mysqli($servername, $dbUsername, $password, $dbname);

if ($conn->connect_error) {
    die("Fail: " . $conn->connect_error);
}
$sql = "INSERT INTO history (profit, total) VALUES (?, ?)";
  $stmt = $conn->prepare($sql);
    if (
      $stmt &&
      $stmt -> bind_param("ii", $profit, $total) &&
      $stmt -> execute() &&
      $stmt -> affected_rows === 1
    ) {
      echo 'inserted';
    } else {
      echo $stmt -> error;
    }
?>