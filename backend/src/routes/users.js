const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/freelancers', protect, ctrl.getFreelancers);
router.get('/freelancers/:id', protect, ctrl.getFreelancerById);

module.exports = router;
