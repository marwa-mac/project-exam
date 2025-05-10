const db = require('../BDD/run');

class Participation {
    static async findByCreator(creatorId) {
        const [rows] = await db.query(`
           SELECT 
                e.id AS exam_id,
                e.title AS exam_name,
                ep.user_id,
                CONCAT(u.first_name, ' ', u.last_name) AS participant_name,
                u.email AS participant_email,
                ep.latitude,
                ep.longitude,
                ep.total_score
            FROM exam_participations ep
            JOIN exams e ON ep.exam_id = e.id
            JOIN users u ON ep.user_id = u.id
            WHERE e.created_by = ?
            ORDER BY e.id, ep.total_score DESC
        `, [creatorId]);
        
        return rows;
    }
}

module.exports = Participation;