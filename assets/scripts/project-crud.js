/**
 * Project CRUD Script
 * Part 3: CRUD Actions (HW5)
 *
 * Handles Create, Update, and Delete operations on localStorage.
 * The "Read" operation is handled by project-loader.js (Load Local button).
 */

// ============== Configuration ==============
const LOCAL_STORAGE_KEY = "ntc-projects-data";

// ============== Default Data with IDs ==============
const DEFAULT_PROJECTS = [
  {
    id: "proj-001",
    title: "GymApp — Fitness Tracker",
    image: "https://picsum.photos/800/450?random=301",
    imageAlt: "GymApp mobile interface with workout tracking features",
    description:
      "Full-stack fitness application built with Flask and React. Optimized database queries reduced load times by 42%. Includes workout logging and progress tracking.",
    tags: "Flask, React, PostgreSQL",
    link: "https://github.com/NicholasTc",
    linkText: "GitHub Repo →",
  },
  {
    id: "proj-002",
    title: "Pollen & Air Quality Widget",
    image: "https://picsum.photos/800/450?random=302",
    imageAlt: "WordPress widget showing pollen and air quality metrics",
    description:
      "WordPress Elementor widget integrating Google APIs for real-time environmental data. Serverless caching improved performance by 38%.",
    tags: "WordPress, APIs, JavaScript",
    link: "#",
    linkText: "Live Site →",
  },
  {
    id: "proj-003",
    title: "AI Resume Parser",
    image: "https://picsum.photos/800/450?random=303",
    imageAlt: "Resume parsing tool with AI-powered extraction",
    description:
      "Python tool using OpenAI for intelligent resume parsing. Achieves 85% accuracy across PDF, DOCX, and plain text formats.",
    tags: "Python, OpenAI, NLP",
    link: "https://github.com/NicholasTc",
    linkText: "View Code →",
  },
  {
    id: "proj-004",
    title: "Accessible Weather Dashboard",
    image: "https://picsum.photos/800/450?random=304",
    imageAlt:
      "Weather dashboard with accessible charts and keyboard navigation",
    description:
      "WCAG 2.1 AA compliant weather widget with ARIA-labeled charts. Fully keyboard navigable with screen reader support.",
    tags: "JavaScript, A11y, ARIA",
    link: "#",
    linkText: "Demo →",
  },
];

// ============== DOM Elements ==============
let projectsList = null;
let createForm = null;
let updateForm = null;
let deleteForm = null;
let updateSelect = null;
let deleteSelect = null;
let refreshListBtn = null;

// ============== Helper Functions ==============

/**
 * Generate a unique ID for new projects
 */
function generateId() {
  return (
    "proj-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  );
}

/**
 * Get projects from localStorage
 */
function getProjects() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    // Initialize with default data if empty
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
    return [...DEFAULT_PROJECTS];
  }

  try {
    const projects = JSON.parse(data);
    // Ensure all projects have IDs (migration for old data)
    let needsUpdate = false;
    projects.forEach((project, index) => {
      if (!project.id) {
        project.id = generateId();
        needsUpdate = true;
      }
    });
    if (needsUpdate) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
    }
    return projects;
  } catch (error) {
    console.error("[CRUD] Error parsing localStorage:", error);
    return [];
  }
}

/**
 * Save projects to localStorage
 */
function saveProjects(projects) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
}

/**
 * Show status message
 */
function showStatus(elementId, message, type) {
  const statusEl = document.getElementById(elementId);
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = `form-status form-status--${type}`;
  statusEl.hidden = false;

  // Auto-hide success messages
  if (type === "success") {
    setTimeout(() => {
      statusEl.hidden = true;
    }, 4000);
  }
}

/**
 * Hide status message
 */
function hideStatus(elementId) {
  const statusEl = document.getElementById(elementId);
  if (statusEl) {
    statusEl.hidden = true;
  }
}

// ============== Render Functions ==============

/**
 * Render the projects list
 */
function renderProjectsList() {
  const projects = getProjects();

  if (!projectsList) return;

  if (projects.length === 0) {
    projectsList.innerHTML =
      '<p class="empty-list">No projects found. Create one below!</p>';
    return;
  }

  projectsList.innerHTML = projects
    .map(
      (project, index) => `
      <div class="project-item" data-id="${
        project.id
      }" role="option" tabindex="0">
        <span class="project-item-index">#${index + 1}</span>
        <span class="project-item-title">${escapeHtml(project.title)}</span>
        <span class="project-item-tags">${escapeHtml(project.tags)}</span>
      </div>
    `
    )
    .join("");

  // Update select dropdowns
  updateSelectOptions();
}

/**
 * Update the select dropdown options
 */
