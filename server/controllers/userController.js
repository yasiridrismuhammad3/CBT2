const User = require('../models/User');

// @desc    Get all users with role filter & pagination
// @route   GET /api/users
// @access  Private (Admin / Teacher)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, class: className, search } = req.query;
    let query = {};

    if (role) {
      query.role = role;
    }

    if (className) {
      query.class = className;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { dsNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).populate('assignedSubjects').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create User (Student or Teacher)
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role, class: className, gender, dsNumber, passportUrl, assignedSubjects } = req.body;

    // Check if user already exists
    let existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    if (role === 'student' && dsNumber) {
      const existingDs = await User.findOne({ dsNumber: dsNumber.toUpperCase() });
      if (existingDs) {
        return res.status(400).json({ success: false, message: 'Student with this DS Number already exists' });
      }
    }

    // Auto-generate DS Number if student and not provided
    let finalDsNumber = dsNumber;
    if (role === 'student' && !finalDsNumber) {
      const count = await User.countDocuments({ role: 'student' });
      const year = new Date().getFullYear();
      finalDsNumber = `DS/${year}/${String(count + 1).padStart(3, '0')}`;
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: password || 'Student@123',
      role: role || 'student',
      class: className || '',
      gender: gender || '',
      dsNumber: role === 'student' ? finalDsNumber : undefined,
      passportUrl: passportUrl || '',
      assignedSubjects: assignedSubjects || []
    });

    user.password = undefined;

    res.status(201).json({
      success: true,
      message: `${role.toUpperCase()} created successfully`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update User
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { fullName, email, class: className, gender, dsNumber, passportUrl, assignedSubjects, isActive } = req.body;

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.fullName = fullName || user.fullName;
    user.email = email ? email.toLowerCase() : user.email;
    user.class = className !== undefined ? className : user.class;
    user.gender = gender !== undefined ? gender : user.gender;
    if (user.role === 'student' && dsNumber) user.dsNumber = dsNumber.toUpperCase();
    if (passportUrl !== undefined) user.passportUrl = passportUrl;
    if (assignedSubjects !== undefined) user.assignedSubjects = assignedSubjects;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete User
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset User Password by Admin
// @route   PUT /api/users/:id/reset-password
// @access  Private (Admin)
exports.resetUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Password reset successfully for ${user.fullName}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk Import Students
// @route   POST /api/users/bulk-import
// @access  Private (Admin)
exports.bulkImportStudents = async (req, res, next) => {
  try {
    const { students } = req.body; // Array of { fullName, email, class, gender, dsNumber }
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of students' });
    }

    let createdCount = 0;
    const year = new Date().getFullYear();
    const existingCount = await User.countDocuments({ role: 'student' });

    for (let i = 0; i < students.length; i++) {
      const item = students[i];
      if (!item.fullName || !item.email) continue;

      const ds = item.dsNumber || `DS/${year}/${String(existingCount + createdCount + 1).padStart(3, '0')}`;
      
      const exists = await User.findOne({
        $or: [{ email: item.email.toLowerCase() }, { dsNumber: ds.toUpperCase() }]
      });

      if (!exists) {
        await User.create({
          fullName: item.fullName,
          email: item.email.toLowerCase(),
          dsNumber: ds.toUpperCase(),
          password: item.password || 'Student@123',
          role: 'student',
          class: item.class || 'SS 1A',
          gender: item.gender || 'Male'
        });
        createdCount++;
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${createdCount} students!`
    });
  } catch (error) {
    next(error);
  }
};
