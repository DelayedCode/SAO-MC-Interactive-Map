(() => {
  "use strict";

  function bindDropdown(wrapper) {
    const select = wrapper.querySelector("select");
    if (!select || wrapper.dataset.dropdownBound === "true") return;

    wrapper.dataset.dropdownBound = "true";
    select.addEventListener("pointerdown", () => {
      wrapper.classList.toggle("is-open");
    });
    select.addEventListener("blur", () => {
      wrapper.classList.remove("is-open");
    });
    select.addEventListener("change", () => {
      wrapper.classList.remove("is-open");
    });
  }

  function bindDropdowns() {
    document.querySelectorAll(".sao-select-wrap").forEach(bindDropdown);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindDropdowns, { once: true });
  } else {
    bindDropdowns();
  }
})();
