import { type ComponentType } from "react";
import {
  SiPython, SiTypescript, SiKotlin, SiJavascript,
  SiNextdotjs, SiFastapi, SiSvelte, SiNuxt, SiApacheairflow,
  SiScikitlearn, SiPandas, SiLangchain, SiLanggraph,
  SiDocker, SiPostgresql, SiMysql, SiGooglecloud,
  SiMongodb, SiGooglebigquery, SiFirebase, SiSupabase,
  SiCplusplus, SiGit, SiN8N, SiLooker, SiPhp, SiLua,
  SiVuedotjs, SiExpress, SiTailwindcss, SiDaisyui, SiVite,
} from "react-icons/si";
import { FaAws, FaDatabase, FaCloud, FaJava, FaCode } from "react-icons/fa";
import SectionShell from "./SectionShell";

const SKILLS = [
  {
    name: "LANGUAGES",
    items: [
      ["Python", 90], ["SQL", 90], ["TypeScript", 85],
      ["JavaScript", 85], ["Kotlin", 80], ["Java", 80],
      ["PHP", 80], ["Lua", 70], ["C++", 60],
      ["C#", 50], ["Svelte", 40],
    ] as [string, number][],
  },
  {
    name: "FRAMEWORKS",
    items: [
      ["Next.js", 80], ["Nuxt", 80], ["Tailwind CSS", 80],
      ["FastAPI", 70], ["Apache Airflow", 70], ["Vue", 65],
      ["Express.js", 65], ["SvelteKit", 40],
    ] as [string, number][],
  },
  {
    name: "INFRASTRUCTURE",
    items: [
      ["GCP", 80], ["Supabase", 80], ["Firebase", 75],
      ["AWS", 70], ["PostgreSQL", 70], ["MySQL", 70],
      ["Oracle Cloud", 70], ["BigQuery", 70], ["MongoDB", 60],
    ] as [string, number][],
  },
  {
    name: "TOOLS",
    items: [
      ["Git", 90], ["Docker", 90], ["n8n", 90],
      ["Vite", 75], ["Looker Studio", 70],
    ] as [string, number][],
  },
  {
    name: "LIBRARIES",
    items: [
      ["pandas", 90], ["scikit-learn", 70], ["LangGraph", 65],
      ["LangChain", 60], ["DaisyUI", 50],
    ] as [string, number][],
  },
];

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Python: SiPython,
  TypeScript: SiTypescript,
  Kotlin: SiKotlin,
  JavaScript: SiJavascript,
  Java: FaJava,
  "C++": SiCplusplus,
  "C#": FaCode,
  PHP: SiPhp,
  Lua: SiLua,
  SQL: FaDatabase,
  Svelte: SiSvelte,
  "Next.js": SiNextdotjs,
  FastAPI: SiFastapi,
  SvelteKit: SiSvelte,
  "Apache Airflow": SiApacheairflow,
  Nuxt: SiNuxt,
  Vue: SiVuedotjs,
  "Express.js": SiExpress,
  "Tailwind CSS": SiTailwindcss,
  "scikit-learn": SiScikitlearn,
  LangChain: SiLangchain,
  pandas: SiPandas,
  LangGraph: SiLanggraph,
  DaisyUI: SiDaisyui,
  Git: SiGit,
  Docker: SiDocker,
  n8n: SiN8N,
  Vite: SiVite,
  "Looker Studio": SiLooker,
  AWS: FaAws,
  PostgreSQL: SiPostgresql,
  MySQL: SiMysql,
  GCP: SiGooglecloud,
  "Oracle Cloud": FaCloud,
  MongoDB: SiMongodb,
  BigQuery: SiGooglebigquery,
  Firebase: SiFirebase,
  Supabase: SiSupabase,
};

const COLORS: Record<string, string> = {
  Python: "#3776AB",
  TypeScript: "#3178C6",
  Kotlin: "#7F52FF",
  JavaScript: "#F7DF1E",
  Java: "#E76F00",
  "C++": "#00599C",
  "C#": "#512BD4",
  PHP: "#777BB4",
  Lua: "#000080",
  SQL: "#CC2927",
  Svelte: "#FF3E00",
  "Next.js": "#000000",
  FastAPI: "#009688",
  SvelteKit: "#FF3E00",
  "Apache Airflow": "#017CEE",
  Nuxt: "#00DC82",
  Vue: "#4FC08D",
  "Express.js": "#000000",
  "Tailwind CSS": "#06B6D4",
  "scikit-learn": "#F7931E",
  LangChain: "#1C3C3C",
  pandas: "#150458",
  LangGraph: "#1C3C3C",
  DaisyUI: "#5A0EF8",
  Git: "#F05032",
  Docker: "#2496ED",
  n8n: "#EA4B71",
  Vite: "#646CFF",
  "Looker Studio": "#4285F4",
  AWS: "#FF9900",
  PostgreSQL: "#4169E1",
  MySQL: "#4479A1",
  GCP: "#4285F4",
  "Oracle Cloud": "#F80000",
  MongoDB: "#47A248",
  BigQuery: "#4285F4",
  Firebase: "#DD2C00",
  Supabase: "#3ECF8E",
};

export default function Skills({ onBack }: { onBack: () => void }) {
  return (
    <SectionShell num="03" title="ABILITIES" ghost="POW" onBack={onBack}>
      <div className="skills-grid">
        {SKILLS.map((cat, i) => (
          <div key={cat.name} className={`skill-cat reveal d${i + 1}`}>
            <h3>{cat.name}</h3>
            <ul>
              {cat.items.map(([n, lvl]) => {
                const Icon = ICONS[n];
                const clr = COLORS[n];
                return (
                  <li key={n}>
                    <span className="skill-label">
                      {Icon ? <Icon className="skill-icon" color={clr} /> : <span className="skill-icon ph" />}
                      {n}
                    </span>
                    <span className="bar" style={{ "--lvl": lvl + "%" } as React.CSSProperties} />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
