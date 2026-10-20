// TASK 4 - University User Hierarchy and Dynamic this
// Run: node task4_hierarchy.js

class Person {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  introduce() {
    return `Hi, I am ${this.name} (${this.email})`;
  }
}

class Student extends Person {
  constructor(name, email, rollNo, marks) {
    super(name, email);
    this.rollNo = rollNo;
    this.marks = marks;
  }
  introduce() {
    return `${super.introduce()} - Student, Roll No: ${this.rollNo}`;
  }
  getResult() {
    return this.marks >= 50 ? 'Pass' : 'Fail';
  }
}

class FacultyMember extends Person {
  constructor(name, email, employeeId, department) {
    super(name, email);
    this.employeeId = employeeId;
    this.department = department;
  }
  introduce() {
    return `${super.introduce()} - Faculty (${this.department}), ID: ${this.employeeId}`;
  }
}

// ---------- Runtime polymorphism ----------
const users = [
  new Student('Ozil', 'Ozil@au.edu', '23-1001', 88),
  new Student('Leo', 'Leo@au.edu', '23-1002', 41),
  new FacultyMember('Dr. Ronaldo', 'Ronaldo@au.edu', 'E-77', 'CS'),
  new FacultyMember('Dr. Maradona', 'Maradona@au.edu', 'E-78', 'SE'),
  new Person('Visitor', 'visitor@au.edu'),
];
users.forEach((user) => console.log(user.introduce()));

// ---------- instanceof ----------
console.log('\ninstanceof checks:');
console.log('Sara instanceof Student      :', users[0] instanceof Student);
console.log('Sara instanceof Person       :', users[0] instanceof Person);
console.log('Sara instanceof FacultyMember:', users[0] instanceof FacultyMember);

// ---------- call() ----------
const guest = { name: 'Dr. Ahmed', email: 'ahmed@example.com' };
console.log('\ncall():', Person.prototype.introduce.call(guest));

// ---------- Detached method ----------
const student = users[0];
const fn = student.introduce;
try {
  fn(); // `this` is undefined (class code runs in strict mode)
} catch (error) {
  console.log('\nDetached fn() failed:', error.constructor.name, '-', error.message);
}

// ---------- bind() ----------
const safeFn = student.introduce.bind(student);
console.log('bind():', safeFn());
console.log('bind() with guest:', Person.prototype.introduce.bind(guest)());
