import Resource from "../models/Resource.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";

// GET /api/resources - Get all resources with filters
export const getAllResources = async (req, res) => {
  try {
    const {
      category,
      type,
      search,
      sort = "-createdAt",
      limit = 20,
      page = 1,
    } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const resources = await Resource.find(filter)
      .populate(
        "uploadedBy",
        "fullName displayName email avatar profilePicture",
      )
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Resource.countDocuments(filter);

    return res.json({
      resources,
      pagination: {
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        hasMore: skip + Number(limit) < total,
      },
    });
  } catch (err) {
    console.error("Get All Resources Error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error fetching resources." });
  }
};

// GET /api/resources/featured - Get featured/lecturer recommended resources
export const getFeaturedResources = async (req, res) => {
  try {
    const resources = await Resource.find({
      isActive: true,
      isLecturerRecommended: true,
    })
      .populate(
        "uploadedBy",
        "fullName displayName email avatar profilePicture",
      )
      .sort("-createdAt")
      .limit(10);

    return res.json(resources);
  } catch (err) {
    console.error("Get Featured Resources Error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error fetching featured resources." });
  }
};

// GET /api/resources/categories - Get resources grouped by category
export const getResourcesByCategory = async (req, res) => {
  try {
    const categories = {
      "lecture-notes": { label: "Lecture Notes", icon: "BookOpen" },
      "past-papers": { label: "Past Papers", icon: "FileText" },
      summaries: { label: "Student Summaries", icon: "FileText" },
      handout: { label: "Handouts", icon: "File" },
      other: { label: "Other", icon: "Folder" },
    };

    const result = {};

    for (const [categoryId, categoryInfo] of Object.entries(categories)) {
      const count = await Resource.countDocuments({
        category: categoryId,
        isActive: true,
      });

      result[categoryId] = {
        ...categoryInfo,
        count,
        id: categoryId,
      };
    }

    return res.json(result);
  } catch (err) {
    console.error("Get Resources By Category Error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error fetching categories." });
  }
};

// GET /api/resources/category/:category - Get resources by specific category
export const getResourcesBySpecificCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const resources = await Resource.find({
      category,
      isActive: true,
    })
      .populate(
        "uploadedBy",
        "fullName displayName email avatar profilePicture",
      )
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    const total = await Resource.countDocuments({ category, isActive: true });

    return res.json({
      resources,
      pagination: {
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
      },
    });
  } catch (err) {
    console.error("Get Resources By Category Error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error fetching resources." });
  }
};

// GET /api/resources/:resourceId - Get single resource
export const getResourceById = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const resource = await Resource.findById(resourceId).populate(
      "uploadedBy",
      "fullName displayName email avatar profilePicture",
    );

    if (!resource || !resource.isActive) {
      return res.status(404).json({ message: "Resource not found." });
    }

    // Count only the first view per authenticated user.
    const meId = String(req.user._id);
    const alreadyViewed = Array.isArray(resource.viewedBy)
      ? resource.viewedBy.some((id) => String(id) === meId)
      : false;

    if (!alreadyViewed) {
      resource.views = (resource.views || 0) + 1;
      resource.viewedBy = Array.isArray(resource.viewedBy)
        ? resource.viewedBy
        : [];
      resource.viewedBy.push(req.user._id);
      await resource.save();
    }

    return res.json(resource);
  } catch (err) {
    console.error("Get Resource By ID Error:", err.message);
    return res.status(500).json({ message: "Server error fetching resource." });
  }
};

// POST /api/resources - Create new resource (protected)
export const createResource = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      externalLink,
      isLecturerRecommended,
      duration,
    } = req.body;
    const uploadedBy = req.user._id;

    if (!title || !type) {
      return res.status(400).json({ message: "Title and type are required." });
    }

    const resource = await Resource.create({
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      category: category || "other",
      type,
      externalLink: externalLink ? String(externalLink).trim() : null,
      duration: duration ? String(duration).trim() : null,
      uploadedBy,
      isLecturerRecommended: isLecturerRecommended || false,
      filePath: req.file ? req.file.path : null,
      fileSize: req.file ? req.file.size : 0,
    });

    const populated = await resource.populate(
      "uploadedBy",
      "fullName displayName email avatar profilePicture",
    );

    return res.status(201).json({
      message: "Resource created successfully.",
      resource: populated,
    });
  } catch (err) {
    console.error("Create Resource Error:", err.message);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: "Server error creating resource." });
  }
};

// PUT /api/resources/:resourceId - Update resource
export const updateResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const {
      title,
      description,
      category,
      type,
      externalLink,
      isLecturerRecommended,
      duration,
    } = req.body;

    const resource = await Resource.findById(resourceId);

    if (!resource || !resource.isActive) {
      return res.status(404).json({ message: "Resource not found." });
    }

    // Check if user is uploader or admin (simplified - check uploader)
    if (String(resource.uploadedBy) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only the uploader can update this resource." });
    }

    if (title) resource.title = String(title).trim();
    if (description !== undefined)
      resource.description = description ? String(description).trim() : "";
    if (category) resource.category = category;
    if (type) resource.type = type;
    if (externalLink !== undefined)
      resource.externalLink = externalLink ? String(externalLink).trim() : null;
    if (duration !== undefined)
      resource.duration = duration ? String(duration).trim() : null;
    if (isLecturerRecommended !== undefined)
      resource.isLecturerRecommended = isLecturerRecommended;

    if (req.file) {
      if (resource.filePath && fs.existsSync(resource.filePath)) {
        fs.unlinkSync(resource.filePath);
      }
      resource.filePath = req.file.path;
      resource.fileSize = req.file.size;
    }

    await resource.save();

    const populated = await resource.populate(
      "uploadedBy",
      "fullName displayName email avatar profilePicture",
    );

    return res.json({
      message: "Resource updated successfully.",
      resource: populated,
    });
  } catch (err) {
    console.error("Update Resource Error:", err.message);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: "Server error updating resource." });
  }
};

// DELETE /api/resources/:resourceId - Delete resource
export const deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const resource = await Resource.findById(resourceId);

    if (!resource || !resource.isActive) {
      return res.status(404).json({ message: "Resource not found." });
    }

    // Check if user is uploader
    if (String(resource.uploadedBy) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only the uploader can delete this resource." });
    }

    // Soft delete
    resource.isActive = false;
    await resource.save();

    // Clean up file if exists
    if (resource.filePath && fs.existsSync(resource.filePath)) {
      fs.unlinkSync(resource.filePath);
    }

    return res.json({ message: "Resource deleted successfully." });
  } catch (err) {
    console.error("Delete Resource Error:", err.message);
    return res.status(500).json({ message: "Server error deleting resource." });
  }
};

// POST /api/resources/:resourceId/download - Track downloads
export const trackDownload = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const resource = await Resource.findById(resourceId);

    if (!resource || !resource.isActive) {
      return res.status(404).json({ message: "Resource not found." });
    }

    resource.downloads = (resource.downloads || 0) + 1;
    await resource.save();

    return res.json({
      message: "Download tracked.",
      downloads: resource.downloads,
    });
  } catch (err) {
    console.error("Track Download Error:", err.message);
    return res.status(500).json({ message: "Server error tracking download." });
  }
};

// GET /api/resources/recent - Get recent uploads
export const getRecentResources = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const resources = await Resource.find({ isActive: true })
      .populate(
        "uploadedBy",
        "fullName displayName email avatar profilePicture",
      )
      .sort("-createdAt")
      .limit(Number(limit));

    return res.json(resources);
  } catch (err) {
    console.error("Get Recent Resources Error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error fetching recent resources." });
  }
};
