const User = require('../models/User');

exports.getFreelancers = async (req, res) => {
  try {
    const { search, skills, sort = 'aiScore' } = req.query;
    let query = { role: 'freelancer', isVerified: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'profile.bio': { $regex: search, $options: 'i' } }
      ];
    }

    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      query.skills = { $all: skillArray };
    }

    const sortOptions = sort === 'aiScore' ? { aiScore: -1 } : { createdAt: -1 };

    const freelancers = await User.find(query)
      .select('name email profile skills aiScore projectsCount createdAt')
      .sort(sortOptions);

    res.json({ success: true, data: freelancers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFreelancerById = async (req, res) => {
  try {
    const freelancer = await User.findOne({ _id: req.params.id, role: 'freelancer' })
      .select('name email profile skills aiScore projectsCount createdAt');
    if (!freelancer) return res.status(404).json({ success: false, message: 'Freelancer not found' });
    res.json({ success: true, data: freelancer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
