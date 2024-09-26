const express = require('express')
const Student = require('../models/Student')
const Quiz =require('../models/TeacherQuiz')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');
const axios = require('axios')
const fetch = require('../middleware/fetchdetails');
const Teacher = require('../models/Teacher');
const TestResult = require('../models/TestResult');
const jwtSecret = "HaHa"


router.post('/newStudent', [
    // Validation middleware
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    body('name').isLength({ min: 3 })
], async (req, res) => {

    let success = false;
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        // Check if a student with the same email or name already exists
        let student = await Student.findOne({ $or: [{ email: req.body.email }, { name: req.body.name }] });
        if (student) {
            return res.status(400).json({ success, error: 'Student with this email or name already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create the student
        student = await Student.create({
            name: req.body.name,
            password: hashedPassword,
            email: req.body.email
        });

        // Generate JWT token
        const data = { user: { id: student.id } };
        const authToken = jwt.sign(data, jwtSecret);

        // Send success response with auth token
        success = true;
        res.json({ success, authToken });
    } catch (error) {
        console.error(error.message);
        // Handle server error
        res.status(500).json({ error: 'Server Error' });
    }
});


router.post('/newTeacher', [
    // Validation middleware
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    body('name').isLength({ min: 3 }),
    body('organizationName').isLength({ min: 0 })
], async (req, res) => {

    let success = false;
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        // Check if a teacher with the same email, name, or organization name already exists
        let teacher = await Teacher.findOne({ $or: [{ email: req.body.email }, { name: req.body.name }] });
        if (teacher) {
            return res.status(400).json({ success, error: 'Teacher with this email, name, or organization name already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create the teacher
        teacher = await Teacher.create({
            name: req.body.name,
            password: hashedPassword,
            email: req.body.email,
            organizationName: req.body.organizationName
        });

        // Generate JWT token
        const data = { user: { id: teacher.id } };
        const authToken = jwt.sign(data, jwtSecret);

        // Send success response with auth token
        success = true;
        res.json({ success, authToken });
    } catch (error) {
        console.error(error.message);
        // Handle server error
        res.status(500).json({ error: 'Server Error' });
    }
});

// Authentication a User, No login Requiered
router.post('/login', [
    body('email', "Enter a valid email").isEmail(),
    body('password', "Password cannot be blank").exists(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Create error response based on validation errors
            const emailError = errors.array().find(e => e.param === 'email');
            const passwordError = errors.array().find(e => e.param === 'password');
            return res.status(400).json({
                success: false,
                emailValid: !emailError,
                passwordValid: !passwordError,
                error: "Invalid credentials"
            });
        }

        const { email, password } = req.body;

        let user = await Student.findOne({ email });
        let userType = "student"; // Default user type

        if (!user) {
            user = await Teacher.findOne({ email });
            userType = "teacher";
        }

        if (!user) {
            return res.status(400).json({
                success: false,
                emailValid: false,
                passwordValid: true,
                error: "Invalid credentials"
            });
        }

        const pwdCompare = await bcrypt.compare(password, user.password);
        if (!pwdCompare) {
            return res.status(400).json({
                success: false,
                emailValid: true,
                passwordValid: false,
                error: "Invalid credentials"
            });
        }

        const authToken = jwt.sign({ user: { id: user.id } }, jwtSecret);
        res.json({ success: true, authToken, userType });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});


router.post('/createQuiz', async (req, res) => {
    try {
        const { teacherEmail, quizTitle, quizTime, questions, posMark, negMark, uniqueCode } = req.body;

        if (!teacherEmail || !quizTitle || !quizTime || !questions || !posMark || !negMark || !uniqueCode) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const quiz = new Quiz({
            teacherEmail,
            quizTitle,
            quizTime,
            posMark,
            negMark,
            questions,
            uniqueCode
        });

        await quiz.save();
        global.quiz.push(quiz);
        res.status(201).json({ success: true, quiz });
    } catch (error) {
        console.error('Error creating quiz:', error.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

router.post('/quizzes', async (req, res) => {


    try {
        const { teacherEmail } = req.body;
        const quizzes = await Quiz.find({ teacherEmail });
        res.status(200).json(quizzes);
    } catch (error) {
        console.error('Error verifying token or fetching quizzes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



  
router.post('/getQuizDetails', async (req, res) => {
    try {
      const { uniqueCode } = req.body;
      const quiz = await Quiz.findOne({ uniqueCode });
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
      res.json(quiz);
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  router.post('/submitQuiz', async (req, res) => {
    try {
      const { studentName,title, uniqueCode, score, totalScore } = req.body;
  
      console.log(req.body);
  
      if (!studentName) {
        throw new Error('Missing required field: studentName');
      }
  
      const newTestResult = new TestResult({
        studentName,
        title,
        uniqueCode,
        score,
        totalScore
      });
      await newTestResult.save();
      res.status(200).json({ message: 'Test submitted successfully' });
    } catch (error) {
      console.error('Error submitting test:', error);
      res.status(400).json({ error: error.message }); 
    }
  });
  router.delete('/deleteQuiz', async (req, res) => {
    try {
      const { uniqueCode } = req.body;
  
      const quiz = await Quiz.findOneAndDelete({ uniqueCode });
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
  
      res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (error) {
      console.error('Error deleting quiz:', error.message);
      res.status(500).json({ error: 'Server Error' });
    }
  });
  
  router.get('/getTestResults', async (req, res) => {
    const { uniqueCode } = req.query;
    try {
        const testResults = await TestResult.find({ uniqueCode });
        res.status(200).json(testResults);
    } catch (error) {
        console.error('Error fetching test results:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/getTestResultsByStudentName', async (req, res) => {
    const { studentName } = req.body;
    try {
        
        const testResults = await TestResult.find({ studentName: studentName });
        if (testResults.length === 0) {
            return res.status(404).json({ message: 'No test results found' });
        }
        res.status(200).json(testResults);
    } catch (error) {
        console.error('Error fetching test results:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/getUserDetails', async (req, res) => {
    try {
        const { userId } = req.body;
        let user = await Student.findById(userId);
        if (user) {
            return res.status(200).json({ name: user.name });
        }

        user = await Teacher.findById(userId);
        if (user) {
            return res.status(200).json(user);
        }

        return res.status(404).json({ message: 'User not found' });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




module.exports=router
