/**
 * Project Loader Script
 * Part 2: Data Loading (HW5)
 *
 * Handles loading project data from:
 * - localStorage (Load Local button)
 * - JSONBin API (Load Remote button)
 *
 * Uses the fetch() API for remote requests.
 */

// ============== Configuration ==============
const JSONBIN_BIN_ID = "69329106d0ea881f40142e11";
const JSONBIN_API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`;
const JSONBIN_API_KEY =
  "$2a$10$WG.hF3jo444/Jl.6ZjO5j.groaAbea2j77mVMJwfxPtMPjNGdPTya";
const LOCAL_STORAGE_KEY = "ntc-projects-data";

// ============== Local Storage Data (Pre-populated) ==============
// This data is slightly different from remote to demonstrate both sources work independently
// Each project has a unique ID for CRUD operations
const DEFAULT_LOCAL_PROJECTS = [
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

// ============== Initialize localStorage on first visit ==============
function initializeLocalStorage() {
  if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(DEFAULT_LOCAL_PROJECTS)
    );
    console.log(
      "[Project Loader] Initialized localStorage with default projects"
    );
  }
}

// ============== DOM Elements ==============
let projectsContainer = null;
let loadLocalBtn = null;
let loadRemoteBtn = null;
let statusMessage = null;

// ============== Loading Spinner ==============
/**
 * Shows the loading spinner in the container
 */
function showLoadingSpinner() {
  if (!projectsContainer) return;
  projectsContainer.innerHTML = `
    <div class="loading-spinner" role="status" aria-label="Loading projects">
      <div class="spinner" aria-hidden="true"></div>
      <p>Loading projects...</p>
    </div>
  `;
}

// ============== Render Projects ==============
/**
 * Clears the container and renders project cards from data array
 * @param {Array} projects - Array of project objects
 * @param {string} source - Data source label ('local' or 'remote')
 */
function renderProjects(projects, source) {
  if (!projectsContainer) {
    console.error("[Project Loader] Projects container not found");
    return;
  }

  // Clear existing cards (including spinner)
  projectsContainer.innerHTML = "";

  if (!projects || projects.length === 0) {
    projectsContainer.innerHTML =
      '<p class="no-projects">No projects found. Try loading from a different source.</p>';
    return;
  }

  // Create project cards with staggered animation
  projects.forEach((project, index) => {
    const card = document.createElement("project-card");

    // Set attributes from project data
    card.setAttribute("title", project.title || "Untitled Project");
    card.setAttribute("image", project.image || "");
    card.setAttribute(
      "image-alt",
      project.imageAlt || `Screenshot of ${project.title}`
    );
    card.setAttribute("description", project.description || "");
    card.setAttribute("tags", project.tags || "");
    card.setAttribute("link", project.link || "#");
    card.setAttribute("link-text", project.linkText || "Learn More →");

    projectsContainer.appendChild(card);
  });

  // Update status message
  updateStatus(`Loaded ${projects.length} projects from ${source}`, "success");
  console.log(
    `[Project Loader] Rendered ${projects.length} projects from ${source}`
  );
}

// ============== Load from localStorage ==============
/**
 * Fetches project data from localStorage and renders cards
 */
function loadFromLocal() {
  updateStatus("Loading from local storage...", "loading");
  showLoadingSpinner();

  // Small delay to show spinner (localStorage is instant, but we want visual feedback)
  setTimeout(() => {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (!data) {
        updateStatus("No local data found. Initializing...", "warning");
        initializeLocalStorage();
        const newData = localStorage.getItem(LOCAL_STORAGE_KEY);
        const projects = JSON.parse(newData);
        renderProjects(projects, "localStorage");
        return;
      }

      const projects = JSON.parse(data);

      if (!Array.isArray(projects)) {
        throw new Error("Invalid data format in localStorage");
      }

      renderProjects(projects, "localStorage");
    } catch (error) {
      console.error("[Project Loader] Error loading from localStorage:", error);
      updateStatus(`Error loading local data: ${error.message}`, "error");
    }
  }, 300); // Brief delay for visual feedback
}

// ============== Load from JSONBin (Remote) ==============
/**
 * Fetches project data from JSONBin API using fetch() and renders cards
 */
async function loadFromRemote() {
  updateStatus("Fetching from remote server...", "loading");
  showLoadingSpinner();

  try {
    const response = await fetch(JSONBIN_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    // JSONBin wraps data in a 'record' property
    const projects = result.record;

    if (!Array.isArray(projects)) {
      throw new Error("Invalid data format from remote server");
    }

    renderProjects(projects, "JSONBin (remote)");
  } catch (error) {
    console.error("[Project Loader] Error loading from remote:", error);
    updateStatus(`Error loading remote data: ${error.message}`, "error");
    // Clear spinner on error
    if (projectsContainer) {
      projectsContainer.innerHTML =
        '<p class="no-projects">Failed to load projects. Please try again.</p>';
    }
  }
}

// ============== Status Message ==============
/**
 * Updates the status message display
 * @param {string} message - Status message text
 * @param {string} type - Message type ('loading', 'success', 'error', 'warning')
 */
function updateStatus(message, type) {
  if (!statusMessage) return;

  statusMessage.textContent = message;
  statusMessage.className = `load-status load-status--${type}`;
  statusMessage.hidden = false;

  // Auto-hide success messages after 3 seconds
  if (type === "success") {
    setTimeout(() => {
      statusMessage.hidden = true;
    }, 3000);
  }
}

// ============== Initialize ==============
function init() {
  // Get DOM elements
  projectsContainer = document.getElementById("projectCardsContainer");
  loadLocalBtn = document.getElementById("loadLocalBtn");
  loadRemoteBtn = document.getElementById("loadRemoteBtn");
  statusMessage = document.getElementById("loadStatus");

  if (!projectsContainer) {
    console.error("[Project Loader] Could not find #projectCardsContainer");
    return;
  }

  // Initialize localStorage with default data if empty
  initializeLocalStorage();

  // Attach event listeners
  if (loadLocalBtn) {
    loadLocalBtn.addEventListener("click", loadFromLocal);
  }

  if (loadRemoteBtn) {
    loadRemoteBtn.addEventListener("click", loadFromRemote);
  }

  console.log("[Project Loader] Initialized successfully");
}

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Export functions for potential external use
export { loadFromLocal, loadFromRemote, renderProjects };
