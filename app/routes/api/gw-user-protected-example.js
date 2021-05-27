const express                  = require('express');
const gwProtectedCtrl          = require('../../controllers/gw-protected-example');

const router = express.Router();

router.post('/gw-user-protected-asset', gwProtectedCtrl.save);
router.get('/gw-user-protected-asset/:id', gwProtectedCtrl.read);

module.exports = router;