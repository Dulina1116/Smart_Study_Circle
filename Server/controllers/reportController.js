import Report from "../models/Report.js";

export const getPendingReports = async (req, res) => {
  try {
    const reports = await Report.find({
      status: { $in: ["Pending", "Reviewed"] },
    }).sort("-createdAt");
    res.json(reports);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reports", error: error.message });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Reviewed", "Dismissed", "Resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(report);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating report status", error: error.message });
  }
};
