<?php
require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['user'])) {
    echo json_encode(["error" => "Missing data"]);
    exit();
}

$email = $data['email'];
$user = $data['user'];

// Verify user exists first
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $user_id = $row['id'];
    
    // Extract simple fields
    $coins = isset($user['coins']) ? $user['coins'] : 0;
    $xp = 0; // If you track XP in user object, extract it here. For now we assume coins track roughly.
    $level = isset($user['level']) ? $user['level'] : 'A1'; // You might need to add this to UserProfile to sync it back
    $unlocked_idx = isset($user['unlockedLevelIndex']) ? $user['unlockedLevelIndex'] : 0;
    
    $streak_current = isset($user['streak']['current']) ? $user['streak']['current'] : 0;
    $streak_best = isset($user['streak']['best']) ? $user['streak']['best'] : 0;
    $last_login = isset($user['streak']['lastLoginDate']) ? $user['streak']['lastLoginDate'] : date('Y-m-d');

    // Complex data to JSON
    $complexData = [
        'inventory' => $user['inventory'] ?? [],
        'dailyChallenges' => $user['dailyChallenges'] ?? [],
        'challengeDate' => $user['challengeDate'] ?? '',
        'completedTopics' => $user['completedTopics'] ?? [],
        'vocabularyBank' => $user['vocabularyBank'] ?? [],
        'stats' => $user['stats'] ?? [],
        'achievements' => $user['achievements'] ?? [],
        'certificates' => $user['certificates'] ?? [],
        'placementTestCompleted' => $user['placementTestCompleted'] ?? false,
        'tutorialCompleted' => $user['tutorialCompleted'] ?? false
    ];
    $json_str = json_encode($complexData);

    // Update Progress
    $update = $conn->prepare("UPDATE user_progress SET coins=?, unlocked_level_index=?, streak_current=?, streak_best=?, last_login_date=?, json_data=? WHERE user_id=?");
    $update->bind_param("iiiissi", $coins, $unlocked_idx, $streak_current, $streak_best, $last_login, $json_str, $user_id);
    
    if ($update->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Failed to update progress"]);
    }
    $update->close();

} else {
    echo json_encode(["error" => "User not found"]);
}

$stmt->close();
$conn->close();
?>
