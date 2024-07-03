import { fetchResponsesAndLog } from "./responsesviews.js";
document.addEventListener("DOMContentLoaded", () => {
  const incidentCardsContainer = document.getElementById("incident-cards");

  function attachEventListeners() {
    // Event listener for response buttons
    document.querySelectorAll(".response-incident").forEach((button) => {
      button.addEventListener("click", handleResponseIncidentButtonClick);
    });

    // Event listener for view responses buttons
    document.querySelectorAll(".view-responses").forEach((button) => {
      button.addEventListener("click", handleViewResponsesButtonClick);
    });
  }

  function handleResponseIncidentButtonClick(event) {
    event.preventDefault();
    const modal = document.getElementById("modal");
    const blurBackground = document.getElementById("blurSection");
    const incidentIdInput = document.getElementById("incident-id");
    const incidentId = event.target.getAttribute("data-id");

    incidentIdInput.value = incidentId;
    modal.style.display = "block";
    blurBackground.classList.add("blurWindow");
  }

  function handleViewResponsesButtonClick(event) {
    event.preventDefault();
    const incidentId = event.target.getAttribute("data-id");
    const viewModal = document.getElementById("viewModal");
    const blurBackground = document.getElementById("blurSection");

    // Call the fetchResponsesAndLog function from responsesviews.js with incidentId

    fetchResponsesAndLog(incidentId);
    viewModal.style.display = "block";
    blurBackground.classList.add("blurWindow");
  }

  function fetchIncidentsAndDisplay() {
    fetch("/api/publicIncidents") // Fetch from the updated endpoint
      .then((response) => response.json())
      .then((incidents) => {
        if (incidents.error) {
          console.error(incidents.error);
          return;
        }

        // Get the user ID from the session or another appropriate source
        const currentUserId = getCurrentUserId(); // Implement this function as per your setup

        // Filter incidents to exclude those created by the current user
        const filteredIncidents = incidents.filter(
          (incident) => incident.user_id !== currentUserId
        );

        // Display filtered incidents
        filteredIncidents.forEach((incident) => {
          const article = document.createElement("article");
          article.innerHTML = `
              <div class="article-wrapper">
                <div class="article-body">
                  <h2>${incident.title}</h2>
                  <p>${incident.description}</p>
                  <p class="createdAt">${incident.created_at}</p>
                  <div class="viwe-response-btn"> 
                    <a href="#" class="response-incident" data-id="${incident.incident_id}">Response Incident</a>
                    <a href="#" class="view-responses" data-id="${incident.incident_id}">View Responses</a>
                  </div>   
                </div>
              </div>`;
          incidentCardsContainer.appendChild(article);
        });

        attachEventListeners(); // Attach event listeners after incidents are loaded
      })
      .catch((error) => console.error("Error fetching incidents:", error));
  }

  fetchIncidentsAndDisplay(); // Initial fetch and display on page load

  // Function to get current user ID from session or another source
  function getCurrentUserId() {
    // Implement this function based on how you store and retrieve session data
    // For example, you might fetch it from a hidden input in your HTML or a global JS variable
    // This depends on your specific frontend setup and how user data is managed
    return parseInt(sessionStorage.getItem("user_id")); // Example: fetching from sessionStorage
  }
});
