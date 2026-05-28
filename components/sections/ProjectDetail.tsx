import { FaGithub, FaGlobe } from "react-icons/fa";
import type { ProjectData } from "@/lib/types";

type Props = {
  project: ProjectData;
  onBack: () => void;
  exiting?: boolean;
};

export default function ProjectDetail({ project, onBack, exiting }: Props) {
  return (
    <div className={`project-detail${exiting ? " exiting" : ""}`}>
      <div className="project-detail-header">
        <button className="project-detail-back" onClick={onBack}>
          ◀ BACK TO STAGES
        </button>
      </div>

      <div className="project-detail-hero">
        <div className="project-detail-img">
          <img src={project.img} alt={project.title} className="project-cover-detail" />
        </div>
        <div className="project-detail-meta">
          <div className="project-num">STAGE {project.num} · CLEARED</div>
          <h1 className="project-detail-title">{project.title}</h1>
          <p className="project-detail-desc">{project.desc}</p>
          <div className="project-tags">
            {project.tags.map((tg) => (
              <span key={tg} className="tag">{tg}</span>
            ))}
          </div>
        </div>
      </div>

      {project.involvements && project.involvements.length > 0 && (
        <div className="project-detail-section reveal d2">
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

      <div className="project-detail-section reveal d3">
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
    </div>
  );
}
