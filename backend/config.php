<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json");

// Handle Preflight requests for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/* 
  INSTRUCCIONES:
  1. Crea una base de datos en cPanel (MySQL Database Wizard).
  2. Crea un usuario y dale TODOS los permisos sobre esa base de datos.
  3. Pon los datos aquí abajo 👇
*/

$host = "localhost";
$db_user = "etifznmy_useradm"; 
$db_pass = "uXBQT5MLnTFgaYb";
$db_name = "etifznmy_inglesdb";

$conn = new mysqli($host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}
?>
