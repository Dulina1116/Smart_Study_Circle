import OfficeHour from '../models/OfficeHour.js'

export const getUpcomingOfficeHours = async (req, res) => {
  try {
    const officeHours = await OfficeHour.find({ lecturer: req.user._id, status: 'Scheduled' })
                                        .sort('date')
                                        .limit(3);
    res.json(officeHours);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching office hours', error: error.message });
  }
}

export const createOfficeHour = async (req, res) => {
  try {
    const { title, date, startTime, endTime } = req.body;
    
    const newOfficeHour = await OfficeHour.create({
      title,
      date,
      startTime,
      endTime,
      lecturer: req.user._id
    });
    res.status(201).json(newOfficeHour);
  } catch (error) {
    res.status(500).json({ message: 'Error creating office hour', error: error.message });
  }
}
