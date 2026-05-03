const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  getAll,
  getOne,
  create,
  update,
  remove,
} = require('../controllers/workspaceController');

const taskRoutes = require('./tasks');

router.use(auth);

router.use('/:workspaceId/tasks', taskRoutes);

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/:id/members', require('../controllers/workspaceController').addMember);

module.exports = router;