function updateSelectOptions() {
  const projects = getProjects();
  const optionsHtml =
    '<option value="">-- Select a project --</option>' +
    projects
      .map(
        (project) =>
          `<option value="${project.id}">${escapeHtml(project.title)}</option>`
      )
      .join("");

  if (updateSelect) {
    updateSelect.innerHTML = optionsHtml;
  }
  if (deleteSelect) {
    deleteSelect.innerHTML = optionsHtml;
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

// ============== CREATE Operation ==============

function handleCreate(event) {
  event.preventDefault();
  hideStatus("createStatus");

  const formData = new FormData(createForm);
  const newProject = {
    id: generateId(),
    title: formData.get("title").trim(),
    image: formData.get("image").trim(),
    imageAlt: formData.get("imageAlt").trim(),
    description: formData.get("description").trim(),
    tags: formData.get("tags").trim(),
    link: formData.get("link").trim(),
    linkText: formData.get("linkText").trim() || "View Project →",
  };

  // Validation
  if (!newProject.title || !newProject.image || !newProject.description) {
    showStatus("createStatus", "Please fill in all required fields.", "error");
    return;
  }

  // Add to localStorage
  const projects = getProjects();
  projects.push(newProject);
  saveProjects(projects);

  // Update UI
  renderProjectsList();
  createForm.reset();

  showStatus(
    "createStatus",
    `✓ Project "${newProject.title}" created successfully!`,
    "success"
  );

  console.log("[CRUD] Created project:", newProject.id);
}

// ============== UPDATE Operation ==============

function handleUpdateSelect() {
  const projectId = updateSelect.value;
  if (!projectId) {
    // Clear form when no project selected
    updateForm.reset();
    return;
  }

  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);

  if (project) {
    // Populate form with project data
    document.getElementById("update-title-input").value = project.title || "";
    document.getElementById("update-image").value = project.image || "";
    document.getElementById("update-image-alt").value = project.imageAlt || "";
    document.getElementById("update-description").value =
      project.description || "";
    document.getElementById("update-tags").value = project.tags || "";
    document.getElementById("update-link").value = project.link || "";
    document.getElementById("update-link-text").value = project.linkText || "";
  }
}

function handleUpdate(event) {
  event.preventDefault();
  hideStatus("updateStatus");

  const projectId = updateSelect.value;
  if (!projectId) {
    showStatus("updateStatus", "Please select a project to update.", "error");
    return;
  }

  const formData = new FormData(updateForm);
  const updatedData = {
    title: formData.get("title").trim(),
    image: formData.get("image").trim(),
    imageAlt: formData.get("imageAlt").trim(),
    description: formData.get("description").trim(),
    tags: formData.get("tags").trim(),
    link: formData.get("link").trim(),
    linkText: formData.get("linkText").trim() || "View Project →",
  };

  // Validation
  if (!updatedData.title || !updatedData.image || !updatedData.description) {
    showStatus("updateStatus", "Please fill in all required fields.", "error");
    return;
  }

  // Update in localStorage
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === projectId);

  if (index === -1) {
    showStatus("updateStatus", "Project not found.", "error");
    return;
  }

  // Preserve the ID, update other fields
  projects[index] = { ...projects[index], ...updatedData };
  saveProjects(projects);

  // Update UI
  renderProjectsList();

  showStatus(
    "updateStatus",
    `✓ Project "${updatedData.title}" updated successfully!`,
    "success"
  );

  console.log("[CRUD] Updated project:", projectId);
}

// ============== DELETE Operation ==============

function handleDeleteSelect() {
  const projectId = deleteSelect.value;
  const previewEl = document.getElementById("deletePreview");
  const previewTitleEl = document.getElementById("deletePreviewTitle");

  if (!projectId) {
    previewEl.hidden = true;
    return;
  }

  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);

  if (project) {
    previewTitleEl.textContent = project.title;
    previewEl.hidden = false;
  }
}

function handleDelete(event) {
  event.preventDefault();
  hideStatus("deleteStatus");

  const projectId = deleteSelect.value;
  if (!projectId) {
    showStatus("deleteStatus", "Please select a project to delete.", "error");
    return;
  }

  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);
  const projectTitle = project ? project.title : "Unknown";

  // Confirm deletion
  const confirmed = confirm(
    `Are you sure you want to delete "${projectTitle}"?\n\nThis action cannot be undone.`
  );

  if (!confirmed) {
    showStatus("deleteStatus", "Deletion cancelled.", "warning");
    return;
  }

  // Remove from localStorage
  const filteredProjects = projects.filter((p) => p.id !== projectId);
  saveProjects(filteredProjects);

  // Update UI
  renderProjectsList();
  deleteForm.reset();
  document.getElementById("deletePreview").hidden = true;

  showStatus(
    "deleteStatus",
    `✓ Project "${projectTitle}" deleted successfully!`,
    "success"
  );

  console.log("[CRUD] Deleted project:", projectId);
}

// ============== Initialize ==============

function init() {
  // Get DOM elements
  projectsList = document.getElementById("projectsList");
  createForm = document.getElementById("createForm");
  updateForm = document.getElementById("updateForm");
  deleteForm = document.getElementById("deleteForm");
  updateSelect = document.getElementById("update-select");
  deleteSelect = document.getElementById("delete-select");
  refreshListBtn = document.getElementById("refreshListBtn");

  // Initialize localStorage if needed
  if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
  }

  // Render initial list
  renderProjectsList();

  // Attach event listeners
  if (createForm) {
    createForm.addEventListener("submit", handleCreate);
  }

  if (updateForm) {
    updateForm.addEventListener("submit", handleUpdate);
  }

  if (updateSelect) {
    updateSelect.addEventListener("change", handleUpdateSelect);
  }

  if (deleteForm) {
    deleteForm.addEventListener("submit", handleDelete);
  }

  if (deleteSelect) {
    deleteSelect.addEventListener("change", handleDeleteSelect);
  }

  if (refreshListBtn) {
    refreshListBtn.addEventListener("click", renderProjectsList);
  }

  console.log("[CRUD] Initialized successfully");
}

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
