import { registerUser, loginUser, logoutUser } from "./src/services/authService.js";

async function test() {
  try {
    const newUser = await registerUser("elder1@example.com", "Password123!", "elder");
    console.log("Registered:", newUser.uid);

    const loggedInUser = await loginUser("elder1@example.com", "Password123!");
    console.log("Logged in as:", loggedInUser.uid);

    await logoutUser();
    console.log("User logged out");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
