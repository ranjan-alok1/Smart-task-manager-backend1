// Mock AI service for task analysis
const generateMockInsights = (tasks) => {
  // Count tasks by status
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  // Count tasks by priority
  const priorityCounts = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  // Count overdue tasks
  const overdueTasks = tasks.filter(task => 
    new Date(task.dueDate) < new Date() && task.status !== 'completed'
  ).length;

  // Generate insights based on the analysis
  return {
    workloadAnalysis: `You have ${tasks.length} tasks in total: ${statusCounts.pending || 0} pending, ${statusCounts.completed || 0} completed. ${overdueTasks} tasks are overdue. Priority distribution: ${priorityCounts.high || 0} high, ${priorityCounts.medium || 0} medium, ${priorityCounts.low || 0} low priority tasks.`,
    
    schedulingSuggestions: `Focus on the ${overdueTasks} overdue tasks first. ${priorityCounts.high || 0} high-priority tasks need immediate attention. Consider breaking down large tasks into smaller, manageable pieces. Schedule regular check-ins to update task progress.`,
    
    productivityTips: `Maintain a balanced workload by tackling high-priority tasks during your peak productivity hours. Take short breaks between tasks to stay focused. Review and update task priorities daily. Consider using time-blocking techniques to improve focus and productivity.`
  };
};

const analyzeTasksWithAI = async (tasks) => {
  try {
    // Prepare task data for analysis
    const taskSummary = tasks.map(task => ({
      title: task.title,
      description: task.description || '',
      dueDate: new Date(task.dueDate).toLocaleDateString(),
      priority: task.priority,
      status: task.status,
    }));

    // Generate mock insights
    const insights = generateMockInsights(taskSummary);
    console.log('Generated insights:', insights);
    return insights;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error(error.message || 'Failed to generate insights');
  }
};

exports.getInsights = async (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide an array of tasks for analysis' 
      });
    }

    if (tasks.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide at least one task for analysis' 
      });
    }

    // Validate task data and collect missing fields
    const invalidTasks = tasks.filter(task => {
      const missingFields = [];
      if (!task.title) missingFields.push('title');
      if (!task.dueDate) missingFields.push('dueDate');
      if (task.priority === undefined && task.priority !== 0) missingFields.push('priority');
      if (!task.status) missingFields.push('status');
      return missingFields.length > 0;
    });

    if (invalidTasks.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Some tasks are missing required fields. Each task must have: title, dueDate, priority, and status.`
      });
    }

    const insights = await analyzeTasksWithAI(tasks);
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to generate insights'
    });
  }
}; 