const { GoogleGenAI, Type } = require('@google/genai');
const Task = require('../models/Task');
const Workspace = require('../models/Workspace');

exports.generateTasks = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { prompt } = req.body;

    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: 'GEMINI_API_KEY is missing' });

    // Verify access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    
    const isMember = workspace.owner.equals(req.user._id) || workspace.members.some(m => m.equals(req.user._id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert project manager. Break down the following project description into 3-5 distinct, actionable tasks. Project Description: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A concise, actionable title for the task" },
              description: { type: Type.STRING, description: "A brief description of what needs to be done" },
              priority: { type: Type.STRING, description: "Priority level of the task", enum: ["Low", "Medium", "High"] },
            },
            required: ["title", "description", "priority"]
          }
        }
      }
    });

    const tasksData = JSON.parse(response.text);
    const createdTasks = [];

    // Automatically populate the database
    for (const data of tasksData) {
      const task = await Task.create({
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: 'To Do',
        workspace: workspaceId,
      });
      
      workspace.tasks.push(task._id);
      
      const populatedTask = await task.populate('assignee', 'name email');
      createdTasks.push(populatedTask);
      
      // Emit socket event
      req.app.get('io').to(workspaceId).emit('task:created', populatedTask);
    }
    
    await workspace.save();

    res.status(201).json({ message: 'Tasks generated successfully', tasks: createdTasks });
  } catch (err) {
    console.error('AI Generation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
