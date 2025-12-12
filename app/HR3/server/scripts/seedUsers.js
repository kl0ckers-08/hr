const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars from server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Schedule = require('../models/Schedule');
const Settings = require('../models/Settings');

// ============================================
// CONFIGURATION
// ============================================
// Parse command line arguments
const args = process.argv.slice(2);
const isStressTest = args.includes('--stress') || args.includes('-s');

const CONFIG = {
    // Stress test configuration (balanced for performance)
    STRESS: {
        NUM_DEPARTMENTS: 8,
        NUM_LECTURERS: 30,
        NUM_ADMIN_STAFF: 15,
        NUM_DEANS: 5,
        ATTENDANCE_DAYS: 30,
        LEAVES_PER_USER: 3,
        PAYROLL_PERIODS: 6,
        BATCH_SIZE: 100
    },
    // Demo configuration (simple seed)
    DEMO: {
        NUM_DEPARTMENTS: 4,
        NUM_LECTURERS: 1,
        NUM_ADMIN_STAFF: 1,
        NUM_DEANS: 1,
        ATTENDANCE_DAYS: 0,
        LEAVES_PER_USER: 0,
        PAYROLL_PERIODS: 0,
        BATCH_SIZE: 100
    }
};

const activeConfig = isStressTest ? CONFIG.STRESS : CONFIG.DEMO;

// Default settings
const defaultSettings = [
    { key: 'company_name', value: 'HR3 Management System', category: 'general', description: 'Organization name' },
    { key: 'work_hours_start', value: '08:00', category: 'attendance', description: 'Work start time' },
    { key: 'work_hours_end', value: '17:00', category: 'attendance', description: 'Work end time' },
    { key: 'late_threshold_minutes', value: 15, category: 'attendance', description: 'Minutes after start time to be marked late' },
    { key: 'overtime_rate', value: 1.25, category: 'payroll', description: 'Overtime pay multiplier' },
    { key: 'sss_rate', value: 0.045, category: 'payroll', description: 'SSS contribution rate' },
    { key: 'philhealth_rate', value: 0.02, category: 'payroll', description: 'PhilHealth contribution rate' },
    { key: 'pagibig_contribution', value: 100, category: 'payroll', description: 'Fixed Pag-IBIG contribution' },
    { key: 'tax_rate', value: 0.1, category: 'payroll', description: 'Withholding tax rate' },
    { key: 'vacation_leave_days', value: 15, category: 'leave', description: 'Annual vacation leave allowance' },
    { key: 'sick_leave_days', value: 15, category: 'leave', description: 'Annual sick leave allowance' }
];

// Demo users (for simple seed)
const demoUsers = [
    {
        name: 'Super Admin',
        email: 'superadmin@hr3.com',
        password: 'SuperAdmin123!',
        role: 'superadmin',
        department: 'Administration'
    },
    {
        name: 'HR Admin',
        email: 'hradmin@hr3.com',
        password: 'HRAdmin123!',
        role: 'hradmin',
        department: 'Human Resources'
    },
    {
        name: 'Dean Johnson',
        email: 'dean@hr3.com',
        password: 'Dean123!',
        role: 'dean',
        department: 'Computer Science'
    },
    {
        name: 'Jane Smith',
        email: 'jane@hr3.com',
        password: 'Lecturer123!',
        role: 'lecturer',
        department: 'Computer Science'
    },
    {
        name: 'Mary Johnson',
        email: 'mary@hr3.com',
        password: 'AdminStaff123!',
        role: 'adminstaff',
        department: 'Registrar'
    }
];

// Demo departments
const demoDepartments = [
    {
        name: 'Computer Science',
        code: 'CS',
        description: 'Department of Computer Science and Information Technology',
        status: 'active'
    },
    {
        name: 'Human Resources',
        code: 'HR',
        description: 'Human Resources Department',
        status: 'active'
    },
    {
        name: 'Administration',
        code: 'ADMIN',
        description: 'Administrative and Management Department',
        status: 'active'
    },
    {
        name: 'Registrar',
        code: 'REG',
        description: 'Student Records and Registration Office',
        status: 'active'
    }
];

