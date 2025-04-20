CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    question_type ENUM('direct', 'qcm') NOT NULL,
    content TEXT NOT NULL,
    media_url VARCHAR(255),
    media_type ENUM('image', 'audio', 'video'),
    tolerance_rate INT DEFAULT 0, -- Pour les questions directes
    duration INT NOT NULL, -- Durée en secondes
    score INT NOT NULL, -- Points pour cette question
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);