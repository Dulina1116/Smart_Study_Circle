export const normalizeStudyCircle = (doc) => {
  const data = doc.toObject ? doc.toObject() : doc;
  
  return {
    _id: data._id,
    name: data.name || data.subject || '',
    description: data.description || '',
    moduleCode: data.moduleCode || '',
    subject: data.subject || '',
    semester: data.semester || '',
    year: data.year || new Date().getFullYear(),
    
    // Normalize mixed fields
    creator: data.createdBy || data.creator || null,
    members: data.members || [],
    moderators: data.moderators || data.coModerators || [],
    requests: data.requests || data.joinRequests || [],
    isActive: data.isActive !== undefined ? data.isActive : (data.isLive !== undefined ? data.isLive : false),
    
    visibility: data.visibility || 'public',
    inviteCode: data.inviteCode || '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};
