document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const actionButton = document.getElementById("btnDiv");
  const blurBackground = document.getElementById("blurSection");

  document.querySelectorAll(".response-incident").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      modal.style.display = "block";
      blurBackground.classList.add("blurWindow");
    });

    actionButton.addEventListener("click", () => {
      modal.style.display = "none";
      blurBackground.classList.remove("blurWindow");
    });
  });
});
