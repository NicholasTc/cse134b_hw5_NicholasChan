/**
 * <project-card> Custom Element
 * 
 * A reusable card component for displaying project information.
 * Uses Shadow DOM for encapsulation and CSS custom properties for theming.
 * 
 * Attributes:
 * - title: Project title (required)
 * - image: Image URL for the project thumbnail
 * - image-alt: Alt text for the image (required for accessibility)
 * - description: Short project description
 * - link: URL for the "Learn More" button
 * - link-text: Custom text for the link (default: "Learn More →")
 * - tags: Comma-separated list of technology tags
 */
class ProjectCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['title', 'image', 'image-alt', 'description', 'link', 'link-text', 'tags'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const title = this.getAttribute('title') || 'Untitled Project';
    const image = this.getAttribute('image') || '';
    const imageAlt = this.getAttribute('image-alt') || `Screenshot of ${title}`;
    const description = this.getAttribute('description') || '';
    const link = this.getAttribute('link') || '#';
    const linkText = this.getAttribute('link-text') || 'Learn More →';
    const tags = this.getAttribute('tags') ? this.getAttribute('tags').split(',').map(t => t.trim()) : [];

    this.shadowRoot.innerHTML = `
      <style>
        /* ========== CSS Custom Properties (inherited from host) ========== */
        :host {
          /* Inherit theme variables from the document */
          --card-bg: var(--surface, #0f172a);
          --card-text: var(--text, #e5e7eb);
          --card-muted: var(--muted, #94a3b8);
          --card-line: var(--line, #1f2a3b);
          --card-accent: var(--accent, #60a5fa);
          --card-radius: var(--radius, 16px);
          --card-shadow: var(--shadow, 0 18px 50px rgba(2, 6, 23, 0.35));
          
          display: block;
          contain: layout;
        }

        /* ========== Card Container ========== */
        .card {
          background: var(--card-bg);
          border: 1px solid color-mix(in oklab, var(--card-line) 60%, transparent);
          border-radius: var(--card-radius);
          overflow: hidden;
          box-shadow: var(--card-shadow);
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 60px rgba(2, 6, 23, 0.45);
        }

        /* ========== Image Container with <picture> ========== */
        .thumbnail {
          margin: 0;
          padding: 0;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-bottom: 1px solid color-mix(in oklab, var(--card-line) 60%, transparent);
          position: relative;
        }

        .thumbnail picture {
          display: block;
          width: 100%;
          height: 100%;
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .card:hover .thumbnail img {
          transform: scale(1.03);
        }

        /* Placeholder when no image provided */
        .thumbnail.no-image {
          background: linear-gradient(135deg, 
            color-mix(in oklab, var(--card-accent) 20%, transparent),
            color-mix(in oklab, var(--card-accent) 5%, transparent)
          );
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .placeholder-icon {
          font-size: 3rem;
          opacity: 0.4;
          color: var(--card-muted);
        }

        /* ========== Card Body (Flexbox Layout) ========== */
        .body {
          padding: 1rem 1.125rem;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 0.5rem;
        }

        /* ========== Title (h2) ========== */
        h2 {
          margin: 0;
          font-family: var(--font-display, 'Space Grotesk', system-ui, sans-serif);
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.3;
          color: var(--card-text);
          letter-spacing: -0.01em;
        }

        /* ========== Tags ========== */
        .tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin: 0.25rem 0;
        }

        .tag {
          font-size: 0.75rem;
          color: var(--card-muted);
          border: 1px solid color-mix(in oklab, var(--card-line) 60%, transparent);
          padding: 0.25rem 0.625rem;
          border-radius: 999px;
          background: color-mix(in oklab, var(--card-bg) 80%, transparent);
        }

        /* ========== Description ========== */
        .description {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--card-muted);
          flex: 1;
        }

        /* ========== Link/CTA ========== */
        .cta {
          margin-top: auto;
          padding-top: 0.75rem;
        }

        .cta a {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.625rem 1rem;
          border-radius: 999px;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          color: var(--card-text);
          background: color-mix(in oklab, var(--card-accent) 15%, transparent);
          border: 1px solid color-mix(in oklab, var(--card-accent) 35%, transparent);
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
        }

        .cta a:hover {
          background: color-mix(in oklab, var(--card-accent) 25%, transparent);
          border-color: color-mix(in oklab, var(--card-accent) 55%, transparent);
          transform: translateY(-1px);
        }

        .cta a:focus-visible {
          outline: 2px solid var(--card-accent);
          outline-offset: 2px;
        }

        /* ========== Responsive Adjustments ========== */
        @media (max-width: 620px) {
          .body {
            padding: 0.875rem 1rem;
          }

          h2 {
            font-size: 1.125rem;
          }
        }

        /* ========== Reduced Motion ========== */
        @media (prefers-reduced-motion: reduce) {
          .card,
          .thumbnail img,
          .cta a {
            transition: none;
          }

          .card:hover {
            transform: none;
          }

          .card:hover .thumbnail img {
            transform: none;
          }
        }
      </style>

      <article class="card">
        <figure class="thumbnail ${!image ? 'no-image' : ''}">
          ${image ? `
            <picture>
              <source 
                type="image/webp" 
                srcset="${image.replace(/\.(jpg|jpeg|png)$/i, '.webp')} 800w"
              >
              <img 
                src="${image}" 
                alt="${imageAlt}"
                width="800"
                height="450"
                loading="lazy"
              >
            </picture>
          ` : `
            <span class="placeholder-icon" aria-hidden="true">📁</span>
          `}
        </figure>

        <div class="body">
          <h2>${title}</h2>
          
          ${tags.length > 0 ? `
            <div class="tags" role="list" aria-label="Technologies used">
              ${tags.map(tag => `<span class="tag" role="listitem">${tag}</span>`).join('')}
            </div>
          ` : ''}

          ${description ? `<p class="description">${description}</p>` : ''}

          <div class="cta">
            <a href="${link}" ${link.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>
              ${linkText}
            </a>
          </div>
        </div>
      </article>
    `;
  }
}

// Register the custom element
customElements.define('project-card', ProjectCard);

