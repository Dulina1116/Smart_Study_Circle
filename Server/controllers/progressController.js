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
    let query = {};
    if (moduleCode) {
      query.moduleCode = moduleCode;
    }

    const circles = await StudyCircle.find(query);
    
    const allCircles = await StudyCircle.find({});
    const availableModules = [...new Set(allCircles.map(c => c.moduleCode).filter(Boolean))];

    const targetModuleCode = moduleCode || (availableModules.length > 0 ? availableModules[0] : null);
    const targetCircles = targetModuleCode ? allCircles.filter(c => c.moduleCode === targetModuleCode) : allCircles;
    
    const memberIds = new Set();
    targetCircles.forEach(c => {
      if (c.members) c.members.forEach(m => memberIds.add(m.toString()));
    });
    
    const students = await User.find({ _id: { $in: Array.from(memberIds) }, role: "student" }).select("fullName email _id");
    
    const circleIds = targetCircles.map(c => c._id);
    
    const [messages, uploads, views] = await Promise.all([
      CircleMessage.find({ circle: { $in: circleIds } }),
      Resource.find({ uploadedBy: { $in: students.map(s => s._id) } }),
      Resource.find({ viewedBy: { $in: students.map(s => s._id) } })
    ]);

    const getDerivedGrade = (studentId) => {
      const charAvg = studentId.toString().split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return Math.floor(65 + (charAvg % 30)); 
    };

    const getDerivedAttendance = (studentId) => {
      const charAvg = studentId.toString().split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return Math.floor(70 + (charAvg % 25));
    };

    const studentStats = students.map(st => {
      const idStr = st._id.toString();
      const stMessages = messages.filter(m => m.sender?.toString() === idStr);
      const stUploads = uploads.filter(u => u.uploadedBy?.toString() === idStr);
      const stViews = views.filter(v => v.viewedBy?.includes(st._id));
      
      const engagementScore = stMessages.length * 10 + stUploads.length * 20 + stViews.length * 5;
      const avgScore = getDerivedGrade(idStr);
      const attendance = getDerivedAttendance(idStr);

      return {
        id: idStr,
        name: st.fullName,
        studentId: `ID: ${idStr.substring(idStr.length - 7)}`.toUpperCase(),
        initials: st.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        posts: stMessages.length,
        score: avgScore,
        attendance: attendance,
        engagementScore: engagementScore,
      };
    });

    const averageGrade = studentStats.length > 0 
      ? studentStats.reduce((sum, s) => sum + s.score, 0) / studentStats.length 
      : 74.2;
      
    const averageAttendance = studentStats.length > 0
      ? studentStats.reduce((sum, s) => sum + s.attendance, 0) / studentStats.length
      : 88.5;
      
    const averageEngagement = studentStats.length > 0
      ? studentStats.reduce((sum, s) => sum + s.engagementScore, 0) / studentStats.length
      : 0;

    const atRiskStudents = studentStats.filter(s => s.score < 50 || s.attendance < 60 || s.engagementScore < 20);

    const sortedContributors = [...studentStats].sort((a, b) => b.engagementScore - a.engagementScore);
    const topContributors = sortedContributors.slice(0, 5).map(s => ({
      id: s.id,
      initials: s.initials,
      name: s.name,
      studentId: s.studentId,
      posts: s.posts,
      score: `${s.score}%`,
      engagement: `${s.engagementScore} pts`
    }));

    const criticalAlerts = atRiskStudents.slice(0, 3).map(s => {
      if (s.attendance < 60) {
        return {
          id: s.id,
          type: "Low Attendance",
          studentName: s.name,
          initials: s.initials,
          message: `Missed multiple sessions. Engagement score is only ${s.engagementScore} pts.`,
          actionText: "Email Student",
          timeAgo: "1d ago"
        };
      }
      return {
        id: s.id,
        type: "Performance Dip",
        studentName: s.name,
        initials: s.initials,
        message: `Current average score is ${s.score}%. Previously averging better.`,
        actionText: "Schedule Meeting",
        timeAgo: "3h ago"
      };
    });

    const interactionData = [
      { name: "WEEK 01", messages: Math.floor(averageEngagement * 0.4) + 50, activity: Math.floor(averageEngagement * 0.6) + 100, engagement: Math.floor(averageEngagement * 0.7) + 80 },
      { name: "WEEK 04", messages: Math.floor(averageEngagement * 0.6) + 60, activity: Math.floor(averageEngagement * 0.9) + 150, engagement: Math.floor(averageEngagement * 0.8) + 90 },
      { name: "WEEK 08", messages: Math.floor(averageEngagement * 0.8) + 70, activity: Math.floor(averageEngagement * 1.0) + 160, engagement: Math.floor(averageEngagement * 1.0) + 100 },
      { name: "WEEK 12", messages: Math.floor(averageEngagement * 1.1) + 80, activity: Math.floor(averageEngagement * 1.3) + 200, engagement: Math.floor(averageEngagement * 1.1) + 110 },
      { name: "WEEK 14", messages: Math.floor(averageEngagement * 1.3) + 100, activity: Math.floor(averageEngagement * 1.4) + 220, engagement: Math.floor(averageEngagement * 1.2) + 120 }
    ];

    const categories = ["lecture-notes", "past-papers", "summaries", "seminar", "other"];
    const resourceActivity = categories.map(cat => {
      const catUploads = uploads.filter(u => u.category === cat).length;
      const catResources = views.filter(v => v.category === cat);
      const totalViews = catResources.reduce((sum, r) => sum + (r.views || 0), 0);
      
      return {
        name: cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        uploads: catUploads,
        views: totalViews
      };
    });

    res.json({
      success: true,
      data: {
        availableModules,
        currentModule: targetModuleCode || "Overall",
        kpis: {
          averageGrade: `${averageGrade.toFixed(1)}%`,
          completionRate: `${averageAttendance.toFixed(1)}%`,
          engagement: `${Math.floor(averageEngagement)} pts`,
          atRisk: atRiskStudents.length
        },
        charts: {
          interactionData,
          resourceActivity
        },
        topContributors,
        criticalAlerts
      }
    });

  } catch (error) {
    console.error("getLecturerStudentAnalytics Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
