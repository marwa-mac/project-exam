CREATE TABLE exam_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participation_id INT NOT NULL,
    question_id INT NOT NULL,
    answer TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participation_id) REFERENCES exam_participations(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);