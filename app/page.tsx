"use client";

import React, { useState, useEffect, useRef } from "react";
import { getApiUrl } from "@/app/lib/api";

const API_URL = getApiUrl();

const PROJECTS = [
  {
    id: 1,
    title: "Expenses Tracker",
    category: "Full-stack",
    desc: "A full-stack personal finance application built with Ruby on Rails adhering to MVC architecture. Implemented secure user authentication with Devise and session management, alongside complete CRUD operations for tracking expenses, categorizing transactions, and setting monthly budgets. Designed a normalized PostgreSQL relational schema with indexed queries to calculate spending breakdowns and balance summaries in real time.",
    tags: ["Ruby on Rails", "Ruby", "PostgreSQL", "SQL", "MVC"],
    sourceLink: "https://github.com/soumyajana466/expenses_tracker.git",
  },
  {
    id: 2,
    title: "Real Time Chat Application",
    category: "Full-stack",
    desc: "A full-stack real-time messaging platform built with Node.js, Express, and React. Implemented bidirectional, low-latency event-driven communication using Socket.io for instant messaging, live typing indicators, and user online/offline status tracking. Persisted chat history, channels, and user relations in PostgreSQL, and integrated Firebase Storage for seamless media and file sharing.",
    tags: ["React", "Node.js", "Socket.io", "PostgreSQL", "Firebase", "SQL"],
    sourceLink: "https://github.com/soumyajana466/real_time_chat_application",
  },
  {
    id: 3,
    title: "Job Finder Application",
    category: "Full-stack",
    desc: "A full-stack career platform built with Node.js, Express, and MongoDB paired with a React frontend. Engineered RESTful backend APIs featuring parameterized search and filtering by role, salary, and location, combined with pagination and indexing. Implemented a secure end-to-end applicant flow with JWT authentication for resume submissions, candidate status tracking, and recruiter job posting management.",
    tags: ["React", "Node.js", "MongoDB", "Express", "REST API", "JWT"],
    sourceLink: "https://github.com/soumyajana466/final-year-project-job-finder-using-react.git",
  },
];