// Stress test data pools
const firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'William', 'Jennifer',
    'James', 'Maria', 'Richard', 'Patricia', 'Joseph', 'Linda', 'Thomas', 'Barbara', 'Charles', 'Elizabeth',
    'Daniel', 'Susan', 'Matthew', 'Jessica', 'Anthony', 'Karen', 'Mark', 'Nancy', 'Donald', 'Betty',
    'Steven', 'Margaret', 'Paul', 'Sandra', 'Andrew', 'Ashley', 'Joshua', 'Dorothy', 'Kenneth', 'Kimberly',
    'Kevin', 'Donna', 'Brian', 'Michelle', 'George', 'Carol', 'Edward', 'Amanda', 'Ronald', 'Melissa',
    'Timothy', 'Deborah', 'Jason', 'Stephanie', 'Jeffrey', 'Rebecca', 'Ryan', 'Sharon', 'Jacob', 'Laura',
    'Gary', 'Cynthia', 'Nicholas', 'Kathleen', 'Eric', 'Amy', 'Jonathan', 'Angela', 'Stephen', 'Shirley',
    'Larry', 'Anna', 'Justin', 'Brenda', 'Scott', 'Pamela', 'Brandon', 'Emma', 'Benjamin', 'Nicole',
    'Samuel', 'Helen', 'Raymond', 'Samantha', 'Gregory', 'Katherine', 'Frank', 'Christine', 'Alexander', 'Debra',
    'Patrick', 'Rachel', 'Jack', 'Carolyn', 'Dennis', 'Janet', 'Jerry', 'Catherine', 'Tyler', 'Maria'
];

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
    'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
    'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
    'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson'
];

const departmentNames = [
    { name: 'Computer Science', code: 'CS' },
    { name: 'Information Technology', code: 'IT' },
    { name: 'Software Engineering', code: 'SE' },
    { name: 'Data Science', code: 'DS' },
    { name: 'Cybersecurity', code: 'CYB' },
    { name: 'Business Administration', code: 'BA' },
    { name: 'Accounting', code: 'ACC' },
    { name: 'Human Resources', code: 'HR' },
    { name: 'Marketing', code: 'MKT' },
    { name: 'Finance', code: 'FIN' },
    { name: 'Operations', code: 'OPS' },
    { name: 'Research & Development', code: 'RND' },
    { name: 'Quality Assurance', code: 'QA' },
    { name: 'Customer Service', code: 'CUS' },
    { name: 'Legal', code: 'LEG' }
];

const leaveTypes = ['vacation', 'sick', 'personal', 'emergency', 'maternity', 'paternity'];
const attendanceStatuses = ['present', 'present', 'present', 'present', 'late', 'late', 'absent'];

