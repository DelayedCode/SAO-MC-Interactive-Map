document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("status");
  if (status) {
    status.textContent = "Patchnotes module ready. We can add changelog parsing and filters later.";
  }
});
