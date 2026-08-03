import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaGithub, FaGlobe } from "react-icons/fa";
import { SLIDE_BG } from "@/lib/slideBg";
import type { ProjectData } from "@/lib/types";

type Props = {
  project: ProjectData;
  onBack: () => void;
  exiting?: boolean;
};

export default function ProjectDetail({ project, onBack, exiting }: Props) {
  const slides = [project.img, ...(project.screenshots ?? [])];
  const [idx, setIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const go = useCallback(
    (dir: number) => setIdx((i) => (i + dir + slides.length) % slides.length),
    [slides.length],
  );

  // Only slide 0 is the logo cover; it gets padding and its own backdrop.
  const isLogo = idx === 0 && project.coverFit === "contain";
  const label = idx === 0 ? project.title : `${project.title} screenshot ${idx}`;

  // Warm the cache so switching slides doesn't wait on a download.
  useEffect(() => {
    for (const src of slides) {
      const im = new Image();
      im.src = src;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.num]);

  // Capture phase: Escape must close the zoom, not fall through to "back to stages".
  useEffect(() => {
    if (!zoomed) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setZoomed(false);
      } else if (e.key === "ArrowRight") {
        e.stopPropagation();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.stopPropagation();
        go(-1);
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [zoomed, go]);

  return (
    <div className={`project-detail${exiting ? " exiting" : ""}`}>
      <div className="project-detail-header">
        <button className="project-detail-back" onClick={onBack}>
          ◀ BACK TO STAGES
        </button>
      </div>

      <div className="project-detail-hero">
        <div className="project-detail-media">
        {/* Frame is locked to the tallest slide, so moving between slides never
            resizes it (heights used to swing by up to 273px). */}
        <div
          className="project-detail-img"
          style={project.coverAspect ? { aspectRatio: String(project.coverAspect) } : undefined}
        >
          <button
            type="button"
            className="cover-zoom-btn"
            onClick={() => setZoomed(true)}
            aria-label={`Expand ${label}`}
          >
            {/* key: give each slide its own element. Sharing one <img> lets the
                next slide's CSS repaint the PREVIOUS bitmap while it loads. */}
            <img
              key={slides[idx]}
              src={slides[idx]}
              alt={label}
              // Fill the reserved space with this slide's own colour, so it
              // reads as part of the image rather than a letterbox bar.
              style={{ background: idx === 0 ? project.coverBg : SLIDE_BG[slides[idx]] }}
              className={`project-cover-detail${isLogo ? " is-logo" : ""}`}
            />
          </button>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                className="carousel-arrow prev"
                onClick={() => go(-1)}
                aria-label="Previous image"
              >
                ◀
              </button>
              <button
                type="button"
                className="carousel-arrow next"
                onClick={() => go(1)}
                aria-label="Next image"
              >
                ▶
              </button>
            </>
          )}
        </div>

        {/* Dots and counter live below the frame, not on top of it: covers are
            light or dark depending on the project, so a chip over the art always
            read as a bar on something. */}
        {slides.length > 1 && (
          <div className="carousel-bar">
            <div className="carousel-dots">
              {slides.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className={`carousel-dot${i === idx ? " active" : ""}`}
                  onClick={() => setIdx(i)}
                  aria-label={`Go to image ${i + 1} of ${slides.length}`}
                  aria-current={i === idx}
                />
              ))}
            </div>
            <div className="carousel-count">
              {idx + 1} / {slides.length}
            </div>
          </div>
        )}
        </div>
        <div className="project-detail-meta">
          <div className="project-num">STAGE {project.num} · {project.status ?? "CLEARED"}</div>
          <h1 className="project-detail-title">{project.title}</h1>
          <p className="project-detail-desc">{project.desc}</p>
          <div className="project-tags">
            {project.tags.map((tg) => (
              <span key={tg} className="tag">{tg}</span>
            ))}
          </div>
        </div>
      </div>

      {(project.github || project.live) && (
        <div className="project-detail-section reveal d1">
          <h2 className="project-detail-section-title">DEPLOYMENT LINKS</h2>
          <div className="project-detail-links">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
              >
                <FaGithub className="link-icon-svg" />
                <span className="link-label">SOURCE CODE</span>
                <span className="link-arrow">→</span>
              </a>
            )}
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
              >
                {project.favicon ? <img src={project.favicon} alt="" className="link-favicon" /> : <FaGlobe className="link-icon-svg" />}
                <span className="link-label">LIVE DEPLOYMENT</span>
                <span className="link-arrow">→</span>
              </a>
            )}
          </div>
        </div>
      )}

      {project.stats && project.stats.length > 0 && (
        <div className="project-detail-section reveal d2">
          <h2 className="project-detail-section-title">HIGH SCORES</h2>
          <div className="project-detail-stats">
            {project.stats.map((s) => (
              <div key={s.label} className="detail-stat">
                <span className="detail-stat-value">{s.value}</span>
                <span className="detail-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {project.stack && project.stack.length > 0 && (
        <div className="project-detail-section reveal d2">
          <h2 className="project-detail-section-title">TECH LOADOUT</h2>
          <ul className="project-detail-stack">
            {project.stack.map((s) => (
              <li key={s.name} className="stack-item">
                <span className="stack-name">{s.name}</span>
                <span className="stack-dot">·</span>
                <span className="stack-role">{s.role}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {project.features && project.features.length > 0 && (
        <div className="project-detail-section reveal d3">
          <h2 className="project-detail-section-title">FEATURE UNLOCKS</h2>
          <ul className="project-detail-features">
            {project.features.map((f, i) => (
              <li key={i} className="feature-item">
                <span className="feature-star">★</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {project.involvements && project.involvements.length > 0 && (
        <div className="project-detail-section reveal d3">
          <h2 className="project-detail-section-title">INVOLVEMENT LOG</h2>
          <ul className="project-detail-log">
            {project.involvements.map((item, i) => (
              <li key={i} className="project-detail-log-item">
                <span className="log-marker">{String(i + 1).padStart(2, "0")}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {project.collaborators && project.collaborators.length > 0 && (
        <div className="project-detail-section reveal d3">
          <h2 className="project-detail-section-title">CO-OP PLAYERS</h2>
          <ul className="project-detail-collabs">
            {project.collaborators.map((c) => {
              const inner = (
                <>
                  {c.icon && <img src={c.icon} alt="" className="collab-favicon" />}
                  <span className="collab-name">{c.name}</span>
                  {c.role && <span className="collab-role">{c.role}</span>}
                  {/* Favicon stands in for the external-link arrow when present. */}
                  {c.url && !c.icon && <span className="collab-arrow">→</span>}
                </>
              );
              return (
                <li key={c.name} className="collab-item">
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="collab-link">
                      {inner}
                    </a>
                  ) : (
                    <span className="collab-link is-static">{inner}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Portalled to body: an ancestor creates a containing block, which would
          otherwise anchor this `fixed` overlay to the section instead of the viewport. */}
      {zoomed && createPortal(
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setZoomed(false)}
            aria-label="Close"
          >
            ✕
          </button>
          {slides.length > 1 && (
            <>
              <button
                type="button"
                className="carousel-arrow prev"
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                aria-label="Previous image"
              >
                ◀
              </button>
              <button
                type="button"
                className="carousel-arrow next"
                onClick={(e) => { e.stopPropagation(); go(1); }}
                aria-label="Next image"
              >
                ▶
              </button>
            </>
          )}
          {/* Stop clicks on the image itself from closing via the backdrop. */}
          <img
            src={slides[idx]}
            alt={label}
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          {slides.length > 1 && (
            <div className="lightbox-count">
              {idx + 1} / {slides.length}
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
