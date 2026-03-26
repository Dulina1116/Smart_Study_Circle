import StudyCircle from '../models/StudyCircle.js';
import { normalizeStudyCircle } from '../helpers/normalizeStudyCircle.js';

// GET /api/progress/student/:userId
export const getStudentProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch all study circles where this user is a member
    const circles = await StudyCircle.find({
      members: userId
    });

    const normalizedCircles = circles.map(normalizeStudyCircle);

    const activeCircles = normalizedCircles.filter(c => c.isActive).length;
    
    // Unique modules logic
    const uniqueModules = new Set(normalizedCircles.map(c => c.moduleCode).filter(Boolean));
    const totalModulesJoined = uniqueModules.size;

    // Dummy logic for engagement to fulfill JSON schema format correctly without breaking
    const groupActivity = normalizedCircles.reduce((acc, c) => acc + (c.members?.length || 0), 0) + (normalizedCircles.length * 10);
    const resourcesShared = normalizedCircles.length * 4; // Mock generic metric
    const studyPlansCreated = normalizedCircles.length > 0 ? normalizedCircles.length + 1 : 0;
    const engagementScore = (activeCircles * 20) + (totalModulesJoined * 10) + resourcesShared;

    res.json({
      success: true,
      summary: {
        resourcesShared,
        studyPlansCreated,
        engagementScore,
        groupActivity
      },
      weeklyEngagement: [],
      monthlyEngagement: [],
      modules: [],
      joinedCircles: normalizedCircles.length,
      activeCircles
    });
  } catch (error) {
    console.error('getStudentProgress Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /api/progress/admin/overview
export const getAdminOverview = async (req, res) => {
  try {
    const circles = await StudyCircle.find({});
    const normalizedCircles = circles.map(normalizeStudyCircle);

    let totalStudentsSet = new Set();
    normalizedCircles.forEach(c => {
      if (c.members && Array.isArray(c.members)) {
        c.members.forEach(memberId => totalStudentsSet.add(memberId.toString()));
      }
    });

    const activeStudyCircles = normalizedCircles.filter(c => c.isActive).length;
    const uniqueModules = new Set(normalizedCircles.map(c => c.moduleCode).filter(Boolean));

    // Module breakdown logic: Group by moduleCode, subject, semester
    const breakdownMap = {};
    normalizedCircles.forEach(c => {
      // Create a unique key for grouping
      const key = `${c.moduleCode || 'Unknown'}-${c.semester || 'Unknown'}-${c.year || 'Unknown'}`;
      if (!breakdownMap[key]) {
        breakdownMap[key] = {
          moduleCode: c.moduleCode || 'Unknown',
          subject: c.subject || 'Unknown',
          semester: c.semester || 'Unknown',
          year: c.year || 'Unknown',
          studyCirclesCount: 0,
          totalStudents: new Set()
        };
      }
      breakdownMap[key].studyCirclesCount += 1;
      if (c.members && Array.isArray(c.members)) {
        c.members.forEach(m => breakdownMap[key].totalStudents.add(m.toString()));
      }
    });

    const moduleBreakdown = Object.values(breakdownMap).map(item => ({
      ...item,
      totalStudents: item.totalStudents.size
    }));

    // Top performing groups (sort by member count)
    const topPerformingGroups = [...normalizedCircles]
      .sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
      .slice(0, 5)
      .map(c => ({
        _id: c._id,
        name: c.name,
        moduleCode: c.moduleCode,
        memberCount: c.members?.length || 0,
        isActive: c.isActive
      }));

    const totalResourcesShared = normalizedCircles.length * 15; // mock
    const totalStudyPlansCreated = normalizedCircles.length * 5; // mock

    res.json({
      success: true,
      summary: {
        totalStudents: totalStudentsSet.size,
        activeStudents: Math.floor(totalStudentsSet.size * 0.8), // Mock active ratio
        totalStudyCircles: normalizedCircles.length,
        activeStudyCircles,
        totalModules: uniqueModules.size,
        totalResourcesShared,
        totalStudyPlansCreated
      },
      weeklyEngagement: [],
      monthlyEngagement: [],
      moduleBreakdown,
      topPerformingGroups
    });
  } catch (error) {
    console.error('getAdminOverview Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
