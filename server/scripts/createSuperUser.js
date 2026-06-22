require('dotenv').config();
const bcryptjs = require('bcryptjs');
const connectDB = require('../config/connectDB');
const UserModel = require('../models/UserModel');

const DEFAULT_SUPERUSER = {
  name: 'CommandLink Super Admin',
  email: 'superadmin@commandlink.local',
  password: 'ChangeMeFirst!23',
  publicKey: 'local-bootstrap-public-key',
  encryptedPrivateKey: 'local-bootstrap-encrypted-private-key',
};

const getBootstrapConfig = () => ({
  name: process.env.SUPERUSER_NAME || DEFAULT_SUPERUSER.name,
  email: (process.env.SUPERUSER_EMAIL || DEFAULT_SUPERUSER.email).toLowerCase().trim(),
  password: process.env.SUPERUSER_PASSWORD || DEFAULT_SUPERUSER.password,
  publicKey: process.env.SUPERUSER_PUBLIC_KEY || DEFAULT_SUPERUSER.publicKey,
  encryptedPrivateKey: process.env.SUPERUSER_ENCRYPTED_PRIVATE_KEY || DEFAULT_SUPERUSER.encryptedPrivateKey,
});

async function createOrPromoteSuperUser() {
  await connectDB();

  const bootstrap = getBootstrapConfig();
  const existingUser = await UserModel.findOne({ email: bootstrap.email });
  const salt = await bcryptjs.genSalt(10);
  const hashPassword = await bcryptjs.hash(bootstrap.password, salt);

  const superAdminPayload = {
    name: bootstrap.name,
    email: bootstrap.email,
    password: hashPassword,
    profile_pic: '',
    publicKey: bootstrap.publicKey,
    encryptedPrivateKey: bootstrap.encryptedPrivateKey,
    isMfaActive: false,
    role: 'super_admin',
    commandLevel: 'Strategic',
    unit: 'Command',
    department: 'Administration',
    availabilityStatus: 'offline',
  };

  if (existingUser) {
    Object.assign(existingUser, superAdminPayload);
    await existingUser.save();
    console.log(`Promoted existing user to super_admin: ${bootstrap.email}`);
  } else {
    await UserModel.create(superAdminPayload);
    console.log(`Created super_admin user: ${bootstrap.email}`);
  }

  console.log('Super admin login:');
  console.log(`  Email: ${bootstrap.email}`);
  console.log(`  Password: ${bootstrap.password}`);
  console.log('  Role: super_admin (can create and manage other admins)');
}

createOrPromoteSuperUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to create super user:', error.message || error);
    process.exit(1);
  });
