
const express = require("express");
const router = express.Router();
const usercontroller = require("../controllers/AuthController")


router.get('/:id/firstname', usercontroller.getUserFirstName);
router.get('/:id/firstname', async (req, res) => {
    const userId = req.params.id;
    const user = await db.query('SELECT first_name FROM users WHERE id = ?', [userId]);
    res.json({ firstname: user.first_name });
  });



module.exports = router;
