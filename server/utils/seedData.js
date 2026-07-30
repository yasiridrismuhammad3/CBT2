const User = require('../models/User');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const Announcement = require('../models/Announcement');

const seedAll = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Class.deleteMany({});
    await Question.deleteMany({});
    await Exam.deleteMany({});
    await Announcement.deleteMany({});

    console.log('🧹 Existing data cleared.');

    // 1. Seed Classes
    const classList = [
      { name: 'SS 3A', category: 'Senior Secondary', arm: 'A' },
      { name: 'SS 3B', category: 'Senior Secondary', arm: 'B' },
      { name: 'SS 2A', category: 'Senior Secondary', arm: 'A' },
      { name: 'SS 1A', category: 'Senior Secondary', arm: 'A' },
      { name: 'JSS 3A', category: 'Junior Secondary', arm: 'A' },
      { name: 'JSS 1A', category: 'Junior Secondary', arm: 'A' }
    ];
    await Class.insertMany(classList);
    console.log('✅ Classes seeded');

    // 2. Seed Admin & Teacher (with email + password)
    const adminUser = await User.create({
      fullName: 'Dr. Kabir Usman (Super Admin)',
      email: 'admin@damale.edu.ng',
      password: 'Admin@123',
      role: 'admin',
      gender: 'Male'
    });

    const teacherUser = await User.create({
      fullName: 'Malam Ibrahim Danladi',
      email: 'teacher@damale.edu.ng',
      password: 'Teacher@123',
      role: 'teacher',
      gender: 'Male'
    });

    // 3. Seed Students (DS Number only — NO password, NO email required)
    const student1 = await User.create({
      dsNumber: 'DS/2026/001',
      fullName: 'Amina Sani Katsina',
      role: 'student',
      class: 'SS 3A',
      gender: 'Female'
    });

    const student2 = await User.create({
      dsNumber: 'DS/2026/002',
      fullName: 'Bello Farouk Ahmed',
      role: 'student',
      class: 'SS 3A',
      gender: 'Male'
    });

    const student3 = await User.create({
      dsNumber: 'DS/2026/003',
      fullName: 'Fatima Abdullahi Musa',
      role: 'student',
      class: 'SS 3B',
      gender: 'Female'
    });

    const student4 = await User.create({
      dsNumber: 'DS/2026/004',
      fullName: 'Usman Garba Kano',
      role: 'student',
      class: 'SS 2A',
      gender: 'Male'
    });

    console.log('✅ Users seeded');

    // 4. Seed Subjects
    const mathSub = await Subject.create({
      name: 'Mathematics',
      code: 'MTH301',
      description: 'Senior Secondary Mathematics & Quantitative Reasoning',
      classes: ['SS 1A', 'SS 2A', 'SS 3A', 'SS 3B'],
      createdBy: adminUser._id
    });

    const engSub = await Subject.create({
      name: 'English Language',
      code: 'ENG301',
      description: 'Use of English, Grammar and Comprehension',
      classes: ['SS 1A', 'SS 2A', 'SS 3A', 'SS 3B'],
      createdBy: adminUser._id
    });

    await Subject.create({
      name: 'Physics',
      code: 'PHY301',
      description: 'General Physics & Applied Mechanics',
      classes: ['SS 2A', 'SS 3A'],
      createdBy: adminUser._id
    });

    await Subject.create({
      name: 'Chemistry',
      code: 'CHM301',
      description: 'Organic & Inorganic Chemistry',
      classes: ['SS 2A', 'SS 3A'],
      createdBy: adminUser._id
    });

    await Subject.create({
      name: 'Biology',
      code: 'BIO301',
      description: 'General Biology & Life Sciences',
      classes: ['SS 1A', 'SS 2A', 'SS 3A'],
      createdBy: adminUser._id
    });

    teacherUser.assignedSubjects = [mathSub._id, engSub._id];
    await teacherUser.save();
    console.log('✅ Subjects seeded');

    // 5. Seed Questions for Mathematics
    const mathQuestions = await Question.insertMany([
      {
        subject: mathSub._id,
        class: 'SS 3A',
        questionText: 'Solve for x in the quadratic equation: x² - 5x + 6 = 0',
        options: [
          { key: 'A', text: 'x = 2 or x = 3' },
          { key: 'B', text: 'x = -2 or x = -3' },
          { key: 'C', text: 'x = 1 or x = 6' },
          { key: 'D', text: 'x = -1 or x = -6' }
        ],
        correctOption: 'A',
        explanation: 'Factoring: (x - 2)(x - 3) = 0, so x = 2 or x = 3.',
        marks: 2,
        difficulty: 'Easy',
        createdBy: teacherUser._id
      },
      {
        subject: mathSub._id,
        class: 'SS 3A',
        questionText: 'What is the sum of the interior angles of a regular hexagon?',
        options: [
          { key: 'A', text: '360°' },
          { key: 'B', text: '540°' },
          { key: 'C', text: '720°' },
          { key: 'D', text: '900°' }
        ],
        correctOption: 'C',
        explanation: 'Formula: (n - 2) × 180° = (6 - 2) × 180° = 720°.',
        marks: 2,
        difficulty: 'Medium',
        createdBy: teacherUser._id
      },
      {
        subject: mathSub._id,
        class: 'SS 3A',
        questionText: 'Evaluate log₁₀(1000) + log₁₀(0.01)',
        options: [
          { key: 'A', text: '1' },
          { key: 'B', text: '2' },
          { key: 'C', text: '3' },
          { key: 'D', text: '5' }
        ],
        correctOption: 'A',
        explanation: 'log₁₀(1000) = 3, log₁₀(0.01) = -2. Total = 1.',
        marks: 2,
        difficulty: 'Medium',
        createdBy: teacherUser._id
      },
      {
        subject: mathSub._id,
        class: 'SS 3A',
        questionText: 'Find the 10th term of the AP: 3, 7, 11, 15, ...',
        options: [
          { key: 'A', text: '35' },
          { key: 'B', text: '39' },
          { key: 'C', text: '43' },
          { key: 'D', text: '40' }
        ],
        correctOption: 'B',
        explanation: 'T₁₀ = 3 + (9 × 4) = 39.',
        marks: 2,
        difficulty: 'Medium',
        createdBy: teacherUser._id
      },
      {
        subject: mathSub._id,
        class: 'SS 3A',
        questionText: 'If sin(θ) = 3/5, what is cos(θ)?',
        options: [
          { key: 'A', text: '4/5' },
          { key: 'B', text: '5/3' },
          { key: 'C', text: '3/4' },
          { key: 'D', text: '5/4' }
        ],
        correctOption: 'A',
        explanation: 'cos(θ) = adjacent/hypotenuse = 4/5.',
        marks: 2,
        difficulty: 'Easy',
        createdBy: teacherUser._id
      }
    ]);

    // 6. Seed Questions for English
    const engQuestions = await Question.insertMany([
      {
        subject: engSub._id,
        class: 'SS 3A',
        questionText: 'Choose the word nearest in meaning to "lucid":',
        options: [
          { key: 'A', text: 'Vague' },
          { key: 'B', text: 'Clear and understandable' },
          { key: 'C', text: 'Complicated' },
          { key: 'D', text: 'Boring' }
        ],
        correctOption: 'B',
        explanation: 'Lucid means clear and easy to understand.',
        marks: 2,
        difficulty: 'Easy',
        createdBy: teacherUser._id
      },
      {
        subject: engSub._id,
        class: 'SS 3A',
        questionText: 'Identify the passive voice of: "The teacher marked the exam scripts."',
        options: [
          { key: 'A', text: 'The exam scripts are marked by the teacher.' },
          { key: 'B', text: 'The exam scripts were marked by the teacher.' },
          { key: 'C', text: 'The exam scripts have been marked by the teacher.' },
          { key: 'D', text: 'The teacher was marking the exam scripts.' }
        ],
        correctOption: 'B',
        explanation: 'Past simple active → "were marked by".',
        marks: 2,
        difficulty: 'Easy',
        createdBy: teacherUser._id
      },
      {
        subject: engSub._id,
        class: 'SS 3A',
        questionText: 'Which of the following is a conjunction?',
        options: [
          { key: 'A', text: 'Quickly' },
          { key: 'B', text: 'Beautiful' },
          { key: 'C', text: 'Although' },
          { key: 'D', text: 'Table' }
        ],
        correctOption: 'C',
        explanation: '"Although" is a subordinating conjunction.',
        marks: 2,
        difficulty: 'Easy',
        createdBy: teacherUser._id
      }
    ]);

    console.log('✅ Questions seeded');

    // 7. Seed Published Exams (PUBLISHED so students can see them immediately)
    await Exam.create({
      title: 'SS3 Mathematics Mock Examination 2026',
      subject: mathSub._id,
      targetClasses: ['SS 3A', 'SS 3B'],
      durationMinutes: 20,
      passPercentage: 50,
      questions: mathQuestions.map((q) => q._id),
      randomizeQuestions: true,
      randomizeOptions: true,
      showResultImmediately: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'published',
      term: 'Second Term',
      academicSession: '2025/2026',
      createdBy: teacherUser._id
    });

    await Exam.create({
      title: 'SS3 English Language Test',
      subject: engSub._id,
      targetClasses: ['SS 3A'],
      durationMinutes: 15,
      passPercentage: 50,
      questions: engQuestions.map((q) => q._id),
      randomizeQuestions: false,
      randomizeOptions: true,
      showResultImmediately: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'published',
      term: 'Second Term',
      academicSession: '2025/2026',
      createdBy: teacherUser._id
    });

    console.log('✅ Exams seeded (status: published)');

    // 8. Seed Announcements
    await Announcement.create({
      title: '📢 Welcome to DAMALE SCHOOL KATSINA CBT Portal',
      content: 'All SS3 students must complete the Mathematics Mock Examination before the end of term. Log in using your DS Number — no password required.',
      targetAudience: 'All',
      priority: 'High',
      author: adminUser._id
    });

    await Announcement.create({
      title: '⏰ Exam Schedule Notice',
      content: 'Mathematics examination is available for SS 3A and SS 3B. English Language test is available for SS 3A. Results are shown immediately after submission.',
      targetAudience: 'Students',
      priority: 'high',
      author: adminUser._id
    });

    console.log('✅ Announcements seeded');
    console.log('🎉 Database seeding complete!\n');
    console.log('==============================================');
    console.log('  DAMALE SCHOOL KATSINA — LOGIN CREDENTIALS');
    console.log('==============================================');
    console.log('👑 Admin:   admin@damale.edu.ng   | Admin@123');
    console.log('👨‍🏫 Teacher: teacher@damale.edu.ng | Teacher@123');
    console.log('----------------------------------------------');
    console.log('🎓 Student Login (DS Number only — no password):');
    console.log('   DS/2026/001 → Amina Sani Katsina     (SS 3A)');
    console.log('   DS/2026/002 → Bello Farouk Ahmed      (SS 3A)');
    console.log('   DS/2026/003 → Fatima Abdullahi Musa   (SS 3B)');
    console.log('   DS/2026/004 → Usman Garba Kano        (SS 2A)');
    console.log('==============================================\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

module.exports = seedAll;
