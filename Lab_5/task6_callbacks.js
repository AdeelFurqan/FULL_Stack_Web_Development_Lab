// TASK 6 - Legacy Course Registration Service Using Callbacks
// Run: node task6_callbacks.js

const students = {
  101: { id: 101, name: 'Ali', completed: ['CS101', 'CS201'], registered: [] },
  102: { id: 102, name: 'Sara', completed: [], registered: [] },
};
const courses = {
  CS401: { code: 'CS401', prerequisites: ['CS101'], seats: 2 },
  CS402: { code: 'CS402', prerequisites: [], seats: 0 },
};

function loadStudent(studentId, callback) {
  setTimeout(() => {
    const student = students[studentId];
    if (!student) {
      callback(new Error(`Student ${studentId} does not exist`));
      return;
    }
    callback(null, student);
  }, 100);
}

function checkPrerequisites(student, courseCode, callback) {
  setTimeout(() => {
    const course = courses[courseCode];
    if (!course) { callback(new Error(`Course ${courseCode} not found`)); return; }
    const missing = course.prerequisites.filter((p) => !student.completed.includes(p));
    if (missing.length > 0) {
      callback(new Error(`Prerequisite not completed: ${missing.join(', ')}`));
      return;
    }
    callback(null, course);
  }, 100);
}

function checkSeats(course, callback) {
  setTimeout(() => {
    if (course.seats <= 0) { callback(new Error(`Course ${course.code} is full`)); return; }
    callback(null, course);
  }, 100);
}

function registerCourse(student, course, callback) {
  setTimeout(() => {
    if (student.registered.includes(course.code)) {
      callback(new Error(`Student ${student.id} already registered in ${course.code}`));
      return;
    }
    student.registered.push(course.code);
    course.seats -= 1;
    callback(null, { studentId: student.id, course: course.code, status: 'REGISTERED' });
  }, 100);
}

function registerForCourse(studentId, courseCode, done) {
  loadStudent(studentId, (err1, student) => {
    if (err1) { done(err1); return; }
    checkPrerequisites(student, courseCode, (err2, course) => {
      if (err2) { done(err2); return; }
      checkSeats(course, (err3) => {
        if (err3) { done(err3); return; }
        registerCourse(student, course, (err4, confirmation) => {
          if (err4) { done(err4); return; }
          done(null, confirmation);
        });
      });
    });
  });
}

// ---------------- TESTS ----------------
const testCases = [
  { label: 'Success', studentId: 101, course: 'CS401' },
  { label: 'Already registered', studentId: 101, course: 'CS401' },
  { label: 'Student missing', studentId: 999, course: 'CS401' },
  { label: 'Prerequisite missing', studentId: 102, course: 'CS401' },
  { label: 'Course full', studentId: 101, course: 'CS402' },
];

function runTest(index) {
  if (index >= testCases.length) { console.log('\nAll tests finished.'); return; }
  const t = testCases[index];
  registerForCourse(t.studentId, t.course, (error, result) => {
    if (error) console.log(`[${t.label}] ERROR:`, error.message);
    else console.log(`[${t.label}] OK:`, result);
    runTest(index + 1);
  });
}
runTest(0);

/* WHY THIS BECOMES HARD TO MAINTAIN
   1. Nesting: every new step goes one level deeper (pyramid of doom).
   2. Error handling is repeated: every level needs its own `if (err)`. Forgetting one lets bad data continue.
   3. No single try/catch can cover async callbacks.
   4. Hard to reorder, reuse, or add steps (e.g. run two steps in parallel).
   5. A callback might be called twice or never if a developer forgets `return`.
   Promises and async/await fix these problems. */
