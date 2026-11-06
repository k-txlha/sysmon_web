import { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/common";
import { marked, Renderer } from "marked";
import handbookSource from "./content/handbook.md?raw";
import installationSource from "./content/getting-started.md?raw";
import { docsConfig } from "./docs/config";
import { docsCategories, docsPages, type FlatDocsPage } from "./docs/pages";
import "./docs.css";
import "highlight.js/styles/github.css";

interface DocumentHeading {
  id: string;
  title: string;
  depth: number;
}

interface RenderedDocument {
  html: string;
  headings: DocumentHeading[];
}

interface HandbookChapter {
  title: string;
  content: string;
}

const chapters = parseChapters(handbookSource);
const installPage = docsPages.find((page) => page.source === "installation");
const searchDocuments = docsPages.map((page) => ({
  ...page,
  content: page.source === "installation"
    ? installationSource
    : (page.chapters ?? []).map((chapter) => chapters.get(chapter)?.content ?? "").join("\n\n"),
}));

function parseChapters(source: string): Map<number, HandbookChapter> {
  const headings = [...source.matchAll(/^# (\d+)\. (.+)$/gm)];
  const result = new Map<number, HandbookChapter>();

  headings.forEach((heading, index) => {
    const start = (heading.index ?? 0) + heading[0].length;
    const end = headings[index + 1]?.index ?? source.length;
    const body = source.slice(start, end).replace(/^\r?\n+/, "").replace(/\n+---\s*$/, "").trim();
    result.set(Number(heading[1]), { title: heading[2], content: body });
  });

  return result;
}

function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderDocument(markdown: string): RenderedDocument {
  const headings: DocumentHeading[] = [];
  const usedIds = new Map<string, number>();
  const renderer = new Renderer();

  renderer.heading = function ({ tokens, depth, text }) {
    const headingText = plainText(text);
    const baseId = slugifyHeading(headingText) || "section";
    const nextCount = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, nextCount + 1);
    const id = nextCount === 0 ? baseId : `${baseId}-${nextCount + 1}`;
    const inner = this.parser.parseInline(tokens);
    headings.push({ id, title: headingText, depth });

    return `<h${depth} id="${escapeHtml(id)}">${inner}<a class="doc-heading-anchor" href="#${escapeHtml(id)}" aria-label="Link to ${escapeHtml(headingText)}">#</a></h${depth}>`;
  };

  renderer.code = ({ text, lang }) => {
    const language = lang?.split(/\s+/)[0]?.toLowerCase() ?? "";
    const languageLabel = language || "text";
    const highlighted = language && hljs.getLanguage(language)
      ? hljs.highlight(text, { language }).value
      : escapeHtml(text);

    return `<div class="doc-code"><div class="doc-code-toolbar"><span>${escapeHtml(languageLabel)}</span><button type="button" data-copy-code aria-label="Copy code">Copy</button></div><pre><code class="hljs language-${escapeHtml(languageLabel)}">${highlighted}</code></pre></div>`;
  };

  renderer.blockquote = function ({ tokens }) {
    return `<aside class="doc-callout">${this.parser.parse(tokens)}</aside>`;
  };

  const html = marked.parse(markdown, { gfm: true, async: false, renderer });

  return {
    html: DOMPurify.sanitize(html, {
      ADD_ATTR: ["data-copy-code", "aria-label"],
    }),
    headings,
  };
}

function getPageContent(page: FlatDocsPage): string {
  if (page.source === "installation") return installationSource;
  return (page.chapters ?? [])
    .map((number) => chapters.get(number)?.content)
    .filter((content): content is string => Boolean(content))
    .join("\n\n");
}

function getCurrentPage(pathname: string): FlatDocsPage | undefined {
  const path = pathname.replace(/^\/docs\/?/, "").replace(/\/+$/, "");
  return docsPages.find((page) => page.slug === path);
}

function getCategoryForPage(page: FlatDocsPage | undefined) {
  if (!page) return undefined;
  return docsCategories.find((category) => category.title === page.category);
}

function ProductMark() {
  return (
    <a className="docs-brand" href="/" aria-label={`${docsConfig.productName} home`}>
      <img src="/assets/sysmon-logo.svg" alt="" />
      <span>{docsConfig.productName}</span>
      <i />
      <b>Docs</b>
    </a>
  );
}

function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return searchDocuments
      .map((page) => {
        const searchable = `${page.title} ${page.category} ${page.description} ${plainText(page.content)}`.toLowerCase();
        const matchAt = searchable.indexOf(normalized);
        if (matchAt === -1) return null;

        const text = plainText(page.content);
        const snippetAt = text.toLowerCase().indexOf(normalized);
        const snippetStart = Math.max(0, snippetAt - 55);
        const snippet = snippetAt === -1
          ? page.description
          : `${snippetStart > 0 ? "…" : ""}${text.slice(snippetStart, snippetStart + 130)}${snippetStart + 130 < text.length ? "…" : ""}`;

        return { page, snippet };
      })
      .filter((result): result is { page: typeof searchDocuments[number]; snippet: string } => result !== null)
      .slice(0, 8);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
      return;
    }

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  useEffect(() => setSelectedIndex(0), [query]);

  if (!open) return null;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      setSelectedIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length) {
      event.preventDefault();
      setSelectedIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === "Enter" && results[selectedIndex]) {
      window.location.href = `/docs/${results[selectedIndex].page.slug}`;
    } else if (event.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="docs-search-backdrop" onMouseDown={onClose}>
      <section
        className="docs-search-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="docs-search-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="docs-search-heading" className="visually-hidden">Search documentation</h2>
        <div className="docs-search-input-wrap">
          <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></svg>
          <input
            ref={inputRef}
            aria-label="Search documentation"
            aria-controls="docs-search-results"
            placeholder="Search pages, headings, and content..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" onClick={onClose}>Esc</button>
        </div>
        <div className="docs-search-results" id="docs-search-results" role="listbox" aria-label="Search results">
          {query && results.length === 0 && <p className="docs-search-empty">No matching documentation. Try another term.</p>}
          {!query && <p className="docs-search-empty">Search across the handbook, architecture, and setup guide.</p>}
          {results.map(({ page, snippet }, index) => (
            <a
              className={`docs-search-result${index === selectedIndex ? " is-selected" : ""}`}
              href={`/docs/${page.slug}`}
              key={page.slug}
              role="option"
              aria-selected={index === selectedIndex}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={onClose}
            >
              <span>{page.category} <i>/</i> {page.title}</span>
              <p>{snippet}</p>
            </a>
          ))}
        </div>
        <div className="docs-search-hint"><span>↑↓ navigate</span><span>↵ open</span><span>/ or Ctrl K search</span></div>
      </section>
    </div>
  );
}

