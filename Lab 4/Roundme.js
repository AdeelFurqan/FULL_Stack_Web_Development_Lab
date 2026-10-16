function roundMe() {
    // Case 1: 0 arguments passed
    if (arguments.length === 0) {
        return 0;
    }
    
    // Case 2: Only 1 argument passed
    if (arguments.length === 1) {
        return Math.round(arguments[0]);
    }

    // Case 3: Multiple arguments passed -> return an array
    let roundedArray = [];
    for (let i = 0; i < arguments.length; i++) {
        roundedArray.push(Math.round(arguments[i]));
    }
    return roundedArray;
}

// Testing all cases
console.log(roundMe());          // Output: 0
console.log(roundMe(4.7));       // Output: 5
console.log(roundMe(4.7, 4.4));  // Output: [5, 4]
