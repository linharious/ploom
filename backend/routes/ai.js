const router = require('express').Router();
const auth = require('../middleware/auth');
const { generateTasks } = require('../controllers/aiController');

router.use(auth);

// We pass workspaceId in the body for this route to match the exact URL requested.
// Wait, the controller expects req.params.workspaceId! 
// Let's modify the controller via route wrapper or just change the controller to check req.body.workspaceId.

router.post('/generate-tasks', async (req, res) => {
  // Map req.body.workspaceId to req.params.workspaceId for the controller
  req.params.workspaceId = req.body.workspaceId;
  await generateTasks(req, res);
});

module.exports = router;
