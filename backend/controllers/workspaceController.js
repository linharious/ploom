const Workspace = require('../models/Workspace');

exports.getAll = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort('-createdAt');

    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const isMember =
      workspace.owner._id.equals(req.user._id) ||
      workspace.members.some((m) => m._id.equals(req.user._id));

    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    res.json(workspace);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Workspace name is required' });

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });

    const populated = await workspace.populate('owner', 'name email');

    req.app.get('io').emit('workspace:created', populated);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    if (!workspace.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the owner can update this workspace' });
    }

    const { name, description } = req.body;
    if (name !== undefined) workspace.name = name;
    if (description !== undefined) workspace.description = description;

    await workspace.save();
    const populated = await workspace.populate([
      { path: 'owner', select: 'name email' },
      { path: 'members', select: 'name email' },
    ]);

    req.app.get('io').emit('workspace:updated', populated);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    if (!workspace.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the owner can delete this workspace' });
    }

    await workspace.deleteOne();

    req.app.get('io').emit('workspace:deleted', { _id: req.params.id });

    res.json({ message: 'Workspace deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
