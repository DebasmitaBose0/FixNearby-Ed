import Message from '../models/Message.js';

/**
 * Retrieves chat history between current user and partnerId using cursor-based pagination.
 * GET /api/chat/history/:partnerId
 * Query params: limit (default 20), cursor (message _id)
 */
export const getChatHistory = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { cursor } = req.query;

    const currentUserId = req.user._id;

    // Build the query to find messages between current user and partnerId excluding soft-deleted
    const query = {
      $or: [
        { senderId: currentUserId, receiverId: partnerId },
        { senderId: partnerId, receiverId: currentUserId }
      ],
      isDeleted: { $ne: true }
    };

    // If cursor exists, fetch messages older than the cursor (created before cursor)
    if (cursor) {
      query._id = { $lt: cursor };
    }

    // If bookingId provided, filter by booking context
    if (req.query.bookingId) {
      query.bookingId = req.query.bookingId;
    }

    // Query messages: sort by _id (which correlates to time) descending, limit to requested size
    const messages = await Message.find(query)
      .sort({ _id: -1 })
      .limit(limit);

    // Format the response with the next cursor for the client to retrieve subsequent messages
    const nextCursor = messages.length > 0 ? messages[messages.length - 1]._id : null;
    const hasMore = messages.length === limit;
    const { calculateMessageRetryDelay } = await import('../services/messageRetryService.js');
    const retryPolicy = calculateMessageRetryDelay(1);

    res.status(200).json({
      success: true,
      messages,
      nextCursor,
      hasMore,
      retryPolicy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving chat history',
      error: error.message
    });
  }
};

/**
 * Marks unread messages from partnerId as read.
 * PATCH /api/chat/read/:partnerId
 */
export const markAsRead = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const currentUserId = req.user._id;

    const result = await Message.updateMany(
      {
        senderId: partnerId,
        receiverId: currentUserId,
        status: { $ne: 'read' }
      },
      {
        $set: {
          status: 'read',
          readAt: new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error marking messages as read',
      error: error.message
    });
  }
};

/**
 * Retrieves total unread message counts grouped by sender.
 * GET /api/chat/unread-count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: currentUserId,
          status: { $ne: 'read' },
          isDeleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: '$senderId',
          unreadCount: { $sum: 1 }
        }
      }
    ]);

    const totalUnread = unreadCounts.reduce((acc, curr) => acc + curr.unreadCount, 0);

    res.status(200).json({
      success: true,
      totalUnread,
      bySender: unreadCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving unread message counts',
      error: error.message
    });
  }
};