// Helper functions
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateEmail = (firstName, lastName, index) => {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@hr3.com`;
};

// Batch insert helper
const batchInsert = async (Model, records, batchSize = activeConfig.BATCH_SIZE || 500) => {
    let inserted = 0;
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        try {
            await Model.insertMany(batch, { ordered: false });
            inserted += batch.length;
        } catch (err) {
            if (err.code === 11000) {
                inserted += err.insertedDocs?.length || 0;
            } else {
                throw err;
            }
        }
    }
    return inserted;
};

const generateAttendanceForUser = (userId, days) => {
    const records = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const status = randomElement(attendanceStatuses);
        let timeIn = null;
        let timeOut = null;
        let hoursWorked = 0;
        let overtime = 0;

        if (status !== 'absent') {
            const inHour = status === 'late' ? randomInt(9, 10) : randomInt(7, 8);
            const inMinute = randomInt(0, 59);
            timeIn = new Date(date);
            timeIn.setHours(inHour, inMinute, 0, 0);

            const outHour = randomInt(17, 20);
            const outMinute = randomInt(0, 59);
            timeOut = new Date(date);
            timeOut.setHours(outHour, outMinute, 0, 0);

            hoursWorked = (timeOut - timeIn) / (1000 * 60 * 60);
            overtime = hoursWorked > 8 ? hoursWorked - 8 : 0;
        }

        records.push({
            userId, date, timeIn, timeOut, status,
            hoursWorked: Math.round(hoursWorked * 100) / 100,
            overtime: Math.round(overtime * 100) / 100,
            notes: ''
        });
    }
    return records;
};

const generateLeavesForUser = (userId, count) => {
    const records = [];
    const today = new Date();
    const statuses = ['pending', 'approved', 'approved', 'rejected'];

    for (let i = 0; i < count; i++) {
        const startOffset = randomInt(1, 180);
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - startOffset);

        const duration = randomInt(1, 5);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration - 1);

        records.push({
            userId,
            type: randomElement(leaveTypes),
            startDate, endDate,
            totalDays: duration,
            reason: `Leave request for ${randomElement(['personal matters', 'family event', 'medical appointment', 'vacation', 'rest and recovery'])}`,
            status: randomElement(statuses),
            remarks: ''
        });
    }
    return records;
};

const generatePayrollForUser = (userId, periods, role = 'adminstaff') => {
    const records = [];
    const today = new Date();

    // Salary ranges based on role
    const salaryRanges = {
        dean: { min: 45000, max: 65000 },
        lecturer: { min: 30000, max: 45000 },
        adminstaff: { min: 20000, max: 30000 }
    };

    const range = salaryRanges[role] || salaryRanges.adminstaff;
    const basicSalary = randomInt(range.min, range.max);
    const statuses = ['pending', 'processed', 'paid', 'paid'];

    for (let i = 0; i < periods; i++) {
        const periodDate = new Date(today);
        periodDate.setMonth(periodDate.getMonth() - Math.floor(i / 2));

        const periodStart = i % 2 === 0 ? 1 : 16;
        const periodEnd = i % 2 === 0 ? 15 : new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0).getDate();
        const period = `${periodDate.toLocaleString('default', { month: 'long' })} ${periodStart}-${periodEnd}, ${periodDate.getFullYear()}`;

        const overtimePay = randomInt(0, 5000);
        const allowances = role === 'dean' ? randomInt(3000, 8000) : randomInt(0, 3000);
        const grossPay = basicSalary + overtimePay + allowances;

        const deductions = {
            sss: Math.round(basicSalary * 0.045),
            philhealth: Math.round(basicSalary * 0.02),
            pagibig: 100,
            tax: Math.round(basicSalary * 0.1),
            tardiness: randomInt(0, 500),
            other: 0
        };

        const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

        records.push({
            userId, period, basicSalary, overtimePay, allowances, grossPay,
            deductions, totalDeductions,
            netPay: grossPay - totalDeductions,
            status: randomElement(statuses)
        });
    }
    return records;
};

const generateScheduleForUser = (userId) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const shifts = [
        { name: 'Morning Shift', start: '08:00', end: '17:00' },
        { name: 'Regular Shift', start: '09:00', end: '18:00' },
        { name: 'Flexible Shift', start: '07:00', end: '16:00' }
    ];
    const selectedShift = randomElement(shifts);

    return days.map(day => ({
        userId,
        shiftName: selectedShift.name,
        dayOfWeek: day,
        startTime: selectedShift.start,
        endTime: selectedShift.end,
        isActive: true
    }));
};

// ============================================
// SIMPLE SEED (Demo Mode)
// ============================================
const seedDemo = async () => {
    try {
        console.log('🌱 Starting demo seed...\n');

        // Clear existing data
        await User.deleteMany({});
        await Department.deleteMany({});
        await Settings.deleteMany({});
        console.log('Existing data cleared');

        // Seed departments
        const createdDepts = await Department.create(demoDepartments);
        console.log('Departments seeded:');
        createdDepts.forEach(d => console.log(`  - ${d.name} (${d.code})`));

        // Seed users
        const createdUsers = await User.create(demoUsers);
        console.log('Users seeded:');
        createdUsers.forEach(u => console.log(`  - ${u.name} (${u.email}) - ${u.role}`));

        // Set department heads
        const deanUser = createdUsers.find(u => u.role === 'dean');
        const csDept = createdDepts.find(d => d.code === 'CS');
        if (deanUser && csDept) {
            csDept.headId = deanUser._id;
            await csDept.save();
            console.log(`Set ${deanUser.name} as head of ${csDept.name}`);
        }

        // Seed settings
        await Settings.create(defaultSettings);
        console.log('Default settings seeded');

        console.log('\n✅ Demo database seeded successfully!');
        console.log('\n🔐 Login Credentials:');
        console.log('   superadmin@hr3.com / SuperAdmin123!');
        console.log('   hradmin@hr3.com / HRAdmin123!');
        console.log('   dean@hr3.com / Dean123!');
        console.log('   jane@hr3.com / Lecturer123!');
        console.log('   mary@hr3.com / AdminStaff123!\n');
    } catch (error) {
        console.error('Error seeding data:', error.message);
        throw error;
    }
};

// ============================================
// STRESS TEST SEED
// ============================================
const seedStressTest = async () => {
    try {
        console.log('🚀 Starting stress test data generation...\n');
        console.log('Configuration:');
        console.log(`  Departments: ${activeConfig.NUM_DEPARTMENTS} | Deans: ${activeConfig.NUM_DEANS}`);
        console.log(`  Lecturers: ${activeConfig.NUM_LECTURERS} | Admin Staff: ${activeConfig.NUM_ADMIN_STAFF}`);
        console.log(`  Attendance: ${activeConfig.ATTENDANCE_DAYS} days | Leaves: ${activeConfig.LEAVES_PER_USER}/user`);
        console.log(`  Payroll: ${activeConfig.PAYROLL_PERIODS} periods\n`);

        // Clear all existing data
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Department.deleteMany({}),
            Attendance.deleteMany({}),
            Leave.deleteMany({}),
            Payroll.deleteMany({}),
            Schedule.deleteMany({}),
            Settings.deleteMany({})
        ]);
        console.log('   ✓ Data cleared\n');

        // Seed settings
        await Settings.create(defaultSettings);
        console.log('⚙️  Settings seeded\n');

        // Create admin users
        console.log('👤 Creating admin users...');
        const superAdmin = await User.create({
            name: 'Super Admin',
            email: 'superadmin@hr3.com',
            password: 'SuperAdmin123!',
            role: 'superadmin',
            department: 'Administration'
        });
        const hrAdmin = await User.create({
            name: 'HR Admin',
            email: 'hradmin@hr3.com',
            password: 'HRAdmin123!',
            role: 'hradmin',
            department: 'Human Resources'
        });
        console.log('   ✓ Super Admin & HR Admin created\n');

        // Create departments
        console.log('🏢 Creating departments...');
        const deptData = departmentNames.slice(0, activeConfig.NUM_DEPARTMENTS).map(d => ({
            name: d.name,
            code: d.code,
            description: `${d.name} Department`,
            status: 'active'
        }));
        const departments = await Department.insertMany(deptData);
        console.log(`   ✓ ${departments.length} departments created\n`);

        // Create deans
        console.log('👔 Creating deans...');
        const deans = [];
        for (let i = 0; i < activeConfig.NUM_DEANS; i++) {
            const firstName = randomElement(firstNames);
            const lastName = randomElement(lastNames);
            const dept = departments[i % departments.length];

            const dean = await User.create({
                name: `Dr. ${firstName} ${lastName}`,
                email: generateEmail(firstName, lastName, i),
                password: 'Dean123!',
                role: 'dean',
                department: dept.name
            });
            deans.push(dean);
            dept.headId = dean._id;
            await dept.save();
        }
        console.log(`   ✓ ${deans.length} deans created\n`);

        // Create lecturers
        console.log('👨‍🏫 Creating lecturers...');
        const lecturers = [];
        for (let i = 0; i < activeConfig.NUM_LECTURERS; i++) {
            const firstName = randomElement(firstNames);
            const lastName = randomElement(lastNames);
            const dept = randomElement(departments);

            const lecturer = await User.create({
                name: `${firstName} ${lastName}`,
                email: generateEmail(firstName, lastName, i + 1000),
                password: 'Lecturer123!',
                role: 'lecturer',
                department: dept.name
            });
            lecturers.push(lecturer);
            if ((i + 1) % 50 === 0) process.stdout.write(`\r   Progress: ${i + 1}/${activeConfig.NUM_LECTURERS}`);
        }
        console.log(`\n   ✓ ${lecturers.length} lecturers created\n`);

        // Create admin staff
        console.log('👩‍💼 Creating admin staff...');
        const adminStaff = [];
        for (let i = 0; i < activeConfig.NUM_ADMIN_STAFF; i++) {
            const firstName = randomElement(firstNames);
            const lastName = randomElement(lastNames);
            const dept = randomElement(departments);

            const staff = await User.create({
                name: `${firstName} ${lastName}`,
                email: generateEmail(firstName, lastName, i + 2000),
                password: 'AdminStaff123!',
                role: 'adminstaff',
                department: dept.name
            });
            adminStaff.push(staff);
            if ((i + 1) % 25 === 0) process.stdout.write(`\r   Progress: ${i + 1}/${activeConfig.NUM_ADMIN_STAFF}`);
        }
        console.log(`\n   ✓ ${adminStaff.length} admin staff created\n`);

        const allEmployees = [...deans, ...lecturers, ...adminStaff];
        console.log(`📊 Total employees: ${allEmployees.length}\n`);

        // Generate attendance
        console.log('📅 Generating attendance records...');
        let allAttendance = [];
        for (const emp of allEmployees) {
            allAttendance.push(...generateAttendanceForUser(emp._id, activeConfig.ATTENDANCE_DAYS));
        }
        const attendanceCount = await batchInsert(Attendance, allAttendance);
        console.log(`   ✓ ${attendanceCount} attendance records\n`);

        // Generate leaves
        console.log('🏖️  Generating leave requests...');
        let allLeaves = [];
        for (const emp of allEmployees) {
            allLeaves.push(...generateLeavesForUser(emp._id, activeConfig.LEAVES_PER_USER));
        }
        const leaveCount = await batchInsert(Leave, allLeaves);
        console.log(`   ✓ ${leaveCount} leave requests\n`);

        // Generate payroll
        console.log('💰 Generating payroll records...');
        let allPayroll = [];
        for (const emp of allEmployees) {
            allPayroll.push(...generatePayrollForUser(emp._id, activeConfig.PAYROLL_PERIODS, emp.role));
        }
        const payrollCount = await batchInsert(Payroll, allPayroll);
        console.log(`   ✓ ${payrollCount} payroll records\n`);

        // Generate schedules
        console.log('📆 Generating schedules...');
        let allSchedules = [];
        for (const emp of allEmployees) {
            allSchedules.push(...generateScheduleForUser(emp._id));
        }
        const scheduleCount = await batchInsert(Schedule, allSchedules);
        console.log(`   ✓ ${scheduleCount} schedule records\n`);

        // Summary
        const totalUsers = 2 + allEmployees.length;
        const totalRecords = totalUsers + departments.length + attendanceCount + leaveCount + payrollCount + scheduleCount;

        console.log('='.repeat(50));
        console.log('✅ STRESS TEST DATA GENERATION COMPLETE!');
        console.log('='.repeat(50));
        console.log(`\n📊 Summary:`);
        console.log(`   Users:       ${totalUsers}`);
        console.log(`   Departments: ${departments.length}`);
        console.log(`   Attendance:  ${attendanceCount}`);
        console.log(`   Leaves:      ${leaveCount}`);
        console.log(`   Payroll:     ${payrollCount}`);
        console.log(`   Schedules:   ${scheduleCount}`);
        console.log(`   ─────────────────────`);
        console.log(`   TOTAL:       ${totalRecords}\n`);
        console.log('🔐 Login Credentials:');
        console.log('   superadmin@hr3.com / SuperAdmin123!');
        console.log('   hradmin@hr3.com / HRAdmin123!');
        console.log('   Deans: Dean123! | Lecturers: Lecturer123! | Staff: AdminStaff123!\n');
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        throw error;
    }
};

// ============================================
// MAIN EXECUTION
// ============================================
const seedData = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected\n');

        if (isStressTest) {
            await seedStressTest();
        } else {
            await seedDemo();
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

// Show usage info
console.log('='.repeat(50));
console.log('HR3 Database Seeder');
console.log('='.repeat(50));
console.log(`Mode: ${isStressTest ? 'STRESS TEST' : 'DEMO'}`);
console.log('Usage: node seedUsers.js [--stress | -s]');
console.log('='.repeat(50) + '\n');

seedData();
