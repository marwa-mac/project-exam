const Participation = require('../models/Participation');

exports.getMyExamsParticipations = async (req, res) => {
    try {
        const creatorId = req.userId;
        const participations = await Participation.findByCreator(creatorId);
        
 
        const formattedData = participations.map(participation => ({
            exam_name: participation.exam_name,
            participant_name: participation.participant_name,
            participant_email : participation.participant_email,
            latitude: participation.latitude,
            longitude: participation.longitude,
            total_score: participation.total_score
        }));

        res.json(formattedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};