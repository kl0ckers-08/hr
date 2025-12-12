require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('../models/User');

async function getUsers() {
    await mongoose.connect(process.env.MONGODB_URI);

    const dean = await User.findOne({ role: 'dean' }).select('email name');
    const lecturer = await User.findOne({ role: 'lecturer' }).select('email name');
    const adminstaff = await User.findOne({ role: 'adminstaff' }).select('email name');

    const output = `
=== CURRENT USER CREDENTIALS ===
Dean: ${dean?.email} | ${dean?.name}
Lecturer: ${lecturer?.email} | ${lecturer?.name}
Admin Staff: ${adminstaff?.email} | ${adminstaff?.name}

Passwords:
  Dean: Dean123!
  Lecturer: Lecturer123!
  Admin Staff: AdminStaff123!
`;

    fs.writeFileSync('credentials.txt', output);
    console.log('Credentials saved to credentials.txt');
    console.log(output);

    await mongoose.disconnect();
}

getUsers();
