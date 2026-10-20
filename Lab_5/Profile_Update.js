// TASK 3 - Safe Student Profile Update Service
// Run: node task3_profile_update.js

const student = {
  id: 101, name: 'Adeel', marks: 0, scholarship: false,
  address: { city: 'Islamabad', sector: 'F-10' },
  contact: { email: 'Adeel@university.edu' },
};
const update = {
  name: 'Furqan',
  address: { city: 'Rawalpindi' },
  contact: { phone: '03001234567' },
};

function updateStudent(oldStudent, changes = {}) {              // default value
  // Object destructuring + renaming (name -> oldName) + object rest (...others)
  const { id, name: oldName, marks, scholarship, address, contact, ...others } = oldStudent;

  const { name, marks: newMarks, scholarship: newScholarship,
          address: newAddress, contact: newContact, ...extraFields } = changes;

  // ?? only falls back on null/undefined, so 0, false and '' are KEPT
  return {
    ...others,
    ...extraFields,
    id,                                      // property shorthand
    name: name ?? oldName,
    marks: newMarks ?? marks,
    scholarship: newScholarship ?? scholarship,
    address: { ...address, ...newAddress },  // city changes, sector stays
    contact: { ...contact, ...newContact },  // email stays, phone added
  };
}

const updated = updateStudent(student, update);
console.log('Original:', student);
console.log('Updated :', updated);

console.log('\nFalsy test:', updateStudent(student, { marks: 0, scholarship: false, name: '' }));
console.log('Empty update:', updateStudent(student, {}));

// ---------- Extra concept demos ----------
const { address: { city, sector } } = student;              // nested destructuring
console.log('\nNested destructuring:', city, sector);

const { nickname = 'No nickname', name: studentName } = student; // rename + default
console.log('Rename + default:', studentName, '/', nickname);

const [first, second, ...remaining] = ['CS301', 'CS302', 'CS303', 'CS304']; // array destructuring
console.log('Array destructuring:', first, second, remaining);

function listCourses(title, ...courses) { return `${title}: ${courses.join(', ')}`; } // rest parameters
console.log('Rest parameters:', listCourses('Courses', 'CS301', 'CS302', 'CS303'));

console.log('Optional chaining:', update?.contact?.phone, '|', update?.hostel?.room);

// ---------- Reference challenge ----------
console.log('\nReference checks (=== compares memory address, not content):');
console.log('original === updated                 :', student === updated);
console.log('original.address === updated.address :', student.address === updated.address);
console.log('original.contact === updated.contact :', student.contact === updated.contact);
console.log('Why all false? Spread created a NEW object at every level we rebuilt.');

const shallow = { ...student };
console.log('\nShallow copy: shallow === student ->', shallow === student,
            '| shallow.address === student.address ->', shallow.address === student.address,
            '(nested object is SHARED)');
console.log('Original after update is untouched:', student.address.city);
