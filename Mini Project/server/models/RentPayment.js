const mongoose = require('mongoose');

const rentPaymentSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant is required']
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  paidDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'late', 'overdue'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'check', 'bank_transfer', 'online', 'other'],
    default: 'online'
  },
  reference: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  lateFee: {
    type: Number,
    default: 0,
    min: [0, 'Late fee cannot be negative']
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2020
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for total amount (rent + late fee)
rentPaymentSchema.virtual('totalAmount').get(function() {
  return this.amount + this.lateFee;
});

// Virtual for days overdue
rentPaymentSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'overdue' || this.status === 'late') {
    const today = new Date();
    const diffTime = today - this.dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
  return 0;
});

// Pre-save middleware to update status based on dates
rentPaymentSchema.pre('save', function(next) {
  if (this.isModified('paidDate') || this.isModified('dueDate')) {
    const today = new Date();
    
    if (this.paidDate) {
      this.status = 'paid';
    } else if (this.dueDate < today) {
      this.status = 'overdue';
    } else {
      this.status = 'pending';
    }
  }
  next();
});

module.exports = mongoose.model('RentPayment', rentPaymentSchema);
