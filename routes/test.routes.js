const express = require('express'); 
const { test } = require('../controller/test.controller');

const router = express.Router();

router.get('/abebe', test);

module.exports = router;
