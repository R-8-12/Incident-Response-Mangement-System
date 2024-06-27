document.addEventListener("DOMContentLoaded", () => {
  const incidents = [
    {
      id: 1,
      title: "Incident 1",
      description: "Incident 1 description",
      status: "Reported",
      user_id: 1,
      user_email: "user1@example.com",
    },
    {
      id: 2,
      title: "Incident 2",
      description: "Incident 2 description",
      status: "Reported",
      user_id: 2,
      user_email: "user2@example.com",
    },
    {
      id: 3,
      title: "Incident 3",
      description: "Incident 3 description",
      status: "Reported",
      user_id: 3,
      user_email: "user3@example.com",
    },
  ];

  const incidentCardsContainer = document.getElementById("incident-cards");

  // Generate cards dynamically
  incidents.forEach((incident) => {
    const article = document.createElement("article");
    article.innerHTML = `
    <article>
      <div class="article-wrapper">
        <div class="article-body">
          <h2>${incident.title}</h2>
          <p>${incident.description}</p>
          <a href="#" class="response-incident" data-id="${incident.id}" data-description="${incident.description}">
            Read more <span class="sr-only">about this is some title</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </article>`;
    incidentCardsContainer.appendChild(article);
  });

  // Modal functionality
  const modal = document.getElementById("modal");
  const closeButton = document.querySelector(".close-button");
  const incidentDescription = document.getElementById("incident-description");

  document.querySelectorAll(".response-incident").forEach(button => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const description = button.getAttribute("data-description");
      incidentDescription.value = description;
      modal.style.display = "block";
    });
  });

  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});
