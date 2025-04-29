CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_audience VARCHAR(255) NOT NULL,
    access_link VARCHAR(255) UNIQUE,
    created_by INT NOT NULL,
    updated_at INT NOT NULL,
    semestre VARCHAR(20) NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);