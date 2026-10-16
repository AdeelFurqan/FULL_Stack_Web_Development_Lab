// Part 1 & 2: Using 'var' with primitive types (String, Number, Boolean) and printing to console
var myName = "Adeel Furqan";
var myAge = 20;
var isStudent = true;
var myCity = "Islamabad";
var myUniversity = "Air University";

console.log("--- Biography using Variables ---");
console.log("Name: " + myName);
console.log("Age: " + myAge);
console.log("Currently a Student: " + isStudent);
console.log("City: " + myCity);
console.log("University: " + myUniversity);


// Part 3: Creating a JS Object with nested objects for Address and Degree Program
var biography = {
    name: "Adeel Furqan",
    age: 20,
    isEnrolled: true,
        skills: "Flutter, C#, JavaScript",
    degreeProgram: {
        title: "BS Computer Science",
        semester: 4,
        university: "Air University"
    }
};

// Printing individual properties (not printing the entire object directly)
console.log("\n--- Biography using JS Object ---");
console.log("Name: " + biography.name);
console.log("Age: " + biography.age);
console.log("Enrolled: " + biography.isEnrolled);
console.log("Skills: " + biography.skills);
console.log("Degree: " + biography.degreeProgram.title + " (Semester " + biography.degreeProgram.semester + ") at " + biography.degreeProgram.university);
