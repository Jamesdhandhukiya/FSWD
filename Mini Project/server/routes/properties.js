const express = require('express');
const { body, validationResult } = require('express-validator');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');
const { checkAndUpdateExpiredLeases } = require('../utils/leaseUtils');

const router = express.Router();

// @desc    Get all properties
// @route   GET /api/properties
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Check and update expired leases before fetching properties
    await checkAndUpdateExpiredLeases(req.user.id);
    
    const properties = await Property.find({ owner: req.user.id })
      .populate('owner', 'firstName lastName email')
      .populate('tenant', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    // Debug: Log properties with tenant info
    console.log('Properties with tenant data:', properties.map(p => ({
      name: p.name,
      status: p.status,
      tenant: p.tenant,
      hasTenant: !!p.tenant
    })));

    // Change currency symbol from dollar to rupees
    const propertiesWithRupees = properties.map(property => ({
      ...property.toObject(),
      currency: '₹'
    }));

    res.json({
      success: true,
      count: properties.length,
      data: propertiesWithRupees
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting properties'
    });
  }
});

// @desc    Get property statistics
// @route   GET /api/properties/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments({ owner: req.user.id });
    const availableProperties = await Property.countDocuments({ 
      owner: req.user.id, 
      status: 'available' 
    });
    const occupiedProperties = await Property.countDocuments({ 
      owner: req.user.id, 
      status: 'occupied' 
    });
    const unavailableProperties = await Property.countDocuments({ 
      owner: req.user.id, 
      status: 'unavailable' 
    });

    res.json({
      success: true,
      data: {
        total: totalProperties,
        available: availableProperties,
        occupied: occupiedProperties,
        unavailable: unavailableProperties
      }
    });
  } catch (error) {
    console.error('Get property stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting property statistics'
    });
  }
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('owner', 'firstName lastName email')
      .populate('tenant', 'firstName lastName email phone');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Change currency symbol from dollar to rupees
    const propertyWithRupees = {
      ...property.toObject(),
      currency: '₹'
    };

    res.json({
      success: true,
      data: propertyWithRupees
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting property'
    });
  }
});

// @desc    Create new property
// @route   POST /api/properties
// @access  Private
router.post('/', [
  protect,
  body('name').trim().notEmpty().withMessage('Property name is required'),
  body('address.street').trim().notEmpty().withMessage('Street address is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.state').trim().notEmpty().withMessage('State is required'),
  body('address.zipCode').trim().notEmpty().withMessage('ZIP code is required'),
  body('type').isIn(['apartment', 'house', 'condo', 'townhouse', 'commercial']).withMessage('Invalid property type'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').isFloat({ min: 0 }).withMessage('Bathrooms must be a non-negative number'),
  body('rentAmount').isFloat({ min: 0 }).withMessage('Rent amount must be a non-negative number'),
  body('squareFeet').optional().isFloat({ min: 0 }).withMessage('Square feet must be a non-negative number'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const propertyData = {
      ...req.body,
      owner: req.user.id
    };

    const property = await Property.create(propertyData);

    // Change currency symbol from dollar to rupees
    const propertyWithRupees = {
      ...property.toObject(),
      currency: '₹'
    };

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: propertyWithRupees
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating property'
    });
  }
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
router.put('/:id', [
  protect,
  body('name').optional().trim().notEmpty().withMessage('Property name cannot be empty'),
  body('address.street').optional().trim().notEmpty().withMessage('Street address cannot be empty'),
  body('address.city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('address.state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('address.zipCode').optional().trim().notEmpty().withMessage('ZIP code cannot be empty'),
  body('type').optional().isIn(['apartment', 'house', 'condo', 'townhouse', 'commercial']).withMessage('Invalid property type'),
  body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').optional().isFloat({ min: 0 }).withMessage('Bathrooms must be a non-negative number'),
  body('rentAmount').optional().isFloat({ min: 0 }).withMessage('Rent amount must be a non-negative number'),
  body('squareFeet').optional().isFloat({ min: 0 }).withMessage('Square feet must be a non-negative number'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let property = await Property.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('tenant', 'firstName lastName email phone');

    console.log('Updated property with tenant:', {
      name: property.name,
      status: property.status,
      tenant: property.tenant
    });

    // Change currency symbol from dollar to rupees
    const propertyWithRupees = {
      ...property.toObject(),
      currency: '₹'
    };

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: propertyWithRupees
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating property'
    });
  }
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting property'
    });
  }
});

module.exports = router;
