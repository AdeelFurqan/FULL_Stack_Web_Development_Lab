async function fetchUser() {
  try {
    // 1. Fetch data from a dummy API
    const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
    
    // 2. Check if the response was successful
    if (!response.ok) {
      throw new Error("Unsuccessful fetching");
    }
    
    // 3. Return the valid user object
    const userObject = await response.json();
    return userObject; 
    
  } catch (error) {
    // 4. Return an error on unsuccessful fetching
    return error; 
  }
}

// Example usage:
fetchUser().then(result => console.log(result));
