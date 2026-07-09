const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const app = express();

// Set up multer for file uploads
const storage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, path.join(__dirname, 'public', 'image')); // Directory to save uploaded files
},
filename: (req, file, cb) => {
cb(null, file.originalname); 
}
});
const upload = multer({ storage: storage });
 
// Create MySQL connection to c237_studentlistapp
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Slenderman11',
    database: 'c237_studentlistapp'
});
 
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});
 
// Set up view engine
app.set('view engine', 'ejs');
// Enable static files
app.use(express.static('public'));
// Enable form processing
app.use(express.urlencoded({extended: false}));
 
// Define routes

// 1. Display all students
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM student';
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Database query error:', error.message); 
      return res.send('Error Retrieving students'); 
    }
    // Render index page with students data array
    res.render('index', { students: results });
  });
});

// 2. Display specific student details
app.get('/student/:id', (req, res) => {
  const studentId = req.params.id;
  const sql = 'SELECT * FROM student WHERE studentId = ?';
  connection.query(sql, [studentId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message); 
      return res.send('Error Retrieving student by ID'); 
    }
    if (results.length > 0) {
      res.render('student', { student: results[0] });
    } else {
      res.send('Student not found');
    }
  });
});

// 3. Render Add Student form view
app.get('/addStudent', (req, res) => {
  res.render('addStudent'); 
});

// 4. Handle Add Student form submission
app.post('/addStudent', upload.single('image'), (req, res) => {
  const { name, dob, contact } = req.body;
  const studentImage = req.file
    ? req.file.filename
    : (req.body.image || '').trim() || 'John Edward.avif';

  const sql = 'INSERT INTO student (name, dob, contact, image) VALUES (?, ?, ?, ?)';

  connection.query(sql, [name, dob, contact, studentImage], (error, results) => {
    if (error) {
      console.error("Error adding student:", error);
      res.send('Error adding student');
    } else {
      res.redirect('/');
    }
  });
});

// 5. Render Edit Student form view
app.get('/editStudent/:id', (req, res) => {
  const studentId = req.params.id;
  const sql = 'SELECT * FROM student WHERE studentId = ?';
  
  // Fetch data from MySQL based on the student ID
  connection.query(sql, [studentId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message); 
      return res.send('Error retrieving student by ID'); 
    }
    // Check if any student with the given ID was found
    if (results.length > 0) {
      // Render the editStudent HTML/EJS page with the student data
      res.render('editStudent', { student: results[0] });
    } else {
      // If no student with the given ID was found, handle it accordingly
      res.send('Student not found');
    }
  });
});

// 6. Handle Edit Student form submission
app.post('/editStudent/:id', upload.single('image'), (req, res) => {
  const studentId = req.params.id;
  // Extract student data from the form request body
  const { name, dob, contact} = req.body;
  let image = req.body.currentImage; //retrieve current image filename
  if (req.file) { //if new image is uploaded
    image = req.file.filename; // set image to be new image filename
  } 
  const sql = 'UPDATE student SET name = ?, dob = ?, contact = ?, image = ? WHERE studentId = ?';
  
  // Update the student details in the database
  connection.query(sql, [name, dob, contact, image, studentId], (error, results) => {
    if (error) {
      // Handle any error that occurs during the database operation
      console.error("Error updating student:", error);
      res.send('Error updating student');
    } else {
      // Redirect back to the homepage to see the updated list
      res.redirect('/');
    }
  });
});

// 7. Handle Delete Student operation
app.post('/deleteStudent/:id', (req, res) => {
  const studentId = req.params.id;
  const sql = 'DELETE FROM student WHERE studentId = ?';
  
  // Execute the delete query on the database
  connection.query(sql, [studentId], (error, results) => {
    if (error) {
      // Handle any error that occurs during the database operation
      console.error("Error deleting student:", error);
      res.send('Error deleting student');
    } else {
      // Redirect back to the home page to view the updated list
      res.redirect('/');
    }
  });
});
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
