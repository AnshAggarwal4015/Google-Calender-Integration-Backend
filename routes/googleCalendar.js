const express = require('express');
const router = express.Router();

const {
  redirect,
  generateAuthorizationUrl,
  createEvent,
} = require('../controllers/googleCalendar');

router.get('/', redirect);
router.get('/generate-authorization-url', generateAuthorizationUrl);
router.post('/create-event', createEvent);

module.exports = router;
