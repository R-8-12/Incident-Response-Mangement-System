let responses = []; // Array to store fetched responses
let currentIndex = 0; // Index to track current response

// Function to fetch responses for a specific incident ID and store them
function fetchResponsesAndLog(incidentId) {
  fetch(`/api/responses/${incidentId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }
      responses = data.responses; // Store responses in the array
      // Display responses initially
      displayResponse(currentIndex);
    })
    .catch((error) => console.error("Error fetching responses:", error));
}

// Function to display response at a given index
function displayResponse(index) {
  const responsesContainer = document.getElementById("incidentResponses");
  responsesContainer.innerHTML = ""; // Clear previous response

  if (responses.length === 0) {
    responsesContainer.innerHTML = "<p>No responses found</p>";
    return;
  }

  const response = responses[index];
  const responseElement = document.createElement("div");
  responseElement.classList.add("response-item");
  responseElement.innerHTML = `<div class="response-description">
  <p>
    <span class="response-description-head">Response: </span>${response.description}
  </p>
</div>
<div class="response-meta">
  <p>
    <span class="response-description-head">Responder: </span
    >${response.responder_username}
  </p>
  <p>
    <span class="response-description-head">Created At: </span
    >${response.created_at}
  </p>
</div>
`;
  responsesContainer.appendChild(responseElement);
}

// Event listener for previous button
document.getElementById("prev").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    displayResponse(currentIndex);
  }
});

// Event listener for next button
document.getElementById("next").addEventListener("click", () => {
  if (currentIndex < responses.length - 1) {
    currentIndex++;
    displayResponse(currentIndex);
  }
});

// Close button event listener
document.getElementById("viewCancelBtn").addEventListener("click", () => {
  const viewModal = document.getElementById("viewModal");
  const blurBackground = document.getElementById("blurSection");
  viewModal.style.display = "none";
  blurBackground.classList.remove("blurWindow");
});

export { fetchResponsesAndLog }; // Exporting the function
