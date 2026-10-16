// 1. Absolute Value Method (abs)
function absMe() {
    if (arguments.length === 0) {
        return 0;
    }
    if (arguments.length === 1) {
        return Math.abs(arguments[0]);
    }

    let result = [];
    for (let i = 0; i < arguments.length; i++) {
        result.push(Math.abs(arguments[i]));
    }
    return result;
}

// 2. Ceiling Method (ceil)
function ceilMe() {
    if (arguments.length === 0) {
        return 0;
    }
    if (arguments.length === 1) {
        return Math.ceil(arguments[0]);
    }

    let result = [];
    for (let i = 0; i < arguments.length; i++) {
        result.push(Math.ceil(arguments[i]));
    }
    return result;
}

// 3. Floor Method (floor)
function floorMe() {
    if (arguments.length === 0) {
        return 0;
    }
    if (arguments.length === 1) {
        return Math.floor(arguments[0]);
    }

    let result = [];
    for (let i = 0; i < arguments.length; i++) {
        result.push(Math.floor(arguments[i]));
    }
    return result;
}

// Testing Task #5 methods
console.log("abs:", absMe(), "|", absMe(-5), "|", absMe(-4.7, -2.1));
console.log("ceil:", ceilMe(), "|", ceilMe(4.2), "|", ceilMe(4.2, 7.1));
console.log("floor:", floorMe(), "|", floorMe(4.8), "|", floorMe(4.8, 7.9));
