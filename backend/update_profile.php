<?php
require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email'])) {
    echo json_encode(["error" => "Missing email"]);
    exit();
}

$email = $data['email']; // Original email (used for auth/lookup)
$newEmail = isset($data['new_email']) ? $data['new_email'] : null;
$password = isset($data['password']) ? $data['password'] : null;

// 1. Get User ID first to ensure we target the correct user even if email changes
$uid_stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$uid_stmt->bind_param("s", $email);
$uid_stmt->execute();
$res = $uid_stmt->get_result();
$userRow = $res->fetch_assoc();
$uid_stmt->close();

if (!$userRow) {
    echo json_encode(["error" => "User not found"]);
    exit();
}

$uid = $userRow['id'];

// 2. Update USERS table (Name, Age, Password, Email)
$name = isset($data['name']) ? $data['name'] : null;
$age = isset($data['age']) ? intval($data['age']) : null;

$query = "UPDATE users SET ";
$params = [];
$types = "";

if ($name) {
    $query .= "name = ?, ";
    $params[] = $name;
    $types .= "s";
}
if ($age) {
    $query .= "age = ?, ";
    $params[] = $age;
    $types .= "i";
}
if ($password) {
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $query .= "password_hash = ?, ";
    $params[] = $hashed;
    $types .= "s";
}
if ($newEmail) {
    $query .= "email = ?, ";
    $params[] = $newEmail;
    $types .= "s";
}

// Remove trailing comma
$query = rtrim($query, ", ");

if (count($params) > 0) {
    $query .= " WHERE id = ?";
    $params[] = $uid;
    $types .= "i";

    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    if (!$stmt->execute()) {
        echo json_encode(["success" => false, "error" => $stmt->error]);
        exit();
    }
    $stmt->close();
}

// 3. Update USER_PROGRESS table (Avatar, Level, etc.)
$placementTestCompleted = isset($data['placementTestCompleted']) ? $data['placementTestCompleted'] : null;
$unlockedLevelIndex = isset($data['unlockedLevelIndex']) ? intval($data['unlockedLevelIndex']) : null;
$level = isset($data['level']) ? $data['level'] : null;
$avatar = isset($data['avatar']) ? $data['avatar'] : null;

// Convert boolean
if ($placementTestCompleted !== null) {
    if ($placementTestCompleted === 'true' || $placementTestCompleted === 1 || $placementTestCompleted === true) {
        $placementTestCompleted = true;
    } else {
        $placementTestCompleted = false;
    }
}

if ($placementTestCompleted !== null || $avatar || $unlockedLevelIndex !== null || $level) {
    $prog_stmt = $conn->prepare("SELECT json_data FROM user_progress WHERE user_id = ?");
    $prog_stmt->bind_param("i", $uid);
    $prog_stmt->execute();
    $prog_res = $prog_stmt->get_result();

    if ($p = $prog_res->fetch_assoc()) {
        $jsonData = json_decode($p['json_data'], true) ?: [];
        
        if ($placementTestCompleted !== null) $jsonData['placementTestCompleted'] = $placementTestCompleted;
        if ($avatar) $jsonData['avatar'] = $avatar;
        if ($level) $jsonData['level'] = $level;

        $newJson = json_encode($jsonData);
        
        $u_sql = "UPDATE user_progress SET json_data = ?";
        $u_params = [$newJson];
        $u_types = "s";

        if ($unlockedLevelIndex !== null) {
            $u_sql .= ", unlocked_level_index = ?";
            $u_params[] = $unlockedLevelIndex;
            $u_types .= "i";
        }

        $u_sql .= " WHERE user_id = ?";
        $u_params[] = $uid;
        $u_types .= "i";

        $u_stmt = $conn->prepare($u_sql);
        $u_stmt->bind_param($u_types, ...$u_params);
        $u_stmt->execute();
        $u_stmt->close();
    }
    $prog_stmt->close();
}

echo json_encode(["success" => true]);
$conn->close();
?>
