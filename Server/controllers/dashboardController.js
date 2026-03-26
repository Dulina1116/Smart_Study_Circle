import Circle from '../models/Circle.js'
import Report from '../models/Report.js'

export const getDashboardStats = async (req, res) => {
  try {
    const circles = await Circle.find({ creator: req.user._id });
    const pendingReportsCount = await Report.countDocuments({ status: { $in: ['Pending', 'Reviewed'] } }); 

    // Aggregating mock "total sessions" and "top module"
    const totalSessions = circles.length * 4 + 15; 
    const activeCircles = circles.length;

    // determine top module naively
    const moduleCounts = {};
    let topModule = "N/A";
    let maxCount = 0;
    circles.forEach(c => {
      moduleCounts[c.courseName] = (moduleCounts[c.courseName] || 0) + 1;
      if (moduleCounts[c.courseName] > maxCount) {
        maxCount = moduleCounts[c.courseName];
        topModule = c.courseName;
      }
    });

    res.json({
      activeCircles,
      totalSessions,
      topModule,
      reportedIssues: pendingReportsCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
}

// Circle analytics
export const getCircleAnalytics = async (req, res) => {
  try {
    const { circleId } = req.params;
    res.json({
      circleId,
      engagementScore: 85, // Dummy calculated values for UI mapping
      attendanceRate: 92,
      recentActivity: 'High'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
}
