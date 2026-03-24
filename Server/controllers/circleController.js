import Circle from '../models/Circle.js'

// @desc    Create new circle
// @route   POST /api/circles
// @access  Private (Lecturer)
export const createCircle = async (req, res) => {
  try {
    const { 
      courseCode, courseName, circleName, description, 
      isPrivate, inviteCode, firstSession, circleType
    } = req.body;

    if (!courseCode || !circleName) {
      return res.status(400).json({ message: 'Course Code and Circle Name are required' });
    }

    const circle = await Circle.create({
      courseCode,
      courseName,
      circleName,
      circleType: circleType || 'lecturer',
      description,
      isPrivate,
      inviteCode,
      firstSession,
      creator: req.user._id,
      members: [req.user._id], // Creator is intrinsically a member
      activity: "Newly Created",
      activityType: "moderate"
    });

    res.status(201).json(circle);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create circle', error: error.message });
  }
}

// @desc    Get lecturer's circles
// @route   GET /api/circles
// @access  Private
export const getLecturerCircles = async (req, res) => {
  try {
    // A user can fetch circles they created or where they are a member.
    const circles = await Circle.find({
      $or: [
        { creator: req.user._id },
        { members: req.user._id }
      ]
    }).sort({ createdAt: -1 });

    res.json(circles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch circles', error: error.message });
  }
}

// @desc    Update a circle
// @route   PUT /api/circles/:id
// @access  Private
export const updateCircle = async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    // Check if user is the creator
    if (circle.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this circle' });
    }

    const updatedCircle = await Circle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedCircle);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update circle', error: error.message });
  }
}

// @desc    Delete a circle
// @route   DELETE /api/circles/:id
// @access  Private
export const deleteCircle = async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    if (circle.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this circle' });
    }

    await Circle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Circle removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete circle', error: error.message });
  }
}
