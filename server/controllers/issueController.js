import Issue from '../models/Issue.js';
import mongoose from 'mongoose';
import { queueNotification } from '../utils/queue.js';

export const getIssues = async (req, res) => {
  try {
    const issues = await Issue.find({}).populate('reportedBy', 'name email');
    res.status(200).json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNearbyIssues = async (req, res) => {
  try {
    const lat = parseFloat(req.query.latitude || req.query.lat);
    const lng = parseFloat(req.query.longitude || req.query.lng);
    const category = req.query.category;
    const radiusKm = parseFloat(req.query.radius || req.query.maxDistance) || 1;
    const zoom = parseInt(req.query.zoom) || 10;

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    const maxDistanceMeters = Math.max(10, Math.min(50000, radiusKm * 1000));

    // LEVEL 3: SERVER-SIDE CLUSTERING
    // If zoom is low (< 12), we group issues into buckets to reduce client load
    if (zoom < 12) {
      const clusters = await Issue.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'dist.calculated',
            maxDistance: maxDistanceMeters,
            spherical: true,
            key: 'location'
          }
        },
        { $match: { status: { $nin: ['resolved', 'closed'] } } },
        {
          $group: {
            _id: {
              latBucket: { $round: ["$latitude", 1] }, 
              lngBucket: { $round: ["$longitude", 1] }
            },
            count: { $sum: 1 },
            latestIssue: { $first: "$$ROOT" }
          }
        }
      ]);
      return res.status(200).json({ type: 'cluster', data: clusters });
    }

    // Project fields: performance optimization
    const issues = await Issue.find({
      category,
      status: { $nin: ['resolved', 'closed'] },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistanceMeters
        }
      }
    }).select("title description category location latitude longitude status upvotes reportedAt").limit(100);

    return res.status(200).json({ type: 'list', data: issues });
  } catch (err) {
    console.error('getNearbyIssues error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createIssue = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { title, description, category, latitude, longitude } = req.body;
    
    if (!title || !description || !category || latitude === undefined || longitude === undefined) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, latitude, and longitude.'
      });
    }

    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);

    if (isNaN(parsedLat) || isNaN(parsedLng) || parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinate parameters. Latitude must be between -90 and 90, and Longitude must be between -180 and 180.'
      });
    }

    // Concurrency Check: Verify no existing open issue is registered within close coordinates
    const duplicate = await Issue.findOne({
      category,
      status: 'open',
      latitude: { $gte: parsedLat - 0.0001, $lte: parsedLat + 0.0001 },
      longitude: { $gte: parsedLng - 0.0001, $lte: parsedLng + 0.0001 }
    }).session(session);

    if (duplicate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: 'A similar issue in this location has already been reported and is currently open.'
      });
    }

    const newIssue = new Issue({
      title,
      description,
      category,
      latitude: parsedLat,
      longitude: parsedLng,
      reportedBy: req.user ? req.user._id : undefined
    });

    await newIssue.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Queue civic report notification
    await queueNotification('civic_report_created', { issueId: newIssue._id });

    res.status(201).json({ success: true, data: newIssue });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upvoteIssue = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required to upvote' });
    }

    const issue = await Issue.findOneAndUpdate(
      { _id: id, upvotedBy: { $ne: userId } },
      {
        $inc: { upvotes: 1 },
        $addToSet: { upvotedBy: userId },
      },
      { new: true }
    );

    if (!issue) {
      const exists = await Issue.exists({ _id: id });
      if (!exists) return res.status(404).json({ message: 'Issue not found' });
      return res.status(409).json({ message: 'You have already upvoted this issue' });
    }

    return res.status(200).json(issue);
  } catch (err) {
    console.error('upvoteIssue error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const id = req.params.id;
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    return res.status(200).json(issue);
  } catch (err) {
    console.error('getIssueById error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const oldStatus = issue.status;
    issue.status = status;
    if (status === 'resolved') {
      issue.resolvedAt = new Date();
    }
    issue.statusHistory.push({ status, note, updatedAt: new Date() });
    await issue.save();

    // Queue status update notification
    await queueNotification('issue_status_update', {
      issueId: issue._id,
      oldStatus,
      newStatus: status
    });

    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
