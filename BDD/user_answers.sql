CREATE TABLE user_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participation_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_text TEXT, -- Pour les questions directes
    qcm_option_id INT, -- Pour les QCM (référence à l'option choisie)
    score_obtained INT,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participation_id) REFERENCES exam_participations(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (qcm_option_id) REFERENCES qcm_options(id) ON DELETE SET NULL
);