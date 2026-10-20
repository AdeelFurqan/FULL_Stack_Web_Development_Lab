// TASK 5 - Transcript Processing (SINGLE FILE VERSION for online compilers)
// Each section below = one file of the real modular project.
// In the real project each section goes into its own file with export/import
// (shown in the comments).

// =====================================================
// FILE 1: gradeUtils.js   (real project: NAMED exports)
// e.g.  export function calculateGrade(marks) { ... }
// =====================================================
function calculateGrade(marks) {
  if (marks >= 85) return 'A';
  if (marks >= 80) return 'A-';
  if (marks >= 75) return 'B+';
  if (marks >= 70) return 'B';
  if (marks >= 65) return 'B-';
  if (marks >= 60) return 'C+';
  if (marks >= 50) return 'C';
  return 'F';
}

function calculateAverage(marksList) {
  if (marksList.length === 0) return 0;
  const total = marksList.reduce((sum, m) => sum + m, 0);
  return Number((total / marksList.length).toFixed(2));
}

function calculateGPA(marksList) {
  if (marksList.length === 0) return 0;
  const points = { A: 4.0, 'A-': 3.67, 'B+': 3.33, B: 3.0, 'B-': 2.67, 'C+': 2.33, C: 2.0, F: 0 };
  const total = marksList.reduce((sum, m) => sum + points[calculateGrade(m)], 0);
  return Number((total / marksList.length).toFixed(2));
}

// =====================================================
// FILE 2: Student.js   (real project: DEFAULT export)
// e.g.  import { calculateAverage, calculateGPA } from './gradeUtils.js';
//       export default class Student { ... }
// =====================================================
class Student {
  constructor(id, name, courses) {
    this.id = id;
    this.name = name;
    this.courses = courses;
  }
  getMarks() {
    return this.courses.map((c) => c.marks);
  }
  getAverage() {
    return calculateAverage(this.getMarks());
  }
  getGPA() {
    return calculateGPA(this.getMarks());
  }
}

// =====================================================
// FILE 3: transcriptService.js
// e.g.  import Student from './Student.js';
// =====================================================

// Step 1: parse JSON safely
function parseTranscript(rawText) {
  let data;
  try {
    data = JSON.parse(rawText);
  } catch (error) {
    throw new Error(`Malformed JSON: ${error.message}`);
  }
  if (!Array.isArray(data)) throw new TypeError('Transcript data must be an array of students');
  return data;
}

// Step 2: validate everything (throws the right error type)
function validateStudents(students) {
  const seenIds = new Set(); // remembers IDs we already saw

  for (const s of students) {
    if (s.id === undefined || s.id === null) {
      throw new TypeError('Student ID is missing');
    }
    if (seenIds.has(s.id)) {
      throw new Error(`Duplicate student ID: ${s.id}`);
    }
    seenIds.add(s.id);

    if (!Array.isArray(s.courses)) {
      throw new TypeError(`Student ${s.id} has no courses array`);
    }
    for (const c of s.courses) {
      if (!c.code || String(c.code).trim() === '') {
        throw new TypeError(`Student ${s.id} has a course with a missing code`);
      }
      if (typeof c.marks !== 'number' || Number.isNaN(c.marks)) {
        throw new TypeError(`Marks for ${c.code} must be a number`);
      }
      if (c.marks < 0 || c.marks > 100) {
        throw new RangeError(`Marks for ${c.code} must be 0-100, got ${c.marks}`);
      }
    }
  }
}

// Step 3: build a JavaScript report object
function buildReport(students) {
  const report = students.map((s) => {
    const student = new Student(s.id, s.name, s.courses);
    return {
      id: student.id,
      name: student.name,
      courses: student.courses.length,
      average: student.getAverage(),
      gpa: student.getGPA(),
    };
  });
  return { totalStudents: report.length, students: report };
}

// Step 4: report object -> JSON text
function reportToJSON(report) {
  return JSON.stringify(report, null, 2);
}

// Does everything in one call
function processTranscript(rawText) {
  const students = parseTranscript(rawText);
  validateStudents(students);
  return reportToJSON(buildReport(students));
}

// =====================================================
// FILE 4: main.js
// Real project imports:
//   import Student from './Student.js';                        (default import)
//   import { calculateGrade as gradeOf, calculateAverage, calculateGPA } from './gradeUtils.js';
//                                                              (named imports + alias)
//   import { processTranscript } from './transcriptService.js';
// =====================================================
const gradeOf = calculateGrade; // alias (in real project: "calculateGrade as gradeOf")

console.log('Quick util check:', gradeOf(81), calculateAverage([81, 74]), calculateGPA([81, 74]));
console.log('Student class check:', new Student(1, 'Test', [{ code: 'X', marks: 90 }]).getAverage());

const goodData = `[{"id":101,"name":"Ali","courses":[{"code":"CS301","marks":81},{"code":"CS302","marks":74}]}]`;

const tests = [
  ['Valid data', goodData],
  ['Malformed JSON', '[{"id":101,'],
  ['Missing ID', '[{"name":"Ali","courses":[]}]'],
  ['Duplicate ID', '[{"id":1,"courses":[]},{"id":1,"courses":[]}]'],
  ['Marks above 100', '[{"id":1,"courses":[{"code":"CS1","marks":101}]}]'],
  ['Marks below 0', '[{"id":1,"courses":[{"code":"CS1","marks":-5}]}]'],
  ['Missing course code', '[{"id":1,"courses":[{"marks":50}]}]'],
  ['Boundary marks 0 and 100', '[{"id":1,"name":"B","courses":[{"code":"A","marks":0},{"code":"B","marks":100}]}]'],
];

for (const [label, raw] of tests) {
  try {
    console.log(`\n[${label}] ->`, processTranscript(raw));
  } catch (error) {
    console.log(`\n[${label}] FAILED: ${error.name}: ${error.message}`);
  } finally {
    console.log(`(finally: "${label}" finished)`); // always runs
  }
}
