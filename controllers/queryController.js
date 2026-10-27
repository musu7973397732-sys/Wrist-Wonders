const Query = require('../models/Query');

// @desc    Submit a query or contact feedback
// @route   POST /api/queries
// @access  Public
const submitQuery = async (req, res) => {
  try {
    const { name, email, fgmail, message } = req.body;

    const userEmail = (email || fgmail || '').trim();
    const userMessage = (message || '').trim();
    const userName = (name || 'Anonymous Customer').trim();

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    if (!userMessage) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your message'
      });
    }

    const query = await Query.create({
      name: userName,
      email: userEmail,
      message: userMessage
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your query has been submitted successfully. We will get back to you soon.',
      query
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all queries
// @route   GET /api/queries
// @access  Public
const getAllQueries = async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: queries.length,
      queries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a query by ID
// @route   DELETE /api/queries/:id
// @access  Public
const deleteQuery = async (req, res) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }
    res.json({ success: true, message: 'Query deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitQuery, getAllQueries, deleteQuery };
