function toggleDropdown(event) {
  event.preventDefault();
  const parent = event.currentTarget.parentElement;
  const dropdown = parent.querySelector(".sidebar-dropdown");
  const arrow = parent.querySelector(".arrow-icon");

  if (dropdown.classList.contains("open")) {
    dropdown.style.height = "0px";
    dropdown.classList.remove("open");
    arrow.classList.remove("rotate");
  } else {
    dropdown.style.height = dropdown.scrollHeight + "px";
    dropdown.classList.add("open");
    arrow.classList.add("rotate");
  }
}