function Sidebar({
  currentPage,
  mobileOpen,
  onClose,
}: {
  currentPage?: FlatDocsPage;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const activeCategory = getCategoryForPage(currentPage)?.title;
  const [expanded, setExpanded] = useState<string[]>(activeCategory ? [activeCategory] : ["Introduction", "Getting started"]);

  useEffect(() => {
    if (activeCategory) {
      setExpanded((categories) => categories.includes(activeCategory) ? categories : [...categories, activeCategory]);
    }
  }, [activeCategory]);

  return (
    <>
      {mobileOpen && <button aria-label="Close documentation menu" className="docs-sidebar-scrim" onClick={onClose} type="button" />}
      <aside className={`docs-sidebar${mobileOpen ? " docs-sidebar-open" : ""}`} aria-label="Documentation navigation">
        <button className="docs-sidebar-close" type="button" onClick={onClose}>Close menu <span aria-hidden="true">×</span></button>
        <a className="docs-sidebar-home" href="/docs">Documentation home <span aria-hidden="true">↗</span></a>
        <nav>
          {docsCategories.map((category) => {
            const isExpanded = expanded.includes(category.title);
            const categoryId = `docs-category-${slugifyHeading(category.title)}`;

            return (
              <div className="docs-nav-category" key={category.title}>
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={categoryId}
                  onClick={() => setExpanded((categories) =>
                    isExpanded
                      ? categories.filter((item) => item !== category.title)
                      : [...categories, category.title],
                  )}
                >
                  <span>{category.title}</span><span className="docs-nav-chevron" aria-hidden="true">{isExpanded ? "−" : "+"}</span>
                </button>
                {isExpanded && (
                  <ul id={categoryId}>
                    {category.pages.map((page) => {
                      const isActive = currentPage?.slug === page.slug;

                      return (
                        <li key={page.slug}>
                          <a
                            href={`/docs/${page.slug}`}
                            className={isActive ? "is-active" : ""}
                            aria-current={isActive ? "page" : undefined}
                            onClick={onClose}
                          >
                            {page.title}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
        <p className="docs-sidebar-status"><i /> Development documentation</p>
      </aside>
    </>
  );
}

function TableOfContents({
  headings,
  activeHeading,
}: {
  headings: DocumentHeading[];
  activeHeading: string;
}) {
  const items = headings.filter((heading) => heading.depth > 1);
  if (!items.length) return null;

  return (
    <aside className="docs-toc" aria-label="On this page">
      <p>On this page</p>
      <nav>
        {items.map((heading) => (
          <a
            className={`${heading.depth > 2 ? "toc-nested " : ""}${activeHeading === heading.id ? "is-active" : ""}`}
            href={`#${heading.id}`}
            key={heading.id}
          >
            {heading.title}
          </a>
        ))}
      </nav>
    </aside>
  );
}

function ArchitectureDiagram() {
  const nodes = ["Endpoint agent", "FastAPI gateway", "Kafka", "Processing workers"];

  return (
    <figure className="architecture-diagram">
      <figcaption>Intended telemetry flow</figcaption>
      <div className="architecture-diagram-flow">
        {nodes.map((node) => <div key={node}>{node}</div>)}
      </div>
      <div className="architecture-diagram-branches">
        <span>ClickHouse / telemetry</span>
        <span>Alert storage</span>
        <span>Dashboard</span>
      </div>
      <p>Planned architecture; component and deployment status varies by implementation.</p>
    </figure>
  );
}

function DocumentationHome({
  onSearch,
}: {
  onSearch: () => void;
}) {
  const cards = [
    { page: docsPages.find((item) => item.slug === "introduction/overview")!, number: "01", label: "Understand the platform" },
    { page: docsPages.find((item) => item.slug === "architecture/overview")!, number: "02", label: "Explore the architecture" },
    { page: installPage!, number: "03", label: "Check installation readiness" },
  ];

  return (
    <div className="docs-home">
      <div className="docs-home-eyebrow"><span>DOCUMENTATION / V0.1</span><span>PRODUCT IN DEVELOPMENT</span></div>
      <h1>Everything you need to understand, deploy, and operate {docsConfig.productName}.</h1>
      <p className="docs-home-lede">Technical documentation for the open-source endpoint detection and response platform.</p>
      <button className="docs-home-search" type="button" onClick={onSearch}>
        <span aria-hidden="true">⌕</span><span>Search documentation...</span><kbd>/</kbd>
      </button>
      <div className="docs-home-start">
        <div className="docs-home-section-heading"><div><span className="docs-kicker">START HERE</span><h2>Find your way around.</h2></div><span>03 PATHS</span></div>
        <div className="docs-home-cards">
          {cards.map(({ page, number, label }) => (
            <a className="docs-home-card" href={`/docs/${page.slug}`} key={page.slug}>
              <span className="docs-home-card-number">{number}</span>
              <span className="docs-home-card-label">{label}</span>
              <h3>{page.title}</h3>
              <p>{page.description}</p>
              <span className="docs-home-card-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
      <div className="docs-home-lower">
        <section>
          <span className="docs-kicker">PLATFORM OVERVIEW</span>
          <h2>Visibility, before complexity.</h2>
          <p>SysMon is designed to collect endpoint telemetry, process it centrally, and make system activity easier to investigate in a self-hosted deployment.</p>
          <a href="/docs/architecture/overview">Read the architecture overview <span aria-hidden="true">→</span></a>
          <ArchitectureDiagram />
        </section>
        <aside className="docs-home-note">
          <span>ACCURACY AUDIT</span>
          <h3>Living documentation, verified status.</h3>
          <p>This portal is maintained directly against the repository source code and the master technical audit dated 2026-11-06 (118 verified tests passing). Implementation details, active endpoints, and roadmap milestones are verified against current code.</p>
          <a href="/docs/contributing/documentation-status">How status is reported <span aria-hidden="true">→</span></a>
        </aside>
      </div>
      <div className="docs-home-categories">
        <div className="docs-home-section-heading"><div><span className="docs-kicker">REFERENCE LIBRARY</span><h2>Explore the handbook.</h2></div><span>{docsPages.length} PAGES</span></div>
        <div className="docs-category-grid">
          {docsCategories.filter((category) => category.title !== "Introduction" && category.title !== "Getting started").map((category) => (
            <div className="docs-category-card" key={category.title}>
              <span>{String(docsCategories.indexOf(category) + 1).padStart(2, "0")}</span>
              <h3>{category.title}</h3>
              {category.pages.map((page) => <a href={`/docs/${page.slug}`} key={page.slug}>{page.title}<span aria-hidden="true">→</span></a>)}
            </div>
          ))}
        </div>
      </div>
      <footer className="docs-home-footer">
        <div><span className="docs-kicker">THE PROJECT</span><p>Self-hosted endpoint visibility, actively under development.</p></div>
        {docsConfig.repositoryUrl
          ? <a href={docsConfig.repositoryUrl} target="_blank" rel="noreferrer">View project repository <span aria-hidden="true">↗</span></a>
          : <p className="docs-repo-unavailable">Repository URL has not been configured for this website.</p>}
        <a href="/">Back to the website <span aria-hidden="true">↗</span></a>
      </footer>
    </div>
  );
}

function DocArticle({
  page,
  onCopy,
  copyStatus,
}: {
  page: FlatDocsPage;
  onCopy: (event: React.MouseEvent<HTMLElement>) => void;
  copyStatus: string;
}) {
  const category = getCategoryForPage(page);
  const currentIndex = docsPages.findIndex((item) => item.slug === page.slug);
  const previous = currentIndex > 0 ? docsPages[currentIndex - 1] : undefined;
  const next = currentIndex < docsPages.length - 1 ? docsPages[currentIndex + 1] : undefined;
  const markdown = getPageContent(page).replace(/\bSysMon\b/g, docsConfig.productName);
  const renderedDocument = useMemo(() => renderDocument(markdown), [markdown]);
  const [activeHeading, setActiveHeading] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible[0]) setActiveHeading(visible[0].target.id);
    }, { rootMargin: "-88px 0px -72% 0px", threshold: 0 });

    document.querySelectorAll(".doc-article h2[id], .doc-article h3[id], .doc-article h4[id]").forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [page.slug, renderedDocument.html]);

  return (
    <div className="docs-article-layout">
      <article className="doc-article" onClick={onCopy}>
        <nav className="docs-breadcrumbs" aria-label="Breadcrumb">
          <a href="/docs">Docs</a><span>/</span><span>{category?.title}</span><span>/</span><span aria-current="page">{page.title}</span>
        </nav>
        <header className="doc-article-header">
          <span className="docs-kicker">{category?.title.toUpperCase()} / HANDBOOK</span>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
        </header>
        {page.source === "installation" && (
          <div className="docs-accuracy-callout" role="note">
            <span>✓</span>
            <p><strong>Verified Setup Procedures:</strong> This guide documents the actual startup steps for Kafka KRaft, ClickHouse, Valkey, FastAPI backend, worker consumer, and agent enrollment CLI based on the master technical audit.</p>
          </div>
        )}
        {page.slug === "api-reference/overview" && (
          <div className="docs-accuracy-callout" role="note">
            <span>✓</span>
            <p><strong>FastAPI OpenAPI Inventory:</strong> All 30 mounted operations across 8 routers are documented with their HTTP methods, paths, request headers, bodies, response schemas, and verification statuses.</p>
          </div>
        )}
        {page.slug === "architecture/overview" && <ArchitectureDiagram />}
        <div className="doc-article-content" dangerouslySetInnerHTML={{ __html: renderedDocument.html }} />
        <div className="doc-copy-status" aria-live="polite">{copyStatus}</div>
        <nav className="docs-prev-next" aria-label="Documentation pages">
          {previous ? (
            <a href={`/docs/${previous.slug}`} className="docs-page-nav previous">
              <span>← PREVIOUS</span><strong>{previous.title}</strong><small>{previous.category}</small>
            </a>
          ) : <span />}
          {next && (
            <a href={`/docs/${next.slug}`} className="docs-page-nav next">
              <span>NEXT →</span><strong>{next.title}</strong><small>{next.category}</small>
            </a>
          )}
        </nav>
      </article>
      <TableOfContents headings={renderedDocument.headings} activeHeading={activeHeading} />
    </div>
  );
}

function PageMetadata({ page }: { page?: FlatDocsPage }) {
  useEffect(() => {
    const title = page
      ? `${page.title} — ${docsConfig.productName} Docs`
      : `Documentation — ${docsConfig.productName}`;
    document.title = title;

    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    description.content = page?.description ?? `Technical documentation for ${docsConfig.productName}: architecture, deployment, endpoint agents, security, and operations.`;

    return () => {
      document.title = `${docsConfig.productName} — Visibility, before complexity.`;
      description?.setAttribute("content", `${docsConfig.productName} brings endpoint activity, system telemetry, and security events into one clear view.`);
    };
  }, [page]);

  return null;
}

export default function DocsPortal() {
  const currentPage = getCurrentPage(window.location.pathname);
  const isHome = window.location.pathname.replace(/\/+$/, "") === "/docs";
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping = target instanceof HTMLElement
        && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

      if ((event.key === "/" && !isTyping) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
        event.preventDefault();
        setSearchOpen(true);
      } else if (event.key === "Escape") {
        setSearchOpen(false);
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (window.location.hash && !isHome) {
      const id = decodeURIComponent(window.location.hash.slice(1));
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView(), 0);
    } else {
      mainRef.current?.scrollTo(0, 0);
    }
  }, [currentPage?.slug, isHome]);

  const handleCopy = async (event: React.MouseEvent<HTMLElement>) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-copy-code]");
    if (!button) return;

    const codeElement = button.closest(".doc-code")?.querySelector("pre code");
    const code = codeElement?.textContent;
    if (!code) {
      setCopyStatus("No code found to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus("Code copied to clipboard.");
      button.textContent = "Copied";
    } catch {
      const selection = document.createElement("textarea");
      selection.value = code;
      selection.setAttribute("readonly", "");
      selection.className = "doc-copy-fallback";
      document.body.appendChild(selection);
      selection.select();
      const copied = document.execCommand("copy");
      selection.remove();

      if (copied) {
        setCopyStatus("Code copied to clipboard.");
        button.textContent = "Copied";
      } else {
        if (codeElement) {
          const range = document.createRange();
          range.selectNodeContents(codeElement);
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(range);
        }
        setCopyStatus("Clipboard access is unavailable. Select and copy the code manually.");
        button.textContent = "Select code";
      }
    }
  };

  return (
    <div className="docs-portal">
      <PageMetadata page={currentPage} />
      <header className="docs-topbar">
        <ProductMark />
        <div className="docs-topbar-right">
          <nav className="docs-topbar-nav" aria-label="Main site sections">
            <a href="/product">Product</a>
            <a href="/features">Features</a>
            <a href="/architecture">Architecture</a>
            <a href="/roadmap">Roadmap</a>
          </nav>
          <button className="docs-search-trigger" onClick={() => setSearchOpen(true)} type="button">
            <span aria-hidden="true">⌕</span><span>Search documentation...</span><kbd>/</kbd>
          </button>
          <a className="docs-return-link" href="/">Website <span aria-hidden="true">↗</span></a>
          <button className="docs-menu-trigger" type="button" aria-expanded={mobileSidebarOpen} onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
            <span aria-hidden="true">☰</span> Menu
          </button>
        </div>
      </header>
      <div className="docs-shell">
        <Sidebar currentPage={currentPage} mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
        <main className="docs-main" ref={mainRef}>
          {isHome
            ? <DocumentationHome onSearch={() => setSearchOpen(true)} />
            : currentPage
              ? <DocArticle page={currentPage} onCopy={handleCopy} copyStatus={copyStatus} />
              : (
                <section className="docs-not-found">
                  <span className="docs-kicker">404 / PAGE NOT FOUND</span>
                  <h1>This page isn’t in the handbook.</h1>
                  <p>Choose a topic from the documentation navigation or return to the overview.</p>
                  <a className="docs-primary-link" href="/docs">Go to documentation home <span aria-hidden="true">→</span></a>
                </section>
              )}
        </main>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
