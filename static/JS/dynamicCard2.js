document.addEventListener("DOMContentLoaded", () => {
    const incidentCardsContainer = document.getElementById("incident-cards");
  
    function attachEventListeners() {
      document.querySelectorAll(".response-incident").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          const modal = document.getElementById("modal");
          const blurBackground = document.getElementById("blurSection");
          const incidentIdInput = document.getElementById("incident-id");
          const incidentId = button.getAttribute("data-id");
  
          incidentIdInput.value = incidentId;
          modal.style.display = "block";
          blurBackground.classList.add("blurWindow");
        });
      });
    }
  
    function fetchIncidentsAndDisplay() {
      fetch("/api/publicIncidents")
        .then((response) => response.json())
        .then((incidents) => {
          if (incidents.error) {
            console.error(incidents.error);
            return;
          }
          incidents.forEach((incident) => {
            const article = document.createElement("article");
            article.innerHTML = `
              <article>
                <div class="article-wrapper">
                  <div class="article-body">
                    <h2>${incident.title}</h2>
                    <p>${incident.description}</p>
                    <h3>${incident.created_at}</h3>
                    <a href="#" class="response-incident" data-id="${incident.incident_id}">Response Incident</a>
                    <a href="{{url_for('all-responses')}}" class="response-incident" data-id="${incident.incident_id}">View Responses</a>
                  </div>
                </div>
              </article>`;
            incidentCardsContainer.appendChild(article);
          });
          attachEventListeners(); // Attach event listeners after incidents are loaded
        })
        .catch((error) => console.error("Error fetching incidents:", error));
    }
  
    fetchIncidentsAndDisplay(); // Initial fetch and display on page load
  });
  