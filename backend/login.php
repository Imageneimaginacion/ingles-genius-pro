<?php
require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode(["error" => "Missing credentials"]);
    exit();
}

$email = $data['email'];
$password = $data['password'];

$stmt = $conn->prepare("SELECT u.id, u.name, u.password_hash, u.age, u.is_premium, p.coins, p.xp, p.level, p.unlocked_level_index, p.streak_current, p.streak_best, p.last_login_date, p.json_data 
                        FROM users u 
                        JOIN user_progress p ON u.id = p.user_id 
                        WHERE u.email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if (password_verify($password, $row['password_hash'])) {
        
        // Success! Construct UserProfile object
        $profile = [
            'id' => $row['id'], // Keeping ID for sync
            'name' => $row['name'],
            'email' => $email,
            'age' => $row['age'],
            'isPremium' => (bool)$row['is_premium'],
            'coins' => $row['coins'],
            'unlockedLevelIndex' => $row['unlocked_level_index'],
            'streak' => [
                'current' => $row['streak_current'],
                'best' => $row['streak_best'],
                'lastLoginDate' => $row['last_login_date']
            ]
        ];

        // Merge complex JSON data
        $jsonData = json_decode($row['json_data'], true);
        $fullProfile = array_merge($profile, $jsonData ? $jsonData : []);

        echo json_encode(["success" => true, "user" => $fullProfile]);
    } else {
        echo json_encode(["error" => "Invalid password"]);
    }
} else {
    echo json_encode(["error" => "User not found"]);
}

$stmt->close();
$conn->close();
?>
