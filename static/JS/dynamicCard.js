document.addEventListener("DOMContentLoaded", () => {
  const incidents = [
    {
      id: 1,
      title: "Incident 1",
      description:
        "In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before the",
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
          <a href="#" class="response-incident" data-id="${incident.id}">Read more</a>
          </a>
        </div>
      </div>
    </article>`;
    incidentCardsContainer.appendChild(article);
  });
});
