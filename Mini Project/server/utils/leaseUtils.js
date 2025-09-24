const Tenant = require('../models/Tenant');
const Property = require('../models/Property');

// Helper function to check and update expired leases
const checkAndUpdateExpiredLeases = async (ownerId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    // Only update tenants where lease has ended AND lease is marked as complete
    const expiredTenants = await Tenant.find({
      owner: ownerId,
      status: 'active',
      leaseEndDate: { $lt: today },
      leaseComplete: true
    });

    if (expiredTenants.length > 0) {
      const tenantIds = expiredTenants.map(tenant => tenant._id);
      
      // Update expired tenants to inactive status
      await Tenant.updateMany(
        { _id: { $in: tenantIds } },
        { status: 'inactive' }
      );

      // Update associated properties to available status
      const propertyIds = expiredTenants.map(tenant => tenant.property);
      await Property.updateMany(
        { _id: { $in: propertyIds } },
        { 
          status: 'available',
          tenant: null 
        }
      );

      console.log(`Updated ${expiredTenants.length} completed expired leases to inactive status`);
    }
  } catch (error) {
    console.error('Error checking expired leases:', error);
  }
};

module.exports = {
  checkAndUpdateExpiredLeases
};
