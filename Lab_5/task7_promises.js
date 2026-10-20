// TASK 7 - Promise-Based Multi-Service Registration Engine
// Run: node task7_promises.js

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- Promise versions of the services ----------
function getStudent(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 101) resolve({ id: 101, name: 'Ali', completed: ['CS101'] });
      else reject(new Error(`Student ${id} not found`));
    }, 50);
  });
}
function getCourse(code) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (code === 'CS401') resolve({ code: 'CS401', prerequisites: ['CS101'], seats: 5 });
      else if (code === 'CS999') resolve({ code: 'CS999', prerequisites: ['CS500'], seats: 5 });
      else if (code === 'CS402') resolve({ code: 'CS402', prerequisites: [], seats: 0 });
      else reject(new Error(`Course ${code} not found`));
    }, 50);
  });
}
function checkPrerequisites(student, course) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const ok = course.prerequisites.every((p) => student.completed.includes(p));
      if (ok) resolve(true); else reject(new Error('Prerequisites not completed'));
    }, 50);
  });
}
function checkSeats(course) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (course.seats > 0) resolve(true); else reject(new Error('Course is full'));
    }, 50);
  });
}
function registerStudent(student, course) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ studentId: student.id, course: course.code, status: 'REGISTERED' }), 50);
  });
}
function sendEmail() { return wait(50).then(() => 'Email sent'); }
function sendSMS() { return wait(50).then(() => { throw new Error('SMS gateway down'); }); } // always fails (demo)
function writeAuditLog() { return wait(50).then(() => 'Audit written'); }

// ---------- Part A: the chain ----------
// Each stage receives ONE object (ctx) and RETURNS a new ctx.
function stepStudent(ctx) {
  return getStudent(ctx.studentId).then((student) => ({ ...ctx, student }));
}
function stepCourse(ctx) {
  return getCourse(ctx.courseCode).then((course) => ({ ...ctx, course }));
}
function stepPrereq(ctx) {
  return checkPrerequisites(ctx.student, ctx.course).then(() => ctx);
}
function stepSeats(ctx) {
  return checkSeats(ctx.course).then(() => ctx);
}
function stepRegister(ctx) {
  return registerStudent(ctx.student, ctx.course);
}

function registerChain(studentId, courseCode) {
  return Promise.resolve({ studentId, courseCode })
    .then(stepStudent)
    .then(stepCourse)
    .then(stepPrereq)
    .then(stepSeats)
    .then(stepRegister)
    .then((confirmation) => {
      console.log('  Registered:', confirmation);
      return confirmation;
    })
    .catch((error) => {
      console.log('  Registration failed:', error.message);
      return null;
    })
    .finally(() => console.log('  (finally: registration attempt over)'));
}

// ---------- Part B: allSettled ----------
function postRegistration() {
  const names = ['Email', 'SMS', 'Audit'];
  return Promise.allSettled([sendEmail(), sendSMS(), writeAuditLog()]).then((outcomes) =>
    outcomes.map((o, i) => ({ service: names[i], status: o.status }))
  );
}

// ---------- Part C: any ----------
function fetchFromServer1() { return wait(30).then(() => { throw new Error('Server 1 is down'); }); }
function fetchFromServer2() { return wait(200).then(() => ({ code: 'CS401', from: 'Server 2' })); }
function fetchBad1() { return Promise.reject(new Error('A failed')); }
function fetchBad2() { return Promise.reject(new Error('B failed')); }

// ---------------- RUN ----------------
console.log('Part A - success case');
registerChain(101, 'CS401')
  .then(() => { console.log('Part A - student missing'); return registerChain(5, 'CS401'); })
  .then(() => { console.log('Part A - prerequisite missing'); return registerChain(101, 'CS999'); })
  .then(() => { console.log('Part A - course full'); return registerChain(101, 'CS402'); })
  .then(() => { console.log('Part A - course missing'); return registerChain(101, 'NOPE'); })
  .then(() => { console.log('\nPart B - allSettled report:'); return postRegistration(); })
  .then((report) => {
    console.log(report);
    console.log('\nPart C - Promise.any (first SUCCESS)');
    return Promise.any([fetchFromServer1(), fetchFromServer2()]);
  })
  .then((first) => {
    console.log('  any() result:', first);
    return Promise.race([fetchFromServer1(), fetchFromServer2()])
      .catch((e) => console.log('  race() result: REJECTED ->', e.message, '(wrong choice here!)'));
  })
  .then(() => Promise.any([fetchBad1(), fetchBad2()]))
  .catch((e) => console.log('  any() when ALL fail ->', e.constructor.name, e.errors.map((x) => x.message)));

/* JUSTIFICATION
   Part B: allSettled - we need the result of EVERY service even if one fails. Promise.all would reject at the first failure.
   Part C: any - accept the first SUCCESSFUL result. race() returns the first SETTLED one, which may be a failure. */
