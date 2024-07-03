document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("/logout", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to logout.");
      }

      const data = await response.json();

      // Redirect to the home page or perform any other action upon logout
      window.location.href = "/"; // Redirect to home page
    } catch (error) {
      console.error("Error logging out:", error);
      // Handle error display or logging as needed
    }
  });
});
