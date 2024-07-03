// Function to fetch responses for a specific incident ID and log them
function fetchResponsesAndLog(incidentId) {
  fetch(`/api/responses/${incidentId}`)
      .then((response) => response.json())
      .then((data) => {
          if (data.error) {
              console.error(data.error);
              return;
          }
          const responses = data.responses;
          console.log("Fetched responses for Incident ID:", incidentId);
          console.log(responses); // Log responses data
      })
      .catch((error) => console.error("Error fetching responses:", error));
}

export { fetchResponsesAndLog }; // Exporting the function
