require('dotenv').config();
const bcryptjs = require('bcryptjs');
const connectDB = require('../config/connectDB');
const UserModel = require('../models/UserModel');

const requiredEnv = [
  'SUPERUSER_NAME',
  'SUPERUSER_EMAIL',
  'SUPERUSER_PASSWORD',
  'SUPERUSER_PUBLIC_KEY',
  'SUPERUSER_ENCRYPTED_PRIVATE_KEY',
];

const getMissingEnv = () => requiredEnv.filter((key) => !process.env[key]);

async function createOrPromoteSuperUser() {
  const missingEnv = getMissingEnv();
  if (missingEnv.length > 0) {
    throw new Error(`Missing environment variables: ${missingEnv.join(', ')}`);
  }

  await connectDB();

  const email = process.env.SUPERUSER_EMAIL.toLowerCase().trim();
  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    existingUser.name = process.env.SUPERUSER_NAME;
    existingUser.role = 'super_admin';
    existingUser.commandLevel = existingUser.commandLevel || 'Strategic';
    existingUser.unit = existingUser.unit || 'Command';
    existingUser.department = existingUser.department || 'Administration';
    existingUser.publicKey = process.env.SUPERUSER_PUBLIC_KEY;
    existingUser.encryptedPrivateKey = process.env.SUPERUSER_ENCRYPTED_PRIVATE_KEY;

    const salt = await bcryptjs.genSalt(10);
    existingUser.password = await bcryptjs.hash(process.env.SUPERUSER_PASSWORD, salt);

    await existingUser.save();
    console.log(`Promoted existing user to super_admin: ${email}`);
    return;
  }

  const salt = await bcryptjs.genSalt(10);
  const hashPassword = await bcryptjs.hash(process.env.SUPERUSER_PASSWORD, salt);

  await UserModel.create({
    name: process.env.SUPERUSER_NAME,
    email,
    password: hashPassword,
    profile_pic: '',
    publicKey: process.env.SUPERUSER_PUBLIC_KEY,
    encryptedPrivateKey: process.env.SUPERUSER_ENCRYPTED_PRIVATE_KEY,
    isMfaActive: false,
    role: 'super_admin',
    commandLevel: 'Strategic',
    unit: 'Command',
    department: 'Administration',
  });

  console.log(`Created super_admin user: ${email}`);
}

createOrPromoteSuperUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to create super user:', error.message || error);
    process.exit(1);
  });
