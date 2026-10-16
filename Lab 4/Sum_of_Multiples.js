function sumOfMultiples(x, y, z) {
    let sum = 0;

    // Loop through all natural numbers below z
    for (let i = 1; i < z; i++) {
        // Check if 'i' is a multiple of x OR a multiple of y
        if (i % x === 0 || i % y === 0) {
            sum = sum + i;
        }
    }

    return sum;
}

// Testing with the lab example: multiples of 3 or 5 below 10
let totalSum = sumOfMultiples(3, 5, 10);
console.log("Sum of multiples of 3 or 5 below 10 is: " + totalSum); // Output: 23
