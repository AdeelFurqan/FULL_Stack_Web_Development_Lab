async function fetchUser() {
  try {
    // Simulating an API call with a 1-second delay
    const userObject = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const isSuccess = true; // Change this to false to test the error message
        
        if (isSuccess) {
          resolve({ id: 1, name: "Test User", email: "test@example.com" });
        } else {
          reject(new Error("Unsuccessful fetching"));
        }
      }, 1000);
    });
    
    return userObject;
    
  } catch (error) {
    return error; 
  }
}

fetchUser().then(result => console.log("Task 1 Result:", result));
