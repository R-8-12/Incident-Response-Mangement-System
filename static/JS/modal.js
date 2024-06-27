document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const actionButton = document.getElementById("btnDiv");
  const blurBackground = document.getElementById("blurSection");

  actionButton.addEventListener("click", () => {
    modal.style.display = "none";
    blurBackground.classList.remove("blurWindow");
  });
});
