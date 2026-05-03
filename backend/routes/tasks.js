const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const {
  getAllByWorkspace,
  create,
  update,
  remove,
} = require('../controllers/taskController');

// Tasks are nested under workspaces, e.g., /api/workspaces/:workspaceId/tasks
router.use(auth);

router.get('/', getAllByWorkspace);
router.post('/', create);
router.put('/:taskId', update);
router.delete('/:taskId', remove);

module.exports = router;
