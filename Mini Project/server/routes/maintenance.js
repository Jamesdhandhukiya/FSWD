const express = require('express');
const { body, validationResult } = require('express-validator');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all maintenance requests
// @route   GET /api/maintenance
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({ owner: req.user.id })
      .populate('property', 'name address')
      .populate('tenant', 'firstName lastName email')
      .sort({ requestedDate: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting maintenance requests'
    });
  }
});

// @desc    Get single maintenance request
// @route   GET /api/maintenance/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await MaintenanceRequest.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('property', 'name address')
      .populate('tenant', 'firstName lastName email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting maintenance request'
    });
  }
});

// @desc    Create new maintenance request
// @route   POST /api/maintenance
// @access  Private
router.post('/', [
  protect,
  body('property').isMongoId().withMessage('Valid property ID is required'),
  body('tenant').optional().isMongoId().withMessage('Valid tenant ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify property and tenant belong to user
    const property = await Property.findOne({
      _id: req.body.property,
      owner: req.user.id
    });

    const tenant = await Tenant.findOne({
      _id: req.body.tenant,
      owner: req.user.id
    });

    if (!property || !tenant) {
      return res.status(400).json({
        success: false,
        message: 'Property or tenant not found or does not belong to you'
      });
    }

    const requestData = {
      ...req.body,
      owner: req.user.id
    };

    const request = await MaintenanceRequest.create(requestData);

    res.status(201).json({
      success: true,
      message: 'Maintenance request created successfully',
      data: request
    });
  } catch (error) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating maintenance request'
    });
  }
});

// @desc    Update maintenance request
// @route   PUT /api/maintenance/:id
// @access  Private
router.put('/:id', [
  protect,
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'cancelled']).withMessage('Invalid status'),
  body('category').optional().isIn(['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let request = await MaintenanceRequest.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    // If status is being changed to resolved, set completed date
    if (req.body.status === 'resolved' && request.status !== 'resolved') {
      req.body.completedDate = new Date();
    }

    request = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('property', 'name address')
     .populate('tenant', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Maintenance request updated successfully',
      data: request
    });
  } catch (error) {
    console.error('Update maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating maintenance request'
    });
  }
});

// @desc    Update maintenance request status
// @route   PATCH /api/maintenance/:id/status
// @access  Private
router.patch('/:id/status', [
  protect,
  body('status').isIn(['open', 'in_progress', 'resolved', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const request = await MaintenanceRequest.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status: req.body.status,
        ...(req.body.status === 'resolved' && { completedDate: new Date() })
      },
      { new: true }
    ).populate('property', 'name address')
     .populate('tenant', 'firstName lastName email');

    res.json({
      success: true,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Update maintenance request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating maintenance request status'
    });
  }
});

// @desc    Delete maintenance request
// @route   DELETE /api/maintenance/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const request = await MaintenanceRequest.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    await MaintenanceRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Maintenance request deleted successfully'
    });
  } catch (error) {
    console.error('Delete maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting maintenance request'
    });
  }
});

// @desc    Get maintenance statistics
// @route   GET /api/maintenance/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await MaintenanceRequest.countDocuments({ owner: req.user.id });
    const open = await MaintenanceRequest.countDocuments({ 
      owner: req.user.id, 
      status: 'open' 
    });
    const inProgress = await MaintenanceRequest.countDocuments({ 
      owner: req.user.id, 
      status: 'in_progress' 
    });
    const resolved = await MaintenanceRequest.countDocuments({ 
      owner: req.user.id, 
      status: 'resolved' 
    });

    res.json({
      success: true,
      data: {
        total,
        open,
        inProgress,
        resolved
      }
    });
  } catch (error) {
    console.error('Get maintenance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting maintenance statistics'
    });
  }
});

module.exports = router;
