const express = require('express');
const { body, validationResult } = require('express-validator');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');
const { checkAndUpdateExpiredLeases } = require('../utils/leaseUtils');

const router = express.Router();

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Check and update expired leases before fetching tenants
    await checkAndUpdateExpiredLeases(req.user.id);
    
    const tenants = await Tenant.find({ owner: req.user.id })
      .populate('property', 'name address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tenants.length,
      data: tenants
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting tenants'
    });
  }
});

// @desc    Get single tenant
// @route   GET /api/tenants/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // Check and update expired leases before fetching tenant
    await checkAndUpdateExpiredLeases(req.user.id);
    
    const tenant = await Tenant.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('property', 'name address');

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting tenant'
    });
  }
});

// @desc    Create new tenant
// @route   POST /api/tenants
// @access  Private
router.post('/', [
  protect,
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('property').isMongoId().withMessage('Valid property ID is required'),
  body('leaseStartDate').isISO8601().withMessage('Valid lease start date is required'),
  body('leaseEndDate').isISO8601().withMessage('Valid lease end date is required'),
  body('rentAmount').isFloat({ min: 0 }).withMessage('Rent amount must be a non-negative number')
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

    // Verify property belongs to user
    const property = await Property.findOne({
      _id: req.body.property,
      owner: req.user.id
    });

    if (!property) {
      return res.status(400).json({
        success: false,
        message: 'Property not found or does not belong to you'
      });
    }

    const tenantData = {
      ...req.body,
      owner: req.user.id
    };

    const tenant = await Tenant.create(tenantData);
    console.log('Created tenant:', tenant);

    // Update property status to occupied and assign tenant
    const updatedProperty = await Property.findByIdAndUpdate(
      req.body.property,
      { 
        status: 'occupied',
        tenant: tenant._id
      },
      { new: true }
    );
    console.log('Updated property:', updatedProperty);

    res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      data: tenant
    });
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating tenant'
    });
  }
});

// @desc    Update tenant
// @route   PUT /api/tenants/:id
// @access  Private
router.put('/:id', [
  protect,
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
  body('rentAmount').optional().isFloat({ min: 0 }).withMessage('Rent amount must be a non-negative number')
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

    let tenant = await Tenant.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('property', 'name address');

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: tenant
    });
  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating tenant'
    });
  }
});

// @desc    Delete tenant
// @route   DELETE /api/tenants/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Update property status back to available and remove tenant reference
    await Property.findByIdAndUpdate(
      tenant.property,
      { 
        status: 'available',
        tenant: null
      }
    );

    await Tenant.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting tenant'
    });
  }
});

// @desc    Mark lease as complete
// @route   PATCH /api/tenants/:id/lease-complete
// @access  Private
router.patch('/:id/lease-complete', protect, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { leaseComplete: true },
      { new: true }
    ).populate('property', 'name address');

    res.json({
      success: true,
      data: updatedTenant,
      message: 'Lease marked as complete'
    });
  } catch (error) {
    console.error('Mark lease complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking lease as complete'
    });
  }
});

// @desc    Manually check and update expired leases
// @route   POST /api/tenants/check-expired-leases
// @access  Private
router.post('/check-expired-leases', protect, async (req, res) => {
  try {
    await checkAndUpdateExpiredLeases(req.user.id);
    
    res.json({
      success: true,
      message: 'Expired lease check completed successfully'
    });
  } catch (error) {
    console.error('Manual expired lease check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking expired leases'
    });
  }
});

module.exports = router;
