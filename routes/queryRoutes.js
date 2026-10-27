const express = require('express');
const router = express.Router();
const {
  submitQuery,
  getAllQueries,
  deleteQuery
} = require('../controllers/queryController');

router.post('/', submitQuery);
router.get('/', getAllQueries);
router.delete('/:id', deleteQuery);

module.exports = router;
