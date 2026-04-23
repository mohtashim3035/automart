const express = require('express');
const router  = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  updateUser,
  deleteUser,
  seedAdmin,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/register',    register);
router.post('/login',       login);
router.get('/profile',      protect, getProfile);
router.put('/profile',      protect, updateProfile);
router.get('/',             protect, adminOnly, getAllUsers);
router.patch('/:id',        protect, adminOnly, updateUser);
router.delete('/:id',       protect, adminOnly, deleteUser);
router.post('/seed-admin',  seedAdmin);

module.exports = router;