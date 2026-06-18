const User = require('../models/UserModel');

const searchDirectory = async ({ unit, department, role, name }) => {
  const filter = {};

  if (unit) filter.unit = unit;
  if (department) filter.department = department;
  if (role) filter.role = role;
  if (name) filter.name = { $regex: name, $options: 'i' };

  return User.find(filter).select('name role unit department availabilityStatus email profile_pic publicKey');
};

module.exports = {
  searchDirectory,
};
