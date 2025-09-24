const express = require('express');
const { body, validationResult } = require('express-validator');
const RentPayment = require('../models/RentPayment');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all rent payments
// @route   GET /api/rent-payments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const payments = await RentPayment.find({ owner: req.user.id })
      .populate('tenant', 'firstName lastName email')
      .populate('property', 'name address')
      .sort({ dueDate: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Get rent payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting rent payments'
    });
  }
});

// @desc    Get single rent payment
// @route   GET /api/rent-payments/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await RentPayment.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('tenant', 'firstName lastName email')
      .populate('property', 'name address');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Rent payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get rent payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting rent payment'
    });
  }
});

// @desc    Create new rent payment
// @route   POST /api/rent-payments
// @access  Private
router.post('/', [
  protect,
  body('tenant').isMongoId().withMessage('Valid tenant ID is required'),
  body('property').isMongoId().withMessage('Valid property ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a non-negative number'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2020 }).withMessage('Year must be 2020 or later')
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

    // Verify tenant and property belong to user
    const tenant = await Tenant.findOne({
      _id: req.body.tenant,
      owner: req.user.id
    });

    const property = await Property.findOne({
      _id: req.body.property,
      owner: req.user.id
    });

    if (!tenant || !property) {
      return res.status(400).json({
        success: false,
        message: 'Tenant or property not found or does not belong to you'
      });
    }

    const paymentData = {
      ...req.body,
      owner: req.user.id
    };

    const payment = await RentPayment.create(paymentData);

    res.status(201).json({
      success: true,
      message: 'Rent payment created successfully',
      data: payment
    });
  } catch (error) {
    console.error('Create rent payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating rent payment'
    });
  }
});

// @desc    Mark payment as paid
// @route   PUT /api/rent-payments/:id/mark-paid
// @access  Private
router.put('/:id/mark-paid', [
  protect,
  body('paymentMethod').optional().isIn(['cash', 'check', 'bank_transfer', 'online', 'other']),
  body('reference').optional().trim(),
  body('notes').optional().trim()
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

    let payment = await RentPayment.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Rent payment not found'
      });
    }

    const updateData = {
      paidDate: new Date(),
      status: 'paid',
      ...req.body
    };

    payment = await RentPayment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('tenant', 'firstName lastName email')
     .populate('property', 'name address');

    res.json({
      success: true,
      message: 'Payment marked as paid successfully',
      data: payment
    });
  } catch (error) {
    console.error('Mark payment paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking payment as paid'
    });
  }
});

// @desc    Update rent payment
// @route   PUT /api/rent-payments/:id
// @access  Private
router.put('/:id', [
  protect,
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a non-negative number'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
  body('lateFee').optional().isFloat({ min: 0 }).withMessage('Late fee must be a non-negative number')
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

    let payment = await RentPayment.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Rent payment not found'
      });
    }

    payment = await RentPayment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('tenant', 'firstName lastName email')
     .populate('property', 'name address');

    res.json({
      success: true,
      message: 'Rent payment updated successfully',
      data: payment
    });
  } catch (error) {
    console.error('Update rent payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating rent payment'
    });
  }
});

// @desc    Delete rent payment
// @route   DELETE /api/rent-payments/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const payment = await RentPayment.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Rent payment not found'
      });
    }

    await RentPayment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Rent payment deleted successfully'
    });
  } catch (error) {
    console.error('Delete rent payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting rent payment'
    });
  }
});

module.exports = router;
