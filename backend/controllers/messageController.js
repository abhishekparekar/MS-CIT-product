const Message = require('../models/Message');

// @desc    Get messages for user / tenant
// @route   GET /api/messages
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'franchise' && req.user.tenant) {
      query.$or = [
        { tenant: req.user.tenant._id },
        { recipientRole: 'all_franchises' },
        { recipient: req.user._id }
      ];
    } else if (req.user.role === 'student') {
      query.$or = [
        { recipient: req.user._id },
        { recipientRole: 'all_students' }
      ];
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message / notice
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { subject, message, recipientId, recipientRole, tenantId } = req.body;

    const newMsg = await Message.create({
      sender: req.user._id,
      senderRole: req.user.role,
      senderName: req.user.name,
      recipient: recipientId,
      recipientRole: recipientRole || 'superadmin',
      tenant: tenantId || (req.user.tenant ? req.user.tenant._id : null),
      subject,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: newMsg
    });
  } catch (error) {
    next(error);
  }
};
