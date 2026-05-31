"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const FEATURES = [
  {
    icon: "🧠",
    title: "Genius-Level Intelligence",
    desc: "Powered by Llama 3.3 70B — reasoning that rivals the best AI models on the planet.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "rgba(79,172,254,0.2)",
    glow: "rgba(79,172,254,0.1)",
  },
  {
    icon: "💜",
    title: "Emotionally Intelligent",
    desc: "Not just smart — genuinely empathetic. Vent, gossip, or get real advice like talking to your best friend.",
    gradient: "from-purple-500/20 to-pink-500/20",
    border: "rgba(167,139,250,0.2)",
    glow: "rgba(167,139,250,0.1)",
  },
  {
    icon: "🎓",
    title: "Study Superpower",
    desc: "Ace any exam. Krish creates personalized study plans, quizzes, and explains concepts like a private tutor.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    border: "rgba(52,211,153,0.2)",
    glow: "rgba(52,211,153,0.1)",
  },
  {
    icon: "⚡",
    title: "Blazing Fast",
    desc: "Groq's LPU™ inference delivers responses at 750+ tokens per second. No waiting, ever.",
    gradient: "from-amber-500/20 to-orange-500/20",
    border: "rgba(251,191,36,0.2)",
    glow: "rgba(251,191,36,0.1)",
  },
  {
    icon: "🔒",
    title: "Your API, Your Data",
    desc: "It's your own Groq API key. No surveillance, no data training. Just you and your AI.",
    gradient: "from-red-500/20 to-pink-500/20",
    border: "rgba(244,114,182,0.2)",
    glow: "rgba(244,114,182,0.1)",
  },
  {
    icon: "♾️",
    title: "Unlimited Context",
    desc: "Krish remembers your entire conversation. No context windows cutting off mid-thought.",
    gradient: "from-indigo-500/20 to-violet-500/20",
    border: "rgba(129,140,248,0.2)",
    glow: "rgba(129,140,248,0.1)",
  },
];

