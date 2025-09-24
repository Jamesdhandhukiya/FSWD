require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());               
app.use(express.json());       


app.use('/api/auth', authRoutes);


const authMiddleware = require('./middlewares/auth');
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: `Hello ${req.user.email}, this is protected data.` });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
  console.error('Mongo connection error:', err);
});
