document.addEventListener("DOMContentLoaded", () => {
  const incidentCardsContainer = document.getElementById("incident-cards");

  fetch("/api/incidents")
    .then((response) => response.json())
    .then((incidents) => {
      if (incidents.error) {
        console.error(incidents.error);
        return;
      }

      incidents.forEach((incident) => {
        const article = document.createElement("article");
        article.innerHTML = `<article>
   <div class="article-wrapper">
                                                  <div class="article-body">
                                                    <h2>${incident.title}</h2>
                                                    <p>${incident.description}</p>
                                                    <a href="#" class="response-incident" data-id="${incident.id}">Response Incident</a>
                                                  </div>
                                                </div>
                                              </article>`;

        incidentCardsContainer.appendChild(article);
      });
    })
    .catch((error) => console.error("Error fetching incidents:", error));
});