const STATS = [
  { value: "70B", label: "Parameter Model" },
  { value: "750+", label: "Tokens/second" },
  { value: "∞", label: "Memory Context" },
  { value: "0ms", label: "Lag" },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cursor glow
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.left = `${e.clientX}px`;
        cursorGlowRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="relative overflow-hidden">
      {/* Cursor glow */}
      <div
        ref={cursorGlowRef}
        className="fixed pointer-events-none z-0 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(79,172,254,0.06) 0%, transparent 70%)",
          transform: "translate(-50%, -50%)",
          transition: "left 0.15s ease, top 0.15s ease",
        }}
      />

      {/* ===== HERO SECTION ===== */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Parallax background orbs */}
        <div ref={parallaxRef} className="absolute inset-0 pointer-events-none parallax-layer">
          <div
            className="orb orb-blue float-1"
            style={{ width: "600px", height: "600px", top: "-10%", right: "-10%" }}
          />
          <div
            className="orb orb-purple float-2"
            style={{ width: "500px", height: "500px", bottom: "10%", left: "-10%" }}
          />
          <div
            className="orb orb-pink float-3"
            style={{ width: "300px", height: "300px", top: "40%", left: "50%" }}
          />
        </div>

        {/* Star particles */}
        <Particles />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(79,172,254,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,172,254,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5">
          <div className="glass rounded-2xl px-5 py-2.5 flex items-center gap-2">
            <span className="text-xl">✦</span>
            <span
              className="font-black text-xl tracking-tight gradient-text"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              KRISH
            </span>
          </div>
          <Link
            href="/chat"
            id="nav-start-btn"
            className="btn-primary px-6 py-2.5 text-sm font-semibold flex items-center gap-2 relative z-10"
          >
            <span className="relative z-10">Start Chatting</span>
            <span className="relative z-10">→</span>
          </Link>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 text-sm font-medium text-zinc-400 border border-white/10">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Powered by Llama 3.3 70B · Running on Groq LPU™
          </div>

          {/* Main heading */}
          <h1
            className="font-black tracking-tighter mb-6 leading-[0.9]"
            style={{ fontSize: "clamp(3.5rem, 10vw, 8rem)" }}
          >
            <span className="gradient-text">Your AI.</span>
            <br />
            <span className="text-white">Your Rules.</span>
          </h1>

          <p className="text-zinc-400 text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Meet{" "}
            <span className="text-white font-semibold">Krish</span> — the AI companion that thinks faster, feels deeper, and knows exactly what you need.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chat"
              id="hero-cta-btn"
              className="btn-primary px-10 py-4 text-lg font-bold flex items-center gap-3 relative z-10"
            >
              <span className="relative z-10">Start a Conversation</span>
              <span className="relative z-10 text-xl">✦</span>
            </Link>
            <a
              href="#features"
              className="btn-ghost px-8 py-4 text-base font-medium"
            >
              See What's Possible
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 max-w-2xl mx-auto">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-2xl p-4 text-center neon-border"
              >
                <div className="text-3xl font-black gradient-text mb-1">{stat.value}</div>
                <div className="text-xs text-zinc-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600 text-xs">
          <span>Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-zinc-700 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-zinc-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 reveal">
            <p className="text-sm font-semibold tracking-widest text-zinc-500 uppercase mb-4">
              Why Krish is Different
            </p>
            <h2
              className="font-black tracking-tighter text-white"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              Built for{" "}
              <span className="gradient-text">real life.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="reveal group glass rounded-3xl p-8 cursor-default transition-all duration-500 hover:scale-[1.02]"
                style={{
                  border: `1px solid ${feature.border}`,
                  animationDelay: `${i * 0.1}s`,
                  transitionDelay: `${i * 0.05}s`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${feature.gradient.replace("from-", "").replace("/20", "").replace(" to-", ", ")})`,
                    boxShadow: `0 0 20px ${feature.glow}`,
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== USE CASES SECTION ===== */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div
          className="orb orb-purple"
          style={{ width: "400px", height: "400px", top: "0", right: "0", opacity: 0.5 }}
        />
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal-left">
              <p className="text-sm font-semibold tracking-widest text-zinc-500 uppercase mb-4">
                Use Cases
              </p>
              <h2
                className="font-black tracking-tighter text-white mb-6"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                Whatever you need,{" "}
                <span className="gradient-text">Krish delivers.</span>
              </h2>
              <div className="space-y-4">
                {[
                  { emoji: "📚", text: "Crush any exam with personalised study plans" },
                  { emoji: "💬", text: "Vent, gossip, or just have a real conversation" },
                  { emoji: "🔧", text: "Debug code and learn programming concepts" },
                  { emoji: "🧘", text: "Get emotional support without judgment" },
                  { emoji: "🎯", text: "Plan your goals with intelligent frameworks" },
                  { emoji: "🌍", text: "Discuss literally anything — no filter" },
                ].map(({ emoji, text }) => (
                  <div key={text} className="flex items-center gap-4 glass rounded-2xl px-5 py-4 neon-border">
                    <span className="text-xl">{emoji}</span>
                    <span className="text-zinc-300 text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal-right">
              <ConversationPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative py-32 px-6 text-center">
        <div
          className="orb orb-blue"
          style={{ width: "500px", height: "500px", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto reveal">
          <h2
            className="font-black tracking-tighter mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            <span className="gradient-text">Ready to meet</span>
            <br />
            <span className="text-white">your Krish?</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-10">
            No sign up. No subscription. Just add your free Groq API key and start.
          </p>
          <Link
            href="/chat"
            id="cta-final-btn"
            className="btn-primary inline-flex items-center gap-3 px-12 py-5 text-xl font-bold relative"
          >
            <span className="relative z-10">Open Krish</span>
            <span className="relative z-10">✦</span>
          </Link>
          <p className="text-zinc-600 text-sm mt-6">Free · Fast · Private · Yours</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-zinc-600 text-sm">
        <p>
          Built with ♥ · Powered by{" "}
          <span className="gradient-text font-semibold">Groq</span> ·{" "}
          <span className="gradient-text font-semibold">Krish AI</span>
        </p>
      </footer>
    </main>
  );
}

function Particles() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{
    left: string; top: string; width: string; height: string;
    duration: string; delay: string; opacity: number;
  }>>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 60 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 2 + 1}px`,
        height: `${Math.random() * 2 + 1}px`,
        duration: `${Math.random() * 5 + 3}s`,
        delay: `${Math.random() * 5}s`,
        opacity: Math.random() * 0.6 + 0.1,
      }))
    );
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.width,
            height: p.height,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

function ConversationPreview() {
  const previews = [
    { role: "user", text: "I have my Physics exam tomorrow and I'm freaking out 😭" },
    {
      role: "ai",
      text: "Let's fix that right now. Tell me which topics you're weakest on, and I'll create a rapid-fire review session — key concepts, formulas, and practice questions. We've got this. 🎯",
    },
    { role: "user", text: "Thermodynamics and optics mostly..." },
    {
      role: "ai",
      text: "Perfect. Starting with Thermodynamics: The First Law says energy is conserved — ΔU = Q - W. Want me to break it down with examples first, or jump straight to practice questions?",
    },
  ];

  return (
    <div className="glass-strong rounded-3xl p-6 space-y-4 neon-border">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold">
          K
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Krish</p>
          <p className="text-xs text-green-400">● Online</p>
        </div>
      </div>
      {previews.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-500/20 text-white"
                : "glass text-zinc-300"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-2">
        <div className="flex gap-1">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
        <span className="text-xs text-zinc-600">Krish is thinking...</span>
      </div>
    </div>
  );
}
