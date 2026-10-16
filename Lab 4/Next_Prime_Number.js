let givenPrime = 11; // Hardcoded prime number
let nextNumber = givenPrime + 1; // Start checking from the next number

while (true) {
    let isPrime = true;

    // Check if nextNumber is divisible by any number from 2 up to nextNumber - 1
    for (let i = 2; i < nextNumber; i++) {
        if (nextNumber % i === 0) {
            isPrime = false; // It is divisible, so not prime
            break;
        }
    }

    // If we found a prime number, print it and stop the loop
    if (isPrime === true) {
        console.log("Given Prime Number: " + givenPrime);
        console.log("The next Prime Number is: " + nextNumber);
        break;
    }

    nextNumber++; // Move to the next number and check again
}
