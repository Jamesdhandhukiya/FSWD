const cron = require('node-cron');
const { checkAndUpdateExpiredLeases } = require('./leaseUtils');
const User = require('../models/User');

// Schedule job to check for expired leases daily at midnight
const scheduleExpiredLeaseCheck = () => {
  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily expired lease check...');
    
    try {
      // Get all users to check their tenants
      const users = await User.find({});
      
      for (const user of users) {
        await checkAndUpdateExpiredLeases(user._id);
      }
      
      console.log('Daily expired lease check completed');
    } catch (error) {
      console.error('Error in daily expired lease check:', error);
    }
  }, {
    timezone: "UTC"
  });
  
  console.log('Expired lease check scheduled to run daily at midnight UTC');
};

module.exports = {
  scheduleExpiredLeaseCheck
};
