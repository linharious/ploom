const Task = require('../models/Task');
const Workspace = require('../models/Workspace');

exports.getAllByWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    // Verify user has access to workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    
    const isMember = workspace.owner.equals(req.user._id) || workspace.members.some(m => m.equals(req.user._id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const tasks = await Task.find({ workspace: workspaceId }).populate('assignee', 'name email').sort('-createdAt');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description, status, priority, assignee } = req.body;
    
    if (!title) return res.status(400).json({ message: 'Title is required' });

    // Verify user has access to workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    
    const isMember = workspace.owner.equals(req.user._id) || workspace.members.some(m => m.equals(req.user._id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      workspace: workspaceId,
      assignee: assignee || null,
    });

    const populatedTask = await task.populate('assignee', 'name email');

    // Add to workspace tasks array
    workspace.tasks.push(task._id);
    await workspace.save();

    req.app.get('io').to(workspaceId).emit('task:created', populatedTask);
    
    // Notification for assigned task
    if (assignee && !req.user._id.equals(assignee)) {
      req.app.get('io').to(workspaceId).emit('notification', {
        message: `${req.user.name} assigned task "${task.title}" to someone.`,
        type: 'assignment'
      });
    }

    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { workspaceId, taskId } = req.params;
    
    // Check access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    
    const isMember = workspace.owner.equals(req.user._id) || workspace.members.some(m => m.equals(req.user._id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const task = await Task.findOne({ _id: taskId, workspace: workspaceId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, status, priority, assignee } = req.body;
    const previousStatus = task.status;
    const previousAssignee = task.assignee;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee || null;

    await task.save();
    const populatedTask = await task.populate('assignee', 'name email');

    req.app.get('io').to(workspaceId).emit('task:updated', populatedTask);

    // Notifications
    if (status === 'Done' && previousStatus !== 'Done') {
      req.app.get('io').to(workspaceId).emit('notification', {
        message: `${req.user.name} completed task "${task.title}".`,
        type: 'completion'
      });
    } else if (assignee && previousAssignee?.toString() !== assignee.toString() && !req.user._id.equals(assignee)) {
      req.app.get('io').to(workspaceId).emit('notification', {
        message: `${req.user.name} assigned task "${task.title}".`,
        type: 'assignment'
      });
    }

    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { workspaceId, taskId } = req.params;
    
    // Check access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    
    const isMember = workspace.owner.equals(req.user._id) || workspace.members.some(m => m.equals(req.user._id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const task = await Task.findOneAndDelete({ _id: taskId, workspace: workspaceId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    workspace.tasks.pull(task._id);
    await workspace.save();

    req.app.get('io').to(workspaceId).emit('task:deleted', { _id: taskId });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
