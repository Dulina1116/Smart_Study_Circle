import StudyCircle from "../models/StudyCircle.js";
import Resource from "../models/Resource.js";
import CircleMessage from "../models/CircleMessage.js";
import User from "../models/User.js";
import { normalizeStudyCircle } from "../helpers/normalizeStudyCircle.js";

// GET /api/progress/student/:userId
export const getStudentProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      circles,
      resourcesUploaded,
      resourcesViewedDocs,
      messagesLast4Weeks,
      recentMessages,
      topViewedResources,
    ] = await Promise.all([
      // All circles this student belongs to
      StudyCircle.find({ members: userId }),
      // All active resources uploaded by this student
      Resource.find({ uploadedBy: userId, isActive: true }),
      // All active resources this student has viewed
      Resource.find({ viewedBy: userId, isActive: true }),
      // All messages sent by this student in the last 4 weeks (for charts)
      CircleMessage.find({
        sender: userId,
        createdAt: { $gte: fourWeeksAgo },
      }),
      // Recent messages for the feed
      CircleMessage.find({
        sender: userId,
        createdAt: { $gte: fourWeeksAgo },
      })
        .sort({ createdAt: -1 })
        .limit(12)
        .populate("circle", "subject moduleCode isActive"),
      // Top resources viewed by this student
      Resource.find({ viewedBy: userId, isActive: true })
        .sort({ views: -1, downloads: -1, createdAt: -1 })
        .limit(5)
        .select("title type category views downloads createdAt"),
    ]);

    const normalizedCircles = circles.map(normalizeStudyCircle);

    const joinedCircles = normalizedCircles.length;
    const activeCircles = normalizedCircles.filter((c) => c.isActive).length;

    // Modules joined by the student
    const moduleMap = new Map();
    normalizedCircles.forEach((c) => {
      const key = `${c.moduleCode || "Unknown"}-${c.semester || "Unknown"}-${
        c.year || "Unknown"
      }`;
      if (!moduleMap.has(key)) {
        moduleMap.set(key, {
          moduleCode: c.moduleCode || "Unknown",
          subject: c.subject || "Unknown",
          semester: c.semester || "Unknown",
          year: c.year || "Unknown",
          studyCirclesCount: 0,
          studentIds: new Set(),
        });
      }
      const entry = moduleMap.get(key);
      entry.studyCirclesCount += 1;
      (c.members || []).forEach((m) => entry.studentIds.add(String(m)));
    });

    const modules = Array.from(moduleMap.values()).map((m) => ({
      moduleCode: m.moduleCode,
      subject: m.subject,
      semester: m.semester,
      year: m.year,
      studyCirclesCount: m.studyCirclesCount,
      totalStudents: m.studentIds.size,
    }));

    const totalModulesJoined = modules.length;

    // Summary metrics based on real data
    const totalMessages = messagesLast4Weeks.length;
    const resourcesShared = resourcesUploaded.length;
    const resourcesViewed = resourcesViewedDocs.length;
    const studyPlansCreated = resourcesUploaded.filter((r) =>
      ["summaries", "lecture-notes"].includes(r.category || ""),
    ).length;

    const groupActivity =
      totalMessages +
      normalizedCircles.reduce(
        (acc, c) => acc + (Array.isArray(c.members) ? c.members.length : 0),
        0,
      );

    const engagementScore =
      activeCircles * 20 +
      totalModulesJoined * 10 +
      resourcesShared * 2 +
      Math.min(totalMessages, 100);

    // Weekly engagement: last 7 days of interactions (messages + uploads + views)
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyCounts = new Map();

    messagesLast4Weeks.forEach((msg) => {
      if (!msg.createdAt) return;
      const d = new Date(msg.createdAt);
      if (d < sevenDaysAgo) return;
      const key = d.toISOString().slice(0, 10);
      dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1);
    });

    resourcesUploaded.forEach((res) => {
      if (!res.createdAt) return;
      const d = new Date(res.createdAt);
      if (d < sevenDaysAgo) return;
      const key = d.toISOString().slice(0, 10);
      dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1);
    });

    resourcesViewedDocs.forEach((res) => {
      if (!res.updatedAt) return;
      const d = new Date(res.updatedAt);
      if (d < sevenDaysAgo) return;
      const key = d.toISOString().slice(0, 10);
      dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1);
    });

    const weeklyEngagement = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      const dayLabel = dayNames[d.getDay()];
      const interactions = dailyCounts.get(key) || 0;
      const hours = Number((interactions * 0.5).toFixed(1));
      weeklyEngagement.push({ day: dayLabel, hours });
    }

    // Monthly engagement: relative focus per week over last 4 weeks
    const weeklyBuckets = [0, 0, 0, 0]; // W1..W4

    const registerBucket = (date) => {
      const diffDays =
        (now.getTime() - new Date(date).getTime()) /
        (24 * 60 * 60 * 1000);
      if (diffDays < 0 || diffDays > 28) return;

      if (diffDays < 7) weeklyBuckets[3] += 1;
      else if (diffDays < 14) weeklyBuckets[2] += 1;
      else if (diffDays < 21) weeklyBuckets[1] += 1;
      else weeklyBuckets[0] += 1;
    };

    messagesLast4Weeks.forEach((msg) => {
      if (!msg.createdAt) return;
      registerBucket(msg.createdAt);
    });

    resourcesUploaded.forEach((res) => {
      if (!res.createdAt) return;
      registerBucket(res.createdAt);
    });

    resourcesViewedDocs.forEach((res) => {
      if (!res.updatedAt) return;
      registerBucket(res.updatedAt);
    });

    const maxBucket = Math.max(...weeklyBuckets, 1);
    const monthlyEngagement = weeklyBuckets.map((count, index) => ({
      name: `W${index + 1}`,
      focus: Math.round((count / maxBucket) * 100),
    }));

    // Per-circle snapshot for UI (basic stats only)
    const circleStats = normalizedCircles.map((c) => ({
      id: c._id,
      subject: c.subject || "",
      moduleCode: c.moduleCode || "",
      semester: c.semester || "",
      year: c.year || "",
      isActive: Boolean(c.isActive),
      memberCount: Array.isArray(c.members) ? c.members.length : 0,
    }));

    const recentResources = resourcesUploaded
      .slice(0, 6)
      .map((res) => ({
        id: res._id,
        title: res.title,
        type: res.type,
        category: res.category,
        views: res.views || 0,
        downloads: res.downloads || 0,
        createdAt: res.createdAt,
      }));

    const recentMessagesPayload = recentMessages.map((msg) => ({
      id: msg._id,
      text: msg.text || "",
      createdAt: msg.createdAt,
      circle: msg.circle?._id
        ? {
            id: msg.circle._id,
            subject: msg.circle.subject || "",
            moduleCode: msg.circle.moduleCode || "",
            isActive: Boolean(msg.circle.isActive),
          }
        : null,
    }));

    const typeCount = resourcesUploaded.reduce((acc, res) => {
      const key = res.type || "other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const resourceTypeBreakdown = Object.entries(typeCount).map(
      ([name, value]) => ({ name, value }),
    );

    const topResources = topViewedResources.map((res) => ({
      id: res._id,
      title: res.title,
      type: res.type,
      category: res.category,
      views: res.views || 0,
      downloads: res.downloads || 0,
      createdAt: res.createdAt,
    }));

    res.json({
      success: true,
      summary: {
        resourcesShared,
        resourcesViewed,
        studyPlansCreated,
        engagementScore,
        groupActivity,
        messagesCount: totalMessages,
      },
      weeklyEngagement,
      monthlyEngagement,
      modules,
      joinedCircles,
      activeCircles,
      circleStats,
      recentResources,
      recentMessages: recentMessagesPayload,
      resourceTypeBreakdown,
      topResources,
    });
  } catch (error) {
    console.error("getStudentProgress Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
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

// GET /api/progress/lecturer/analytics
export const getLecturerStudentAnalytics = async (req, res) => {
  try {
    const { moduleCode } = req.query;
    
    // 1. Get Available Modules for the filter
    const allCircles = await StudyCircle.find({ isActive: true });
    const availableModules = [...new Set(allCircles.map(c => c.moduleCode).filter(Boolean))];

    // 2. Identify Target Circles and Students
    const targetModuleCode = moduleCode || (availableModules.length > 0 ? availableModules[0] : null);
    
    if (!targetModuleCode) {
      return res.json({
        success: true,
        data: {
          availableModules: [],
          currentModule: "None",
          kpis: { averageGrade: "0%", completionRate: "0%", engagement: "0 pts", atRisk: 0 },
          charts: { interactionData: [], resourceActivity: [] },
          topContributors: [],
          criticalAlerts: []
        }
      });
    }

    const targetCircles = await StudyCircle.find({ moduleCode: targetModuleCode, isActive: true });
    const circleIds = targetCircles.map(c => c._id);
    
    const memberIdsSet = new Set();
    targetCircles.forEach(c => {
      if (c.members) c.members.forEach(m => memberIdsSet.add(m.toString()));
    });
    const memberIds = Array.from(memberIdsSet);

    // 3. Fetch Real Data
    const [students, messages, uploads, recommendedResources] = await Promise.all([
      User.find({ _id: { $in: memberIds }, role: "student" }).select("fullName email _id"),
      CircleMessage.find({ circle: { $in: circleIds } }),
      // Fetch resources uploaded BY students in these circles OR assigned to these circles
      Resource.find({
        isActive: true,
        $or: [
          { circleId: { $in: circleIds } },
          { uploadedBy: { $in: memberIds } }
        ]
      }),
      Resource.find({
        isActive: true,
        isLecturerRecommended: true,
        $or: [
          { circleId: { $in: circleIds } },
          { uploadedBy: { $in: memberIds } }
        ]
      })
    ]);

    const finalRecommended = recommendedResources;

    const totalRecommendedCount = finalRecommended.length || 1; // Avoid division by zero

    // 4. Calculate Individual Student Metrics
    const studentStats = students.map(st => {
      const idStr = st._id.toString();
      
      const stMessages = messages.filter(m => m.sender?.toString() === idStr);
      const stUploads = uploads.filter(u => u.uploadedBy?.toString() === idStr);
      
      // Calculate views: how many resources has this student viewed?
      // We check the viewedBy array in all resources relevant to this module
      const stViews = uploads.filter(u => u.viewedBy?.some(vid => vid.toString() === idStr));
      const recViews = finalRecommended.filter(r => r.viewedBy?.some(vid => vid.toString() === idStr));

      const msgWeight = 5;
      const uploadWeight = 15;
      const viewWeight = 2;

      const engagementScore = (stMessages.length * msgWeight) + (stUploads.length * uploadWeight) + (stViews.length * viewWeight);
      
      // Completion rate based on recommended resources viewed
      const completionRate = (recViews.length / totalRecommendedCount) * 100;
      
      // Performance score: Use a mix of engagement and completion
      // We'll normalize engagement against a "target" of 150 points for a perfect score
      const targetEngagement = 150;
      const performanceScore = Math.min(((engagementScore / targetEngagement) * 0.6 + (completionRate / 100) * 0.4) * 100, 100);

      return {
        id: idStr,
        name: st.fullName,
        studentId: `ID: ${idStr.substring(idStr.length - 7)}`.toUpperCase(),
        initials: st.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        posts: stMessages.length,
        score: Math.round(performanceScore),
        engagementScore: Math.round(engagementScore),
        completionRate: Math.round(completionRate),
        messages: stMessages,
        uploads: stUploads
      };
    });

    // 5. Aggregate Class KPIs
    const avgPerformance = studentStats.length > 0 
      ? studentStats.reduce((sum, s) => sum + s.score, 0) / studentStats.length 
      : 0;
      
    const avgCompletion = studentStats.length > 0
      ? studentStats.reduce((sum, s) => sum + s.completionRate, 0) / studentStats.length
      : 0;
      
    const avgEngagement = studentStats.length > 0
      ? studentStats.reduce((sum, s) => sum + s.engagementScore, 0) / studentStats.length
      : 0;

    const atRiskStudents = studentStats.filter(s => s.score < 40 || s.completionRate < 30);

    // 6. Performance Distribution
    const distribution = [
      { name: "0-20%", count: 0, color: "#f43f5e" },
      { name: "21-40%", count: 0, color: "#fb7185" },
      { name: "41-60%", count: 0, color: "#fbbf24" },
      { name: "61-80%", count: 0, color: "#0d9488" },
      { name: "81-100%", count: 0, color: "#0f766e" }
    ];

    studentStats.forEach(s => {
      const score = s.score;
      if (score <= 20) distribution[0].count++;
      else if (score <= 40) distribution[1].count++;
      else if (score <= 60) distribution[2].count++;
      else if (score <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    // 7. Top Contributors
    const topContributors = [...studentStats]
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5)
      .map(s => ({
        id: s.id,
        initials: s.initials,
        name: s.name,
        studentId: s.studentId,
        posts: s.posts,
        score: `${s.score}%`,
        engagement: `${s.engagementScore} pts`
      }));

    // 8. Top Resources specifically for this module
    const topResources = [...uploads]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(r => ({
        id: r._id,
        title: r.title,
        type: r.type,
        views: r.views || 0,
        downloads: r.downloads || 0
      }));

    // 9. Critical Alerts (excluding attendance)
    const criticalAlerts = atRiskStudents.slice(0, 3).map(s => {
      const isLowPerformance = s.score < 40;
      return {
        id: s.id,
        type: isLowPerformance ? "Performance Dip" : "Low Engagement",
        studentName: s.name,
        initials: s.initials,
        message: isLowPerformance 
          ? `Performance score dropped to ${s.score}%. Recommended resources viewed: ${s.completionRate}%.`
          : `Only ${s.completionRate}% of recommended materials viewed. Engagement is low at ${s.engagementScore} pts.`,
        actionText: isLowPerformance ? "Schedule Meeting" : "Email Student",
        timeAgo: "Recently"
      };
    });

    // 10. Interaction Chart Data (Last 14 Weeks)
    const now = new Date();
    const interactionData = [];
    for (let i = 13; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7 + now.getDay())); 
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekMessages = messages.filter(m => m.createdAt >= weekStart && m.createdAt < weekEnd).length;
      const weekUploads = uploads.filter(u => u.createdAt >= weekStart && u.createdAt < weekEnd).length;
      
      interactionData.push({
        name: `WEEK ${(14 - i).toString().padStart(2, '0')}`,
        messages: weekMessages,
        activity: weekMessages + weekUploads,
        engagement: Math.round((weekMessages * 2) + (weekUploads * 5))
      });
    }

    res.json({
      success: true,
      data: {
        availableModules,
        currentModule: targetModuleCode,
        kpis: {
          averageGrade: `${avgPerformance.toFixed(1)}%`,
          completionRate: `${avgCompletion.toFixed(1)}%`,
          engagement: `${Math.floor(avgEngagement)} pts`,
          atRisk: atRiskStudents.length
        },
        charts: {
          interactionData,
          performanceDistribution: distribution
        },
        topContributors,
        topResources,
        criticalAlerts
      }
    });

  } catch (error) {
    console.error("getLecturerStudentAnalytics Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
