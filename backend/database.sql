CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    is_premium TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_progress (
    user_id INT PRIMARY KEY,
    coins INT DEFAULT 100,
    xp INT DEFAULT 0,
    level VARCHAR(10) DEFAULT 'A1',
    unlocked_level_index INT DEFAULT 0,
    streak_current INT DEFAULT 0,
    streak_best INT DEFAULT 0,
    last_login_date DATE,
    json_data LONGTEXT, -- Stores inventory, challenges, completed topics, etc. as JSON
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
