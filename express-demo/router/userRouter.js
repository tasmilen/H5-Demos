const express = require('express');

const router = express.Router();

router.get('/:id', (req, res) => {
  console.log('user id', req.params.id);
  res.send('This is a test route from user router. id is: ' + req.params.id);
}); 

module.exports = router;
