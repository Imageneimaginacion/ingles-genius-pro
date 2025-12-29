<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'config.php';

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON input"]);
    exit();
}

// 1. Extract Data (Frontend sends decoded token data usually, or raw token)
// Support both direct fields and nested in 'token' (if logic changes)
$email = $data['email'] ?? null;
$name = $data['name'] ?? null;
$google_id = $data['google_id'] ?? null;
$picture = $data['picture'] ?? null;

if (!$email || !$name) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields (email, name)"]);
    exit();
}

// Default Age if not provided
$age = 25; 

// 2. Check if user exists
$stmt = $conn->prepare("SELECT u.id, u.name, u.age, u.is_premium, p.coins, p.unlocked_level_index, p.json_data 
                        FROM users u 
                        LEFT JOIN user_progress p ON u.id = p.user_id 
                        WHERE u.email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // === EXISTING USER: LOGIN ===
    
    // Construct UserProfile object
    $profile = [
        'id' => $row['id'],
        'name' => $row['name'], // Keep DB name logic, or update? Let's keep DB to be safe
        'email' => $email,
        'age' => $row['age'],
        'isPremium' => (bool)$row['is_premium'],
        'coins' => $row['coins'] ?? 100,
        'unlockedLevelIndex' => $row['unlocked_level_index'] ?? 0,
        'streak' => ['current' => 1, 'best' => 1, 'lastLoginDate' => date('Y-m-d')]
    ];
    
    // Add avatar if available from Google and not set locally (optional enhancement)
    if ($picture) {
        $profile['avatar'] = $picture;
    }

    $jsonData = json_decode($row['json_data'] ?? '{}', true);
    $fullProfile = array_merge($profile, $jsonData ? $jsonData : []);

    // Ensure google_id is linked if it wasn't before
    if (empty($row['google_id']) && $google_id) {
        $upd = $conn->prepare("UPDATE users SET google_id = ? WHERE id = ?");
        $upd->bind_param("si", $google_id, $row['id']);
        $upd->execute();
    }

    echo json_encode(["success" => true, "user" => $fullProfile]);

} else {
    // === NEW USER: REGISTER ===
    
    // Insert into Users
    $ins = $conn->prepare("INSERT INTO users (name, email, google_id, age) VALUES (?, ?, ?, ?)");
    // Fallback for google_id if missing
    $gid_safe = $google_id ?? 'g_' . uniqid();
    $ins->bind_param("sssi", $name, $email, $gid_safe, $age);
    
    if ($ins->execute()) {
        $user_id = $ins->insert_id;
        
        // Initialize Progress
        $init_json = json_encode([
            'inventory' => [],
            'dailyChallenges' => [], 
            'completedTopics' => [],
            'vocabularyBank' => [],
            'stats' => ['savedLessons' => 0, 'lessonsCompleted' => 0, 'currentLevelProgress' => 0],
            'achievements' => ['lessonsCompleted' => 0, 'wordsLearned' => 0, 'quizPerfect' => 0],
            'avatar' => $picture // Store Google Picture as initial avatar
        ]);
        
        $prog = $conn->prepare("INSERT INTO user_progress (user_id, coins, json_data) VALUES (?, 100, ?)");
        $prog->bind_param("is", $user_id, $init_json);
        $prog->execute();

        // Return New Profile
        $newUserProfile = [
            'id' => $user_id,
            'name' => $name,
            'email' => $email,
            'age' => $age,
            'isPremium' => false,
            'coins' => 100,
            'unlockedLevelIndex' => 0,
            'streak' => ['current' => 1, 'best' => 1, 'lastLoginDate' => date('Y-m-d')],
            'dailyChallenges' => [],
            'inventory' => [],
            'vocabularyBank' => [],
            'avatar' => $picture
        ];

        echo json_encode(["success" => true, "user" => $newUserProfile]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Database error during registration: " . $conn->error]);
    }
}

$stmt->close();
$conn->close();
?>
