import { useState } from 'react'
import { ArrowUpRight, ArrowUp, Github, Mail, MoveUpRight } from 'lucide-react'
import { profile, projects, hackathons, toolkit } from '../data/portfolio'
import ProjectsGallery from './ProjectsGallery'

const SECTION_TOTAL = 7
const PROJECT_TOTAL = projects.length

function SectionMark({ n, title, dark = false }: { n: string; title: string; dark?: boolean }) {
  return <div className={`section-mark reveal ${dark ? 'light-mark' : ''}`}><span>{n} / {String(SECTION_TOTAL).padStart(2, '0')}</span><span>{title}</span><span className="mark-line" /></div>
}

function About() {
  const facts = [
    ['CURRENT INSTITUTION', profile.school], ['DEGREE', profile.degree], ['SPECIALIZATION', profile.specialization],
    ['PREVIOUS INSTITUTION', profile.previousSchool], ['STATUS', profile.status], ['EXPECTED GRADUATION', profile.graduation],
    ['GPA', 'To be revealed soon'], ['COURSEWORK', 'Yet to be updated'],
  ]
  return <section className="about-section section-pad" id="about">
    <SectionMark n="01" title="A LITTLE CONTEXT" />
    <div className="about-layout">
      <div className="about-left">
        <p className="eyebrow about-reveal">HELLO, WORLD. YES, THAT WORLD.</p>
        <h2 className="about-title about-reveal">A MIND<br />IN <span>PROGRESS.</span></h2>
        <p className="about-copy about-reveal">{profile.intro}</p>
        <blockquote className="about-quote about-reveal"><span>“</span>{profile.philosophy}</blockquote>
      </div>
      <div className="about-right about-reveal">
        <div className="about-photo-wrap">
          <div className="about-photo-art">
            <img className="photo-portrait" src="/projects/profilepic.jpeg" alt="P. Krishaanth, subject of the portfolio" loading="lazy" />
            <div className="photo-ring ring-one" /><div className="photo-ring ring-two" />
            <div className="photo-cross" aria-hidden="true">✳</div>
            <div className="photo-caption"><b>P. KRISHAANTH</b><br />A PORTRAIT OF POTENTIAL</div>
          </div>
          <span className="photo-index">FIG. 01 — SUBJECT: PRESENT &amp; ACCOUNTED FOR</span>
        </div>
        <div className="facts-grid">{facts.map(([label, value]) => <div className="fact" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      </div>
    </div>
    <div className="social-row reveal"><span className="eyebrow">OCCASIONAL INTERNET PRESENCE</span>{profile.socials.map((item) => <a key={item.label} href={item.href} target={item.label === 'Email' ? undefined : '_blank'} rel="noreferrer">{item.label}<MoveUpRight size={13}/></a>)}</div>
  </section>
}

function Projects() {
  const [showReel, setShowReel] = useState(false)

  return <section className="projects-section" id="projects">
    <div className="projects-intro section-pad">
      <SectionMark n="02" title="SELECTED EXPERIMENTS" dark/>
      <div className="projects-heading-row">
        <h2 className="projects-heading reveal">PROOF I<br/>SOMETIMES<br/><span>LEAVE THE</span><br/>TUTORIAL.</h2>
        <div className="projects-aside reveal">
          <span className="big-asterisk">✳</span>
          <p>Four builds. Different rabbit holes. All of them came with at least one "why is this broken?" moment.</p>
          <button onClick={() => setShowReel(true)} className="run-projects-btn" style={{ marginTop: '24px' }} aria-haspopup="dialog" aria-expanded={showReel}>
            RUN MY PROJECTS ↗
          </button>
          <span className="eyebrow" style={{ marginTop: '16px' }}>A CURATED SET · {String(PROJECT_TOTAL).padStart(2, '0')} BUILDS · 2024—26</span>
        </div>
      </div>
    </div>
    {showReel && <ProjectsGallery onClose={() => setShowReel(false)} />}
  </section>
}

function EduGuardDiagram() {
  return <div className="edu-diagram"><div className="diagram-head"><span>EDUGUARD / SERVICE MAP</span><span>SIMPLIFIED SYSTEM VIEW</span></div><div className="diagram-flow"><div className="diagram-node"><span>01 / INGEST</span><b>STUDENT<br/>DATA SERVICE</b><small>ENROLMENT · ATTENDANCE<br/>GRADES · FEES · ENGAGEMENT</small></div><div className="diagram-connection"><span>REST<br/>HTTP / JSON</span><i>→</i></div><div className="diagram-node risk-node"><span>02 / ASSESS</span><b>RISK &<br/>RECOMMENDATION</b><small>RISK PROFILE · EXPLAINABILITY<br/>TAILORED INTERVENTIONS</small></div></div><div className="diagram-db"><div>▤ &nbsp; DATABASE LAYER</div><strong>POSTGRESQL <span>OR</span> H2</strong><span>PRODUCTION / PROTOTYPE CONFIGURATION</span></div><div className="diagram-out"><span>RISK CLASSIFICATION</span><span>FEATURE IMPORTANCE</span><span>CASE WORKFLOW</span><span>INTERVENTION</span></div></div>
}

function Hackathons() {
  return <section className="hack-section section-pad" id="hackathons">
    <SectionMark n="03" title="DEADLINES & GOOD IDEAS"/><div className="hack-header"><div><p className="eyebrow reveal">SOME IDEAS ARE BETTER TESTED AGAINST A DEADLINE.</p><h2 className="hack-title reveal">BUILT UNDER<br/><span>PRESSURE.</span></h2></div><div className="hack-counter reveal"><strong>04</strong><span>HACKATHON<br/>PARTICIPATIONS</span><small>Two documented here.<br/>The other two get no lore yet.</small></div></div>
    <div className="hack-timeline">{hackathons.map((h, i) => <article className={`hack-card hack-${h.accent}`} key={h.title}><div className="hack-year"><span>{h.year}</span><i>0{i + 1}</i></div><div className="hack-main"><div className="hack-eventline"><span>{h.title}</span><span>{h.role} &nbsp;·&nbsp; {h.team}</span></div><h3>{h.project}</h3><p>{h.description}</p><div className="hack-tags">{h.tags.map((t) => <span key={t}>{t}</span>)}</div>{h.repo && <a className="hack-repo" href={h.repo} target="_blank" rel="noreferrer"><Github size={15}/> EXPLORE EDUGUARD <ArrowUpRight size={14}/></a>}{h.title.startsWith('GREENOPS') && <EduGuardDiagram/>}</div><div className="hack-result"><span>OUTCOME</span><strong>{h.result}</strong><small>{h.resultDetail}</small></div></article>)}</div>
  </section>
}

function Toolkit() {
  return <section className="toolkit-section section-pad" id="skills"><SectionMark n="04" title="TOOLS, NOT PERSONALITY TRAITS" dark/><div className="toolkit-header"><div><p className="eyebrow reveal">NO PROGRESS BARS. THEY’D BE MADE UP.</p><h2 className="toolkit-title reveal">MY CURRENT<br/><span>ARSENAL.</span></h2></div><div className="toolkit-spark">✳<small>LEARNING<br/>IN PUBLIC</small></div></div><div className="toolkit-grid">{toolkit.map((group, i) => <div className="tool-group reveal" key={group.group}><div className="tool-group-head"><span>0{i + 1}</span><h3>{group.group}</h3><span className="tool-plus">＋</span></div><div className="tool-list">{group.items.map((tool) => <span key={tool}>{tool}<ArrowUpRight size={13}/></span>)}</div></div>)}</div><div className="toolkit-legend reveal"><span><i className="legend-dot used"/> Used across projects</span><span><i className="legend-dot explore"/> Currently exploring</span><span>Grouped by topic, not an alleged mastery ranking.</span></div></section>
}

function EducationRoadmap() {
  return <section className="education-section section-pad" id="education"><SectionMark n="05" title="THE ACADEMIC SIDE QUEST"/><div className="education-layout"><div><p className="eyebrow reveal">CURRENTLY COLLECTING KNOWLEDGE POINTS.</p><h2 className="education-title reveal">THE<br/>ACADEMIC<br/><span>SIDE QUEST.</span></h2><p className="education-note reveal">The GPA and coursework fields are waiting on an update. And the courage to format a transcript.</p></div><div className="edu-timeline"><article className="edu-entry current reveal"><span className="edu-dot"/><div className="edu-entry-meta"><span>CURRENT · 2026—2030</span><span>01</span></div><h3>Vellore Institute of<br/>Technology, Chennai</h3><p>Bachelor of Technology<br/>Computer Science and Engineering (Core)</p><div className="edu-extra"><span>EXPECTED GRADUATION <b>2030</b></span><span>GPA <b>To be revealed soon</b></span><span>COURSEWORK <b>Yet to be updated</b></span></div></article><article className="edu-entry reveal"><span className="edu-dot past"/><div className="edu-entry-meta"><span>PREVIOUS INSTITUTION</span><span>02</span></div><h3>Amrita Vidyalayam,<br/>Chennai</h3><p>Previous institution</p></article></div></div></section>
}

function Roadmap() {
  const items = [['ADVANCED COURSEWORK', 'YET TO UPDATE'], ['RESEARCH OPPORTUNITIES', 'YET TO UPDATE'], ['OPEN-SOURCE CONTRIBUTIONS', 'YET TO UPDATE'], ['INTERNSHIPS', 'YET TO UPDATE'], ['PROFESSIONAL CERTIFICATIONS', 'YET TO UPDATE'], ['LARGER ENGINEERING PROJECTS', 'ONGOING']]
  return <section className="roadmap-section section-pad"><SectionMark n="06" title="MORE TO COME" dark/><div className="roadmap-layout"><div><p className="eyebrow reveal">SPOILER: THIS ISN’T THE FINAL FORM.</p><h2 className="roadmap-title reveal">STILL UNDER<br/><span>DEVELOPMENT.</span></h2><p className="roadmap-intro reveal">Ambition: present. Roadmap: honest. The empty slots aren’t missing achievements; they’re the next things to work toward.</p></div><div className="roadmap-list">{items.map(([label, status], i) => <div className="roadmap-item reveal" key={label}><span className={`roadmap-node ${status === 'ONGOING' ? 'active' : ''}`}/><span className="roadmap-num">0{i + 1}</span><strong>{label}</strong><span className="roadmap-status">{status}</span></div>)}</div></div></section>
}

function Contact() {
  return <footer className="contact-section" id="contact"><div className="contact-inner section-pad"><div className="contact-top reveal"><span>07 / THE LAST SCENE</span><span>IF YOU’VE MADE IT THIS FAR, WE’RE BOTH COMMITTED.</span></div><p className="eyebrow reveal">OPEN TO INTERESTING CONVERSATIONS, IDEAS & COLLABORATIONS</p><h2 className="contact-title reveal">LET’S BUILD<br/>SOMETHING<br/><span>MEANINGFUL.</span></h2><div className="contact-bottom"><div className="contact-message reveal"><p>Got an interesting idea? A project worth attempting? Or just want to discuss why the code worked yesterday and doesn’t today?</p><a className="contact-cta" href={`mailto:${profile.email}`}>LET’S TALK <ArrowUpRight size={17}/></a><a className="email-line" href={`mailto:${profile.email}`}><Mail size={15}/>{profile.email}</a></div><div className="contact-links reveal">{profile.socials.slice(0, 3).map((s) => <a key={s.label} href={s.href} target="_blank" rel="noreferrer"><span>{s.label}</span><MoveUpRight size={16}/></a>)}<a href={`mailto:${profile.email}`}><span>Email</span><MoveUpRight size={16}/></a></div></div><div className="footer-line"><a href="#home">P. KRISHAANTH <ArrowUp size={13}/></a><span>VIT CHENNAI</span><span>PERSONAL PORTFOLIO / 2026</span><a href="#home" className="back-top">BACK TO THE TOP <ArrowUp size={13}/></a></div></div></footer>
}

export default function Sections() {
  return <main><About/><Projects/><Hackathons/><Toolkit/><EducationRoadmap/><Roadmap/><Contact/></main>
}