export default function HomePage() {
  const [navOpen, setNavOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("about");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Visitor UI States
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Easter egg jokes list
  const devJokes = [
    "Why do programmers wear glasses? Because they can't C#! 🤓",
    "There are 10 types of people: those who understand binary, and those who don't. 🤖",
    "How many programmers does it take to change a light bulb? None, it's a hardware problem! 💡",
    "['hip', 'hip'] (hip hip array!) 🍕",
    "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?' 📊",
    "Why did the database administrator leave his wife? She had too many foreign keys. 🔑",
    "An optimist says the glass is half full. A pessimist says it's half empty. A programmer says it's twice as large as it needs to be. 🥤"
  ];

  const [avatarSpin, setAvatarSpin] = useState(false);
  const [activeJoke, setActiveJoke] = useState<string | null>(null);

  // References to handle click timeouts consecutively without timer overlapping
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const jokeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Typewriter effect states
  const words = ["Software Engineer", "Backend & Node.js Developer", "Database Schema Designer", "API Architect"];
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  // Scroll timeline state
  const [scrollProgress, setScrollProgress] = useState(0);

  const currentYear = new Date().getFullYear();

  // Track scroll position for navbar effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Detect active section
      const sections = ["about", "skills", "experience", "projects", "contact"];
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;

          if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
          ) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track visit analytics on page mount
  useEffect(() => {
    const logVisit = async () => {
      try {
        const api = API_URL;
        await fetch(`${api}/api/analytics/visit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: window.location.pathname,
            referrer: document.referrer || "Direct",
          }),
        });
      } catch (err) {
        console.error("Failed to record visit:", err);
      }
    };
    logVisit();
  }, []);

  // Theme Sync on mount & state change
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      setTheme(systemPrefersLight ? "light" : "dark");
    }
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  }, [theme]);

  // Scroll Reveal intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.08 }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Fetch avatar url on page mount
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const api = API_URL;
        const res = await fetch(`${api}/api/admin/avatar`);
        const data = await res.json();
        if (data && data.url) {
          setAvatarUrl(data.url);
        }
      } catch (err) {
        console.error("Failed to load avatar:", err);
      }
    };
    fetchAvatar();
  }, []);

  // Typewriter loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleType = () => {
      const fullWord = words[wordIndex];
      if (!isDeleting) {
        setCurrentText(fullWord.substring(0, currentText.length + 1));
        setTypingSpeed(90);
        if (currentText === fullWord) {
          timer = setTimeout(() => setIsDeleting(true), 2200);
          return;
        }
      } else {
        setCurrentText(fullWord.substring(0, currentText.length - 1));
        setTypingSpeed(45);
        if (currentText === "") {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
          setTypingSpeed(150);
          return;
        }
      }
      timer = setTimeout(handleType, typingSpeed);
    };

    timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, wordIndex]);

  // Scroll tracking for Experience Timeline
  useEffect(() => {
    const handleScroll = () => {
      const timelineEl = document.getElementById("experience-timeline-track");
      if (!timelineEl) return;

      const rect = timelineEl.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const totalHeight = rect.height;
      const scrolledPast = Math.max(0, (windowHeight / 2) - rect.top);
      const percentage = Math.min(1, scrolledPast / totalHeight);
      setScrollProgress(percentage * 100);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      return next;
    });
  };

  // Filtered projects calculation
  const filteredProjects = PROJECTS.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.desc.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(projectSearch.toLowerCase()));

    const matchesFilter =
      projectFilter === "All" ||
      p.tags.some((t) => {
        if (projectFilter === "Ruby on Rails") return t.toLowerCase().includes("rails");
        return t.toLowerCase().includes(projectFilter.toLowerCase());
      });

    return matchesSearch && matchesFilter;
  });


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const triggerAvatarEasterEgg = () => {
    // Clear any pending animations/timers so they can be clicked infinitely
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    if (jokeTimeoutRef.current) clearTimeout(jokeTimeoutRef.current);

    setAvatarSpin(false);
    
    // Tiny timeout to reset animation frames
    setTimeout(() => {
      const randomJoke = devJokes[Math.floor(Math.random() * devJokes.length)];
      setActiveJoke(randomJoke);
      setAvatarSpin(true);

      spinTimeoutRef.current = setTimeout(() => {
        setAvatarSpin(false);
      }, 1000);

      jokeTimeoutRef.current = setTimeout(() => {
        setActiveJoke(null);
      }, 4500);
    }, 10);
  };

  const handleNavLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string
  ) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -70; // offset for sticky navbar
      const scrollY = window.scrollY !== undefined ? window.scrollY : (window.pageYOffset || 0);
      const y = el.getBoundingClientRect().top + scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setNavOpen(false);
  };

  const createConfettiBurst = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const colors = ["#38bdf8", "#818cf8", "#34d399", "#fb7185", "#fbbf24", "#a78bfa"];
    const icons = ["📄", "✨", "🎉", "🔥", "🚀", "❤️"];

    for (let i = 0; i < 35; i++) {
      const particle = document.createElement("span");
      
      if (Math.random() > 0.5) {
        particle.innerText = icons[Math.floor(Math.random() * icons.length)];
        particle.style.fontSize = `${Math.random() * 12 + 10}px`;
      } else {
        particle.style.width = `${Math.random() * 8 + 6}px`;
        particle.style.height = particle.style.width;
        particle.style.borderRadius = "50%";
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      }

      particle.style.position = "fixed";
      particle.style.left = `${btnCenterX}px`;
      particle.style.top = `${btnCenterY}px`;
      particle.style.pointerEvents = "none";
      particle.style.zIndex = "9999";
      particle.style.transition = "transform 1s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 1s ease-out";
      
      document.body.appendChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 140 + 80;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;
      const rotation = Math.random() * 360 + 180;

      void particle.offsetWidth; // force reflow

      particle.style.transform = `translate(${targetX}px, ${targetY}px) rotate(${rotation}deg) scale(0.2)`;
      particle.style.opacity = "0";

      setTimeout(() => {
        particle.remove();
      }, 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const api = API_URL;
      const response = await fetch(`${api}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("Message sent successfully! I'll get back to you soon.");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus("Failed to send message. Please try again later.");
    }

    setTimeout(() => {
      setStatus("");
    }, 5000);
  };

  const onChangeField =
    (field: "name" | "email" | "message") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <div>
      {/* NAVBAR */}
      <header className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
        <div className="nav-inner">
          <div className="nav-left">
            <div className="nav-avatar" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="SJ" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                "SJ"
              )}
            </div>
            <div className="nav-title">
              <span className="nav-title-main">Soumya Jana</span>
              <span className="nav-title-sub">Backend Engineer</span>
            </div>
          </div>
          <nav>
            <button
              className={`nav-menu-toggle ${
                navOpen ? "nav-menu-toggle-open" : ""
              }`}
              aria-label="Toggle navigation"
              onClick={() => setNavOpen((open) => !open)}
            >
              <span></span>
            </button>
            {navOpen && (
              <div className="nav-backdrop" onClick={() => setNavOpen(false)} />
            )}
            <div className={`nav-links ${navOpen ? "nav-links-open" : ""}`}>
              <a
                href="#about"
                className={`nav-link ${
                  activeSection === "about" ? "nav-link-active" : ""
                }`}
                onClick={(e) => handleNavLinkClick(e, "about")}
              >
                About
              </a>
              <a
                href="#skills"
                className={`nav-link ${
                  activeSection === "skills" ? "nav-link-active" : ""
                }`}
                onClick={(e) => handleNavLinkClick(e, "skills")}
              >
                Skills
              </a>
              <a
                href="#experience"
                className={`nav-link ${
                  activeSection === "experience" ? "nav-link-active" : ""
                }`}
                onClick={(e) => handleNavLinkClick(e, "experience")}
              >
                Experience
              </a>
              <a
                href="#projects"
                className={`nav-link ${
                  activeSection === "projects" ? "nav-link-active" : ""
                }`}
                onClick={(e) => handleNavLinkClick(e, "projects")}
              >
                Projects
              </a>
              <a
                href="#contact"
                className={`nav-link ${
                  activeSection === "contact" ? "nav-link-active" : ""
                }`}
                onClick={(e) => handleNavLinkClick(e, "contact")}
              >
                Contact
              </a>
              <a
                href={`${API_URL}/api/admin/cv/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
                download
                onClick={(e) => createConfettiBurst(e)}
              >
                Download CV
              </a>

              {/* Theme Toggle Switcher */}
              <button
                onClick={toggleTheme}
                className="theme-toggle-btn"
                aria-label="Toggle theme"
              >
                <span className="theme-toggle-label" style={{ display: navOpen ? "inline-block" : "none", fontSize: "13px", fontWeight: 500 }}>
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
                {theme === "dark" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>

              <a
                href="https://www.linkedin.com/in/soumya-jana-740096290"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link-primary"
              >
                LinkedIn
                <span>↗</span>
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Ambient Backdrop Orbs */}
      <div className="ambient-orbs" aria-hidden="true">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* PAGE CONTENT */}
      <div className="page">
        {/* HERO */}
        <main>
          <section className="hero">
            <div>
              <div className="pill">
                <span className="pill-dot"></span>
                <span>Open to interesting backend work</span>
              </div>
              <p className="hero-title" style={{ minHeight: "2.4em" }}>
                <span className="hero-highlight" style={{ display: "inline-block" }}>
                  {currentText}
                </span>
                <span className="typewriter-cursor" aria-hidden="true">|</span>
              </p>
              <p className="hero-subtitle">
                Backend Engineer specializing in building scalable Node.js services,
                robust database architectures, and clean, high-performance REST APIs
                that power modern web applications.
              </p>

              <div className="hero-tags">
                <span className="chip">Node.js · Express</span>
                <span className="chip">REST APIs &amp; Auth</span>
                <span className="chip">SQL &amp; Relational DBs</span>
                <span className="chip">JavaScript / TypeScript</span>
              </div>

              <div className="hero-ctas">
                <a
                  href="#projects"
                  className="btn btn-primary"
                  onClick={(e) => handleNavLinkClick(e, "projects")}
                >
                  <span className="btn-icon">⚙️</span>
                  <span>View selected work</span>
                </a>
                <a
                  href="#contact"
                  className="btn btn-ghost"
                  onClick={(e) => handleNavLinkClick(e, "contact")}
                >
                  <span className="btn-icon">✉️</span>
                  <span>Let’s work together</span>
                </a>
              </div>

              <div className="hero-meta">
                <div className="meta-item">
                  <span className="meta-dot"></span>
                  <span>Backend · Node.js · SQL</span>
                </div>
                <div className="meta-item">
                  <span>
                    Currently working as Software Engineer at GEOGO
                    Technologies
                  </span>
                </div>
              </div>
            </div>

            <div className="hero-right">
              <div className="floating-orb" aria-hidden="true"></div>
              <article className="card-profile">
                <header className="card-profile-header">
                  <span>Profile snapshot</span>
                  <div className="card-badge">Available for backend roles</div>
                </header>
                <div className="profile-main" style={{ position: "relative" }}>
                  <div
                    className={`profile-photo ${avatarSpin ? "spin-roll" : ""}`}
                    style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    onClick={triggerAvatarEasterEgg}
                    title="Click for a programmer joke!"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Soumya Jana" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      "SJ"
                    )}
                  </div>
                  {activeJoke && (
                    <div className="joke-bubble">
                      <div className="joke-arrow"></div>
                      {activeJoke}
                    </div>
                  )}
                  <div className="profile-text">
                    <h1>Soumya Jana</h1>
                    <p>Software Engineer · Backend</p>
                    <small>Node.js · Express · SQL · JavaScript</small>
                  </div>
                </div>
                <div className="profile-tags">
                  <span className="profile-tag">API Design</span>
                  <span className="profile-tag">Database Schema</span>
                  <span className="profile-tag">Clean Code</span>
                  <span className="profile-tag">Production Debugging</span>
                </div>
                <footer className="profile-footer">
                  <div>
                    <span className="status-dot"></span>
                    <span>Actively learning &amp; improving</span>
                  </div>
                  <a
                    href="https://www.linkedin.com/in/soumya-jana-740096290"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View LinkedIn ↗
                  </a>
                </footer>
              </article>
            </div>

            {/* Scroll Indicator Mouse Animation */}
            <div className={`scroll-indicator ${scrolled ? "scrolled" : ""}`} aria-hidden="true">
              <div className="scroll-indicator-mouse">
                <span className="scroll-indicator-wheel"></span>
              </div>
            </div>
          </section>

          {/* ABOUT */}
          <section id="about" className="reveal">
            <div className="section-header">
              <h2 className="section-title">About</h2>
              <p className="section-kicker">Who I am and how I work</p>
            </div>
            <div className="section-body">
              <div className="about-grid">
                <div>
                  <p className="about-text">
                    I am a Backend Engineer who loves building fast, structured,
                    and highly reliable server-side systems. I specialize in the Node.js
                    ecosystem, creating performant database models, and implementing secure
                    business logic that handles modern application demands.
                    <br />
                    <br />
                    Currently working as a Software Engineer, I spend my time
                    collaborating with front-end teams, designing clean RESTful APIs, and
                    tuning SQL query performance. I believe in clean code, robust error
                    handling, and proactive logging to make sure bugs are solved before they reach production.
                  </p>
                  <p className="about-highlight">
                    When I'm not writing code, I'm usually exploring TypeScript patterns, learning
                    system design principles, reading up on cloud architecture, or contributing to code reviews and pair-debugging sessions.
                  </p>
                </div>
                <aside className="about-meta">
                  <div className="about-meta-row">
                    <span className="about-meta-label">Focus</span>
                    <span>Backend-first full-stack development</span>
                  </div>
                  <div className="about-meta-row">
                    <span className="about-meta-label">Backend</span>
                    <span>Node.js · Express · SQL</span>
                  </div>
                  <div className="about-meta-row">
                    <span className="about-meta-label">Frontend</span>
                    <span>React · HTML · CSS</span>
                  </div>
                  <div className="about-meta-row">
                    <span className="about-meta-label">Collaboration</span>
                    <span>PR reviews · Pair debugging</span>
                  </div>
                  <div className="about-meta-row">
                    <span className="about-meta-label">Goal</span>
                    <span>Grow into a versatile full-stack engineer</span>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          {/* SKILLS */}
          <section id="skills" className="reveal">
            <div className="section-header">
              <h2 className="section-title">Skills</h2>
              <p className="section-kicker">
                Technologies I’m comfortable with
              </p>
            </div>
            <div className="section-body">
              <div className="skills-grid">
                <div className="skills-card skill-node">
                  <div className="skills-card-title">Backend &amp; runtime</div>
                  <div className="skills-tags">
                    <span className="skills-tag">Node.js</span>
                    <span className="skills-tag">Express</span>
                    <span className="skills-tag">Ruby on Rails (learning)</span>
                    <span className="skills-tag">REST APIs</span>
                    <span className="skills-tag">Authentication</span>
                  </div>
                </div>
                <div className="skills-card skill-database">
                  <div className="skills-card-title">Databases</div>
                  <div className="skills-tags">
                    <span className="skills-tag">SQL</span>
                    <span className="skills-tag">Relational schema design</span>
                    <span className="skills-tag">Queries &amp; Joins</span>
                    <span className="skills-tag">Migrations</span>
                  </div>
                </div>
                <div className="skills-card skill-languages">
                  <div className="skills-card-title">
                    Languages &amp; tooling
                  </div>
                  <div className="skills-tags">
                    <span className="skills-tag">JavaScript</span>
                    <span className="skills-tag">TypeScript (learning)</span>
                    <span className="skills-tag">Git &amp; GitHub</span>
                    <span className="skills-tag">Python</span>
                  </div>
                </div>
                <div className="skills-card skill-frontend">
                  <div className="skills-card-title">Frontend</div>
                  <div className="skills-tags">
                    <span className="skills-tag">React</span>
                    <span className="skills-tag">HTML</span>
                    <span className="skills-tag">CSS</span>
                    <span className="skills-tag">Haml</span>
                  </div>
                </div>
                <div className="skills-card">
                  <div className="skills-card-title">Ways of working</div>
                  <div className="skills-tags">
                    <span className="skills-tag">Code reviews</span>
                    <span className="skills-tag">Debugging &amp; logs</span>
                    <span className="skills-tag">Problem solving</span>
                    <span className="skills-tag">
                      Clean &amp; readable code
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* EXPERIENCE */}
          <section id="experience" className="reveal">
            <div className="section-header">
              <h2 className="section-title">Experience</h2>
              <p className="section-kicker">
                Where I’ve been putting things into practice
              </p>
            </div>
            <div className="section-body">
              <div className="timeline" id="experience-timeline-track">
                <div className="timeline-axis">
                  <div className="timeline-axis-filled" style={{ height: `${scrollProgress}%` }}></div>
                </div>
                
                <article className="timeline-item">
                  <div className="timeline-dot-wrapper">
                    <div className="timeline-dot"></div>
                  </div>
                  <div className="timeline-main">
                    <h3>Software Engineer · Backend</h3>
                    <h4>GEOGO Technologies</h4>
                    <p>
                      Working on backend services using Node.js, Express, and
                      SQL databases – building and maintaining APIs for
                      real-world applications.
                    </p>
                    <ul>
                      <li>
                        Implement and maintain RESTful APIs and backend logic.
                      </li>
                      <li>
                        Design and query relational database tables using SQL.
                      </li>
                      <li>Debug production issues and improve reliability.</li>
                      <li>
                        Collaborate with teammates through Git, PRs, and
                        reviews.
                      </li>
                    </ul>
                  </div>
                  <div className="timeline-date">
                    <span>Present</span>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* PROJECTS */}
          <section id="projects" className="reveal">
            <div className="section-header">
              <h2 className="section-title">Projects</h2>
              <p className="section-kicker">
                Concrete examples of what I build
              </p>
            </div>
            <div className="section-body">
              {/* Project Search and Filters */}
              <div className="projects-controls">
                <div className="project-filters">
                  {["All", "React", "Node.js", "Ruby on Rails", "SQL"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setProjectFilter(filter)}
                      className={`filter-btn ${
                        projectFilter === filter ? "filter-btn-active" : ""
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <div className="project-search-box">
                  <span className="project-search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                  />
                </div>
              </div>

              {filteredProjects.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)", fontSize: "14px" }}>
                  No projects match your search or filter criteria.
                </div>
              ) : (
                <div className="projects-grid">
                  {filteredProjects.map((project) => (
                    <article key={project.id} className="project-card" onMouseMove={handleMouseMove}>
                      <span className="project-pill">{project.category}</span>
                      <h3 className="project-title">{project.title}</h3>
                      <p className="project-desc">{project.desc}</p>
                      <div className="project-meta">
                        <div className="project-tags">
                          {project.tags.map((tag) => (
                            <span key={tag} className="project-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="project-links">
                        {project.sourceLink && (
                          <a
                            href={project.sourceLink}
                            className="project-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span>Source code</span> <span>↗</span>
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* CONTACT */}
          <section id="contact" className="reveal">
            <div className="section-header">
              <h2 className="section-title">Contact</h2>
              <p className="section-kicker">Fastest ways to reach me</p>
            </div>
            <div className="section-body">
              <div className="contact-layout">
                <div className="contact-details">
                  <p>
                    Interested in working together or just want to say hi?
                    <br />
                    Reach out using any of the channels below or send a message
                    through the form.
                  </p>
                  <div className="contact-items">
                    <div className="contact-item">
                      <div>
                        <div className="contact-label">Email</div>
                        {/* TODO: replace with your real email */}
                        <a href="mailto:soumyajana466@gmail.com">
                          soumyajana466@gmail.com
                        </a>
                      </div>
                    </div>
                    <div className="contact-item">
                      <div>
                        <div className="contact-label">LinkedIn</div>
                        <a
                          href="https://www.linkedin.com/in/soumya-jana-740096290"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          linkedin.com/in/soumya-jana-740096290
                        </a>
                      </div>
                    </div>
                    <div className="contact-item">
                      <div>
                        <div className="contact-label">GitHub</div>
                        {/* TODO: replace with your real GitHub */}
                        <a
                          href="https://github.com/soumyajana466"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          https://github.com/soumyajana466
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="field">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      required
                      value={formData.name}
                      onChange={onChangeField("name")}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={formData.email}
                      onChange={onChangeField("email")}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="Tell me a bit about what you have in mind…"
                      required
                      value={formData.message}
                      onChange={onChangeField("message")}
                    />
                  </div>
                  <p className="contact-note">
                    Your message will be sent securely and I'll respond as soon
                    as possible.
                  </p>
                  <div className="submit-row">
                    <button type="submit" className="btn btn-primary">
                      <span className="btn-icon">📨</span>
                      <span>Send message</span>
                    </button>
                    <span className="submit-status">{status}</span>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer>
          <span>© {currentYear} Soumya Jana. All rights reserved.</span>
          <span>Built with Next.js · React · CSS.</span>
        </footer>
      </div>
    </div>
  );
}
