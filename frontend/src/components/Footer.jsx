import React from 'react';

const Footer = () => {
  const creators = [
    {
      name: "Rich dot com",
      role: "Lead Developer",
      color: "from-blue-500 to-indigo-600",
      portfolio: "https://waseemsaleem.com",
      github: "https://github.com/Waseem21Saleem",
      email: "Waseem21Saleem@gmail.com",
    }
  ];

  const handleEmailClick = (email) => {
    window.open(`mailto:${email}`, '_blank');
  };

  return (
    <footer className="w-full px-4 pb-6 pt-2 relative z-20">
      {/* The Floating Dock */}
      <div className="max-w-6xl mx-auto bg-white/30 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-slate-700/50 shadow-2xl rounded-[2.5rem] p-3 transition-all duration-500 ring-1 ring-black/5 dark:ring-white/10">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-6 py-3">
          
          {/* Left Side: Brand & Version */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-tighter">
                SoundSigns
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  © {new Date().getFullYear()} • v1.0 Beta
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Creator Floating Cards */}
          <div className="flex items-center gap-3">
            {creators.map((creator, index) => (
              <div 
                key={index} 
                className="group relative flex items-center gap-3 bg-white/40 dark:bg-slate-800/40 p-1 pr-4 rounded-full border border-white/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-300 cursor-default shadow-sm hover:shadow-md"
              >
                {/* Avatar Circle */}
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${creator.color} flex items-center justify-center text-white font-bold text-xs shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {creator.name.charAt(0)}
                </div>

                {/* Name and Role */}
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {creator.name}
                  </span>
                  <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                    {creator.role}
                  </span>
                </div>

                {/* Hover-reveal Socials */}
                <div className="flex items-center gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  {creator.portfolio && (
                    <a href={creator.portfolio} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-blue-500 rounded-full text-white hover:scale-110 transition-all shadow-sm" title="Portfolio">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </a>
                  )}
                  {creator.linkedin && (
                    <a href={creator.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-blue-700 rounded-full text-white hover:scale-110 transition-all shadow-sm" title="LinkedIn">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z"/></svg>
                    </a>
                  )}
                  <a href={creator.github} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-800 rounded-full text-white hover:scale-110 transition-all shadow-sm" title="GitHub">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                  <button 
                    onClick={() => handleEmailClick(creator.email)} 
                    className="p-1.5 bg-emerald-500 rounded-full text-white hover:scale-110 transition-all shadow-sm" 
                    title="Email"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;