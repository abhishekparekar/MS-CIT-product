const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const User = require('./models/User');
const Tenant = require('./models/Tenant');
const Course = require('./models/Course');
const Exam = require('./models/Exam');
const Student = require('./models/Student');
const Gallery = require('./models/Gallery');

const seedData = async () => {
  try {
    await connectDB();
    console.log('🔄 Connected! Clearing existing database collections...');

    await User.deleteMany();
    await Tenant.deleteMany();
    await Course.deleteMany();
    await Exam.deleteMany();
    await Student.deleteMany();
    await Gallery.deleteMany();

    console.log('🌱 Seeding Courses...');
    const courses = await Course.insertMany([
      {
        courseCode: 'MSCIT-01',
        title: 'MS-CIT (Maharashtra State Certificate in IT)',
        category: 'Foundation',
        duration: '3 Months',
        level: 'Beginner',
        fee: 4500,
        isPopular: true,
        description: 'Comprehensive computer literacy course covering Windows 11, MS Office 2021 (Word, Excel, PowerPoint), Digital Payments, and Cyber Safety.',
        syllabus: [
          { moduleNumber: 1, moduleTitle: 'Computer Fundamentals & OS', topics: ['Windows Navigation', 'File Management', 'Hardware Basics'] },
          { moduleNumber: 2, moduleTitle: 'MS Word & MS Excel', topics: ['Document Design', 'Spreadsheets & Formulas', 'Data Visualization'] },
          { moduleNumber: 3, moduleTitle: 'Presentations & Internet', topics: ['MS PowerPoint', 'Online Portals', 'Cyber Security'] }
        ]
      },
      {
        courseCode: 'TALLY-02',
        title: 'Tally Prime with GST & E-Way Bill',
        category: 'Professional',
        duration: '2 Months',
        level: 'Intermediate',
        fee: 5500,
        isPopular: true,
        description: 'Practical financial accounting, inventory management, GST compliance, and billing software training.'
      },
      {
        courseCode: 'EXCEL-03',
        title: 'Advanced Excel & Power BI Analytics',
        category: 'Advanced',
        duration: '2 Months',
        level: 'Intermediate',
        fee: 5000,
        isPopular: true,
        description: 'Master VLOOKUP, XLOOKUP, Pivot Tables, Macros, Power Query, and Interactive Business Intelligence Dashboards.'
      },
      {
        courseCode: 'DES-04',
        title: 'Graphic & UI Design Masterclass',
        category: 'Vocational',
        duration: '4 Months',
        level: 'All Levels',
        fee: 8000,
        isPopular: false,
        description: 'Professional visual design course covering Adobe Photoshop, Illustrator, Canva Pro, and Figma layout principles.'
      }
    ]);

    console.log('🌱 Seeding Super Admin Account...');
    const adminUser = await User.create({
      name: 'ITPL Super Administrator',
      email: 'admin@itpl.com',
      username: 'admin',
      password: 'admin123',
      role: 'superadmin',
      phone: '9876543210'
    });

    console.log('🌱 Seeding Demo Franchise Center Tenant...');
    const demoTenant = await Tenant.create({
      franchiseId: 'ITPL-101',
      centerName: 'Shivaji Nagar IT Training Center',
      firmName: 'Shivaji Education & Computer Institute',
      ownerName: 'Sunil Patil',
      email: 'franchise@itpl.com',
      contactNumber: '9822012345',
      address: {
        centerAddress: 'Plot 45, Opp. Bus Stand, Shivaji Nagar',
        place: 'Pune',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411005'
      },
      infrastructure: {
        computerSystems: 25,
        noOfClassroom: 3,
        noOfLab: 2,
        premisesArea: 1200,
        seatRequire: 80
      },
      trade: 'MS-CIT',
      affiliationFee: 25000,
      affiliationFeePaid: 25000,
      subscription: {
        plan: 'enterprise',
        status: 'Active',
        maxStudentsQuota: 1000
      },
      approvedBy: adminUser._id
    });

    console.log('🌱 Seeding Franchise Login Account...');
    await User.create({
      name: 'Sunil Patil (Director)',
      email: 'franchise@itpl.com',
      username: 'franchise',
      password: 'franchise123',
      role: 'franchise',
      phone: '9822012345',
      tenant: demoTenant._id
    });

    console.log('🌱 Seeding Sample Students...');
    const mscitCourse = courses[0];
    const student1 = await Student.create({
      tenant: demoTenant._id,
      rollNumber: 'MSCIT-2026-0001',
      studentId: 'MSCIT-2026-0001',
      name: 'Aarav Sharma',
      fatherName: 'Rajesh Sharma',
      motherName: 'Sunita Sharma',
      email: 'student@itpl.com',
      contactNumber: '9876500001',
      gender: 'Male',
      dob: new Date('2004-05-15'),
      course: mscitCourse._id,
      courseName: mscitCourse.title,
      batchTime: '10:00 AM - 12:00 PM',
      totalFee: 4500,
      paidFee: 4500,
      paymentStatus: 'Paid',
      status: 'Passed',
      hallTicketGenerated: true,
      hallTicketNumber: 'HT-MSCIT-2026-0001',
      examDate: new Date(),
      examCenter: demoTenant.centerName
    });

    // Create student login
    await User.create({
      name: 'Aarav Sharma',
      email: 'student@itpl.com',
      username: 'mscit-2026-0001',
      password: 'student123',
      role: 'student',
      tenant: demoTenant._id,
      studentRef: student1._id,
      phone: '9876500001'
    });

    console.log('🌱 Seeding MS-CIT Official Exam...');
    await Exam.create({
      examCode: 'EXAM-MSCIT-FINAL',
      title: 'MS-CIT Final Assessment Online Examination',
      course: mscitCourse._id,
      courseName: mscitCourse.title,
      durationMinutes: 45,
      totalMarks: 20,
      passingMarks: 8,
      questions: [
        {
          questionText: 'Which shortcut key is used to Undo the last action in MS Word?',
          options: [
            { optionKey: 'A', text: 'Ctrl + Y' },
            { optionKey: 'B', text: 'Ctrl + Z' },
            { optionKey: 'C', text: 'Ctrl + U' },
            { optionKey: 'D', text: 'Ctrl + X' }
          ],
          correctOption: 'B',
          marks: 2,
          category: 'MS Word'
        },
        {
          questionText: 'In MS Excel, which symbol is mandatory before entering any formula or calculation?',
          options: [
            { optionKey: 'A', text: '=' },
            { optionKey: 'B', text: '+' },
            { optionKey: 'C', text: '#' },
            { optionKey: 'D', text: '@' }
          ],
          correctOption: 'A',
          marks: 2,
          category: 'MS Excel'
        },
        {
          questionText: 'What is the full form of CPU?',
          options: [
            { optionKey: 'A', text: 'Central Performance Unit' },
            { optionKey: 'B', text: 'Central Processing Unit' },
            { optionKey: 'C', text: 'Computer Processing Utility' },
            { optionKey: 'D', text: 'Control Processing Unit' }
          ],
          correctOption: 'B',
          marks: 2,
          category: 'Fundamentals'
        },
        {
          questionText: 'Which file format is used for standard PowerPoint presentations?',
          options: [
            { optionKey: 'A', text: '.docx' },
            { optionKey: 'B', text: '.xlsx' },
            { optionKey: 'C', text: '.pptx' },
            { optionKey: 'D', text: '.pdf' }
          ],
          correctOption: 'C',
          marks: 2,
          category: 'MS PowerPoint'
        },
        {
          questionText: 'Which protocol is used for secure encrypted browsing on the internet?',
          options: [
            { optionKey: 'A', text: 'HTTP' },
            { optionKey: 'B', text: 'FTP' },
            { optionKey: 'C', text: 'HTTPS' },
            { optionKey: 'D', text: 'SMTP' }
          ],
          correctOption: 'C',
          marks: 2,
          category: 'Cyber Security & Internet'
        }
      ]
    });

    console.log(`
    ========================================================
    🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!
    ========================================================
    🔑 DEMO CREDENTIALS:
    --------------------------------------------------------
    1. Super Admin:
       Email:    admin@itpl.com
       Password: admin123
       Role:     Super Administrator (SaaS Owner)
       
    2. Franchise Center:
       Email:    franchise@itpl.com
       Password: franchise123
       Role:     Franchise Owner (Shivaji Nagar Center)
       
    3. Student:
       Email:    student@itpl.com (or Roll No: MSCIT-2026-0001)
       Password: student123
       Role:     Student
    ========================================================
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
