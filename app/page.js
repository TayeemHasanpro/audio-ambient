'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- WAV Encoder Helper ---
function audioBufferToWav(buffer) {
  let numOfChan = buffer.numberOfChannels,
      length = buffer.length * numOfChan * 2 + 44,
      bufferArray = new ArrayBuffer(length),
      view = new DataView(bufferArray),
      channels = [], i, sample,
      offset = 0,
      pos = 0;

  setUint32(0x46464952);                         // "RIFF"
  setUint32(length - 8);                         // file length - 8
  setUint32(0x45564157);                         // "WAVE"
  setUint32(0x20746d66);                         // "fmt " chunk
  setUint32(16);                                 // length = 16
  setUint16(1);                                  // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan);  // avg. bytes/sec
  setUint16(numOfChan * 2);                      // block-align
  setUint16(16);                                 // 16-bit
  setUint32(0x61746164);                         // "data" - chunk
  setUint32(length - pos - 4);                   // chunk length

  for (i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
  }

  while (pos < buffer.length) {
      for (i = 0; i < numOfChan; i++) {             
          sample = Math.max(-1, Math.min(1, channels[i][pos])); 
          sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; 
          view.setInt16(offset, sample, true);          
          offset += 2;
      }
      pos++;
  }

  function setUint16(data) { view.setUint16(offset, data, true); offset += 2; }
  function setUint32(data) { view.setUint32(offset, data, true); offset += 4; }

  return bufferArray;
}

// --- Configuration: Sound Library ---
const ALL_SOUNDS_CONFIG = {
  Nature: [
    { id: 'rain', name: 'Rain', category: 'Nature', icon: 'water_drop', file: 'rain.mp3', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1Fktw8woiWqx41ZqOl5JY8m6SnBBZ-EFTb_Us_7s2qNFl-GC3XmNZ0rWsUW-seOsNDvW-0e11x6GN15kAEHdeOVzvxL7uluvoG7MWo76rfuNyZsccgSwPxFbb0S2ZysnJ2B4Oa1c0NEDSaO_WPH-LM9Mt_9xqFlBc_6zEvC53OHxQXUzpk09edIaeTwV40Q9CqBgmVGEa8_DvvqBcro9KAr4Br78E32whYR4F6DbqFXEZn1kRYDg5DPicqas-hOYA1-jCGSlkT38' },
    { id: 'ocean', name: 'Ocean Waves', category: 'Nature', icon: 'waves', file: 'ocean.mp3', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlWuwOzX7_T6uxwjvdiSHwZIigQ7BFz-ON2iYuICDpT2p1ugVdS2IKizENE_b1ZOXoKVMgH5b0BC7UmpeCWbjpDZDypIkiubFthzeg224E-kflYV8fYOvLpJbzAGvzidxvQfhjUxvssk0CSp1iD-Hgu0p-kRLMyLqwNTZ0xl5iN15WUg7z0DNxAIITeKQgsg_y2hHuxCIMeNhFzCGeCBOvElG2UJC77nBOWP2bK1B4MWvNVBUZ81nDaZWruGpqHcJUpIzb4Ku9u8c' },
    { id: 'forest', name: 'Forest Birds', category: 'Nature', icon: 'forest', file: 'Forest Birds.mp3', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmqdJL30I4z3hB2Cbh4xo2t-oUIEsI2-ANN0kwkkDQU0-cf3-YJFbAVQX91oiJEApRSMYFr8swNXSp7QawMT5_dbEIPXfq_xNLrwhSRynDpe7lLo6Mh9_esLlmP5wkVZ7dkHjDVbODbTdZ2NsYpOfBV1yxjB3Ga0CYlKxPpQIbQrY4RFgthTaT7xK3BGorcqdZ59yQjv8uKV9CQLTOBDZ7-6ICpBpgdeDBH667jDgT5Rj760MKGgYOB635RIBO-EGuohOtyIN08DQ' },
    { id: 'wind', name: 'Wind', category: 'Nature', icon: 'air', file: 'Strong Gusty Wind.mp3', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDn6_KCyvGgCLSifncjVSfs2fK1C4I3lvoZmx0VWFfCAb7bYMdWWJvXp9eV9Xg0Ae9zvYrIawPrWDHRpsx9UpoQI8_o0naheKZxfuG-dx-34O9rC2NTIKyxmoROPFTX2O3BVCSwbp-dE6KpLU5uiBfVF1MA6-IvnatCDSMvAhdgjz_vm2gWrv4Q5S5IMeFsD4Xvoc5UosXNRty6ThSe8FHWCK77KHEsmNK_wiqoXrfE-W50tHN-TNwZSPd8br60P3FMTU_t2e1EUUk' },
    { id: 'fireplace', name: 'Campfire', category: 'Nature', icon: 'local_fire_department', file: 'Campfire.mp3', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT4IMwy8G6Uzw5NNKAgRSkaw2XWw34ifeoa2c6rnHH8dBKYeeZjNOcvTlZSk5WyBBL3Ogqmikb9oU8p7MYqCnKK_XJREc3dud9PouGrnff5IDsLIjyOXaCRk1yKRqvSMU2t-on8XDzbm84FbrDQ_o4oFFyBd8UWdEx3GmeBur_TNQezrejK4EWygiVN474KCtqyvPJDh3LGto4qmicat2Ry0VvHDIOFM1A1vhgfefw0_G_hADrxIDAlorlqg1vx6N5cS682ZJ5HSQ' },
    { id: 'afternoon_open_field', name: 'Afternoon Open Field', category: 'Nature', icon: 'eco', file: 'Afternoon Open field.mp3' },
    { id: 'crickets_insects', name: 'Crickets & Insects', category: 'Nature', icon: 'bug_report', file: 'Crickets and Insects.mp3' },
    { id: 'crickets', name: 'Crickets', category: 'Nature', icon: 'bug_report', file: 'Crickets.mp3' },
    { id: 'dawn_skyline', name: 'Dawn Skyline', category: 'Nature', icon: 'wb_sunny', file: 'Dawn skyline.mp3' },
    { id: 'grasshopper_summer', name: 'Summer Grasshopper', category: 'Nature', icon: 'bug_report', file: 'Grasshopper - Summer.mp3' },
    { id: 'insect', name: 'Insect', category: 'Nature', icon: 'bug_report', file: 'Insect.mp3' },
    { id: 'nature', name: 'Nature', category: 'Nature', icon: 'landscape', file: 'Nature.mp3' },
    { id: 'rising_summer_rain', name: 'Rising Summer Rain', category: 'Nature', icon: 'rainy', file: 'Rising summer rain.mp3' },
    { id: 'summer_birds_singing', name: 'Summer Birds', category: 'Nature', icon: 'flutter_dash', file: 'Summer Birds Singing.mp3' },
    { id: 'summer_cicadas', name: 'Summer Cicadas', category: 'Nature', icon: 'bug_report', file: 'Summer Cicadas.mp3' },
    { id: 'summer_forest', name: 'Summer Forest', category: 'Nature', icon: 'forest', file: 'Summer Forest.mp3' },
    { id: 'summer_morning', name: 'Summer Morning', category: 'Nature', icon: 'wb_twilight', file: 'Summer Morning.mp3' },
    { id: 'summer_night', name: 'Summer Night', category: 'Nature', icon: 'nights_stay', file: 'Summer Night.mp3' },
    { id: 'wind_01', name: 'Wind 01', category: 'Nature', icon: 'air', file: 'Wind 01.mp3' },
    { id: 'wind_02', name: 'Wind 02', category: 'Nature', icon: 'air', file: 'Wind 02.mp3' },
    { id: 'wind_03', name: 'Wind 03', category: 'Nature', icon: 'air', file: 'Wind 03.mp3' },
    { id: 'windy_residential', name: 'Windy Residential', category: 'Nature', icon: 'air', file: 'Windy Residential.mp3' },
  ],
  Ambient: [
    { id: 'brown', name: 'Brown Noise', category: 'Ambient', icon: 'noise_aware', file: 'brown.mp3' },
    { id: 'white', name: 'White Noise', category: 'Ambient', icon: 'radio', file: 'white.mp3' },
    { id: 'binaural', name: 'Binaural', category: 'Ambient', icon: 'headphones', file: 'binaural.mp3' },
    { id: 'cafe', name: 'Cafe', category: 'Ambient', icon: 'local_cafe', file: 'cafe.mp3' },
  ],
  Mechanical: [
    { id: 'city', name: 'City', category: 'Mechanical', icon: 'location_city', file: 'city.mp3' },
    { id: 'control_tower', name: 'Control Tower', category: 'Mechanical', icon: 'cell_tower', file: 'Control Tower.mp3' },
    { id: 'diesel_train_passing', name: 'Diesel Train Passing', category: 'Mechanical', icon: 'train', file: 'Diesel Train Passing.mp3' },
    { id: 'heathrow_air_traffic', name: 'Air Traffic', category: 'Mechanical', icon: 'flight', file: 'Heathrow Air Traffic.mp3' },
    { id: 'trains_diesel_electric', name: 'Diesel Electric Train', category: 'Mechanical', icon: 'train', file: 'Trains Diesel Electric.mp3' },
  ],
  Crowd: [
    { id: 'arena_crowd', name: 'Arena Crowd', category: 'Crowd', icon: 'groups', file: 'Arena Crowd.mp3' },
    { id: 'baby_crying', name: 'Baby Crying', category: 'Crowd', icon: 'child_care', file: 'Baby loud lament crying.mp3' },
    { id: 'baseball_crowd', name: 'Baseball Crowd', category: 'Crowd', icon: 'sports_baseball', file: 'Baseball Crowd.mp3' },
    { id: 'baseball_stadium', name: 'Baseball Stadium', category: 'Crowd', icon: 'stadium', file: 'Baseball Stadium Background.mp3' },
    { id: 'basketball_crowd', name: 'Basketball Crowd', category: 'Crowd', icon: 'sports_basketball', file: 'Basketball Crowd.mp3' },
    { id: 'kids_amusement', name: 'Amusement Park', category: 'Crowd', icon: 'attractions', file: 'Kids In Amusement Park.mp3' },
    { id: 'village_playground', name: 'Village Playground', category: 'Crowd', icon: 'sports_gymnastics', file: 'Village And Playground.mp3' },
    { id: 'prisoner_chains', name: 'Prisoner Chains', category: 'Crowd', icon: 'link', file: 'Prisoner in chains heavy footsteps.mp3' },
  ]
};

const ALL_SOUNDS_FLAT = Object.values(ALL_SOUNDS_CONFIG).flat();
const SOUND_MAP = ALL_SOUNDS_FLAT.reduce((acc, sound) => { acc[sound.id] = sound; return acc; }, {});

// --- HomePage View ---
const HomePage = ({ navigateToMixer, navigateToLibrary }) => (
  <main className="relative min-h-screen">
    {/* NavBar */}
    <nav className="fixed top-0 w-full z-50 bg-slate-900/40 dark:bg-slate-950/40 backdrop-blur-xl flex justify-between items-center px-10 py-6">
      <div className="text-2xl font-serif italic text-slate-100">AudioAmbient</div>
      <div className="hidden md:flex gap-12">
        <a className="text-primary font-medium border-b border-primary/30 pb-1 font-serif font-light tracking-tight transition-all duration-300 cursor-pointer">Home</a>
        <a onClick={navigateToMixer} className="text-slate-400 hover:text-slate-200 transition-colors font-serif font-light tracking-tight hover:text-primary transition-all duration-300 cursor-pointer">Audio Mixer</a>
      </div>
      <div className="flex items-center gap-6">
        <button className="text-primary font-serif font-light tracking-tight hover:text-cyan-300 transition-all duration-300">Go Premium</button>
        <span className="material-symbols-outlined text-slate-200 cursor-pointer text-2xl active:scale-95 duration-200 ease-out">account_circle</span>
      </div>
    </nav>

    {/* Hero Section */}
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img className="w-full h-full object-cover opacity-40 mix-blend-luminosity" alt="misty mountains" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_vwcwb8Ndlf3cevXmUJqE3sm2ndSp4c3ixbDa0E-X3HDl3g41eGAm2wCXSrs9cXC_XnAgRS9CuueF38XAkz2icIHj3oigN-Wm8NUCJN3mFZj23minbwZOIOZ1x-ZB1IPFP9JktHlVEaok7_Y__lDqZqUq-l0KoX6G9nlweJtxWxqwNz-H70WkGZy9al3-Xh1PcKGgSULVjLQg7lkcEoDdfIsmFR2nn3A0mWIz9cDviGuvZv9fasbdJwDoJHIEtXloWrqc5QlC11U"/>
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background"></div>
        <div className="absolute inset-0 hero-glow"></div>
      </div>
      <div className="relative z-10 text-center px-6 max-w-5xl pt-24">
        <h1 className="font-headline text-6xl md:text-8xl font-light tracking-tight mb-8 text-on-surface">
          Master Your <span className="italic text-primary">Environment</span>
        </h1>
        <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-12 font-light leading-relaxed">
          Sculpt your personal acoustic sanctuary with high-fidelity atmospheric layers designed for focus, rest, and transcendence.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <button onClick={navigateToMixer} className="px-10 py-4 bg-primary text-on-primary font-medium rounded-full shadow-[0_0_20px_rgba(47,217,244,0.3)] hover:shadow-[0_0_30px_rgba(47,217,244,0.5)] transition-all active:scale-95">
            Start Mixing Free
          </button>
          <button onClick={navigateToLibrary} className="px-10 py-4 glass-panel edge-light border border-outline-variant/15 text-on-surface rounded-full hover:bg-surface-variant/60 transition-all">
            Explore Library
          </button>
        </div>
      </div>
    </section>

    {/* Features Bento Grid */}
    <section className="py-24 px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 glass-panel edge-light rounded-3xl p-10 flex flex-col justify-end min-h-[400px] relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    <img className="w-full h-full object-cover" alt="waves" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9DoIOKRSzDZfEKTryYW8Qf8O1in4vVS2l8_jFRGqauAKJON_pYHRc_yX8_VaZb49tR1_NOZX2YZ35v5-eoJzZkU_7UkYU_YDHTWN7iQWnmPe3QMDdyRk3UFqj3-zPqn0pjqM3ck10vBebYhHDbkSGXo5XTS-AE1ilP0fCNqXfP9ra5wQ2iQq7oPPvKyC1fyQIx_wGohiBDsNEpyuL3qIfEbjDFTaltUOnOhGXdZhPN6QAGQhhLnUuUxrzYAfKoV_9kQNh9b0q0og"/>
                </div>
                <div className="relative z-10">
                    <span className="material-symbols-outlined text-primary text-4xl mb-6">waves</span>
                    <h3 className="font-headline text-4xl mb-4">Neural-Adaptive Rhythms</h3>
                    <p className="text-on-surface-variant max-w-lg font-light leading-relaxed">
                        Our proprietary engine adjusts sound frequencies in real-time based on your session duration to maximize cognitive flow.
                    </p>
                </div>
            </div>
            <div className="md:col-span-4 bg-surface-container-low rounded-3xl p-10 flex flex-col gap-6 group hover:bg-surface-container transition-colors duration-500">
                <span className="material-symbols-outlined text-secondary text-4xl">forest</span>
                <div>
                    <h3 className="font-headline text-2xl mb-2">Organic Textures</h3>
                    <p className="text-sm text-on-surface-variant font-light leading-relaxed">Field recordings from the world's most remote landscapes, captured in 96kHz/24-bit resolution.</p>
                </div>
            </div>
            <div className="md:col-span-4 bg-surface-container-low rounded-3xl p-10 flex flex-col gap-6 group hover:bg-surface-container transition-colors duration-500">
                <span className="material-symbols-outlined text-primary text-4xl">settings_slow_motion</span>
                <div>
                    <h3 className="font-headline text-2xl mb-2">Precision Control</h3>
                    <p className="text-sm text-on-surface-variant font-light leading-relaxed">Independently modulate ten discrete layers of white noise, mechanical hums, and natural mists.</p>
                </div>
            </div>
            <div className="md:col-span-8 glass-panel edge-light rounded-3xl overflow-hidden relative min-h-[300px]">
                <img className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" alt="desk" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDctrP42abB0V7uM7FxRNSlteF0DpvZdwmwkgvoSZgaCD2TJ29LrHyMMiJx6Hqul9abJzMxx26KZJHLpos2PE5kcNxMn9LR3POrUU7loR3PXCukqB116L9svNoiKnuz-6Hk3lW36MkIrP91FMr5ceedhQyxRglwOVdf5qsuqDEuhLhkBnSHMLJFtVqeeb1i_ZNe80m_ZdaY76V8swGSil9p2d2ubWBgGRqFh3UOVCluR3ikVMOUYygZY1BtdutGz-gWF2sGMWVg6jA"/>
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent p-10 flex flex-col justify-center">
                    <h3 className="font-headline text-3xl mb-2">Anywhere, Anytime</h3>
                    <p className="text-on-surface-variant max-w-xs font-light">Available across all platforms with seamless cloud sync.</p>
                </div>
            </div>
        </div>
    </section>

    {/* Pricing Tiers */}
    <section className="py-24 px-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
            <h2 className="font-headline text-5xl mb-4">Choose Your Silence</h2>
            <p className="text-on-surface-variant font-light">Transparent pricing for deep work and deeper rest.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-surface-container-low p-10 rounded-[2rem] flex flex-col items-start hover:translate-y-[-8px] transition-all duration-500">
                <span className="px-3 py-1 bg-surface-container-highest text-[10px] uppercase tracking-widest text-on-surface-variant rounded-full mb-8">Basic</span>
                <h4 className="font-headline text-3xl mb-2">Starter</h4>
                <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-light text-on-surface">$0</span><span className="text-on-surface-variant text-sm">/ forever</span>
                </div>
                <ul className="space-y-4 mb-12 flex-grow">
                    <li className="flex items-center gap-3 text-sm text-on-surface-variant font-light"><span className="material-symbols-outlined text-primary text-lg">check</span> 12 Core Ambiences</li>
                    <li className="flex items-center gap-3 text-sm text-on-surface-variant font-light"><span className="material-symbols-outlined text-primary text-lg">check</span> Standard Audio Quality</li>
                </ul>
                <button className="w-full py-4 border border-outline-variant/30 text-on-surface rounded-xl hover:bg-surface-container-highest transition-colors">Start Free</button>
            </div>
            {/* Pro */}
            <div className="glass-panel edge-light p-10 rounded-[2rem] flex flex-col items-start border border-primary/20 relative shadow-[0_20px_50px_rgba(47,217,244,0.05)] translate-y-[-16px]">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 rounded-full text-[10px] uppercase tracking-widest text-on-primary font-bold">Most Popular</div>
                <span className="px-3 py-1 bg-primary/10 text-[10px] uppercase tracking-widest text-primary rounded-full mb-8">Subscription</span>
                <h4 className="font-headline text-3xl mb-2">Pro</h4>
                <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-light text-on-surface">$9</span><span className="text-on-surface-variant text-sm">/ month</span>
                </div>
                <ul className="space-y-4 mb-12 flex-grow">
                    <li className="flex items-center gap-3 text-sm text-on-surface font-light"><span className="material-symbols-outlined text-primary text-lg">check</span> 200+ Premium Layers</li>
                    <li className="flex items-center gap-3 text-sm text-on-surface font-light"><span className="material-symbols-outlined text-primary text-lg">check</span> Lossless Audio Support</li>
                    <li className="flex items-center gap-3 text-sm text-on-surface font-light"><span className="material-symbols-outlined text-primary text-lg">check</span> Offline Access</li>
                </ul>
                <button className="w-full py-4 bg-primary text-on-primary rounded-xl font-medium shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">Get Pro</button>
            </div>
            {/* Lifetime */}
            <div className="bg-surface-container-low p-10 rounded-[2rem] flex flex-col items-start hover:translate-y-[-8px] transition-all duration-500">
                <span className="px-3 py-1 bg-surface-container-highest text-[10px] uppercase tracking-widest text-on-surface-variant rounded-full mb-8">One-time</span>
                <h4 className="font-headline text-3xl mb-2">Lifetime</h4>
                <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-light text-on-surface">$149</span><span className="text-on-surface-variant text-sm">/ once</span>
                </div>
                <ul className="space-y-4 mb-12 flex-grow">
                    <li className="flex items-center gap-3 text-sm text-on-surface-variant font-light"><span className="material-symbols-outlined text-primary text-lg">check</span> All Pro Features</li>
                    <li className="flex items-center gap-3 text-sm text-on-surface-variant font-light"><span className="material-symbols-outlined text-primary text-lg">check</span> Future Content Updates</li>
                </ul>
                <button className="w-full py-4 border border-outline-variant/30 text-on-surface rounded-xl hover:bg-surface-container-highest transition-colors">Buy Lifetime</button>
            </div>
        </div>
    </section>

    {/* Footer */}
    <footer className="py-12 px-10 border-t border-outline-variant/10 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-xl font-serif italic text-slate-100">AudioAmbient</div>
            <div className="flex gap-8 text-xs uppercase tracking-widest text-on-surface-variant font-light">
                <a className="hover:text-primary transition-colors cursor-pointer">Privacy</a>
                <a className="hover:text-primary transition-colors cursor-pointer">Terms</a>
                <a className="hover:text-primary transition-colors cursor-pointer">Contact</a>
            </div>
            <p className="text-[10px] text-outline font-light">© 2026 AUDIOAMBIENT STUDIOS. ALL RIGHTS RESERVED.</p>
        </div>
    </footer>
  </main>
);

// --- Component: SideNavBar ---
const SideNavBar = ({ currentView, setCurrentView }) => (
  <nav className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col p-8 bg-slate-950/60 backdrop-blur-2xl rounded-r-3xl">
    <div className="mb-12">
      <h2 className="text-xl font-serif text-primary">AudioAmbient</h2>
      <p className="font-sans text-[10px] uppercase tracking-widest text-slate-500 mt-1">Deep Focus Active</p>
    </div>
    <ul className="space-y-4 flex-grow">
      <li>
        <button onClick={() => setCurrentView('library')} className={`w-full flex items-center gap-4 p-3 transition-colors rounded-xl ${currentView === 'library' ? 'text-cyan-400 font-bold bg-cyan-950/30' : 'text-slate-500 hover:text-cyan-200'}`}>
          <span className="material-symbols-outlined">library_music</span>
          <span className="font-sans text-xs uppercase tracking-widest">Library</span>
        </button>
      </li>
      <li>
        <button onClick={() => setCurrentView('mixer')} className={`w-full flex items-center gap-4 p-3 transition-colors rounded-xl ${currentView === 'mixer' ? 'text-cyan-400 font-bold bg-cyan-950/30' : 'text-slate-500 hover:text-cyan-200'}`}>
          <span className="material-symbols-outlined">tune</span>
          <span className="font-sans text-xs uppercase tracking-widest">Mixer</span>
        </button>
      </li>
      <li>
        <button onClick={() => setCurrentView('home')} className="w-full flex items-center gap-4 text-slate-500 hover:text-cyan-200 p-3 transition-colors rounded-xl">
          <span className="material-symbols-outlined">home</span>
          <span className="font-sans text-xs uppercase tracking-widest">Home View</span>
        </button>
      </li>
    </ul>
    <div className="mt-auto flex items-center gap-3 p-4 bg-surface-container-low/40 rounded-2xl">
      <img alt="User profile" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmDOoB_MYUFLm-wI-1tDn356DQlWHUW4IizuQP-cqFxFllDloUDszyo0B1gbIcoEAJG9gAwtazabxGic8IYFerU_AkLij8oK5RCv178TzBUbN4NnZx3UAeieBhbM69Ip2UBmNhPzyjAYqitY1iGCruWLFfnMT2ImSHynwk9xQ-qL9OGy9Ux2_EryLG6cFBIFBGYVGRvqDegz_Iq7rGXXQTB33k9i4D9Ue-HCJUHslui0oymJLxxUS6jHIuwZPU5gMyMtuw-5XriMI"/>
      <div className="overflow-hidden">
        <p className="text-xs font-semibold truncate text-left text-on-surface">Alex Rivera</p>
        <p className="text-[10px] text-slate-500 text-left">Premium Member</p>
      </div>
    </div>
  </nav>
);

// --- Library View ---
const LibraryPage = ({ setCurrentView, savedSoundscapes, onLoadSoundscape }) => (
  <div className="ml-64 pt-32 px-12 pb-24 relative min-h-screen z-10">
    <section className="mb-16">
      <h1 className="text-6xl font-headline font-semibold text-on-surface mb-6 leading-tight">Explore Your <span className="italic font-normal text-primary">Sanctuary</span></h1>
      <div className="flex flex-wrap gap-3 mt-8">
        <button className="px-5 py-2 rounded-full text-xs font-label tracking-widest uppercase bg-primary text-on-primary glow-hover transition-all">#Focus</button>
        <button className="px-5 py-2 rounded-full text-xs font-label tracking-widest uppercase bg-surface-container-high text-on-surface-variant hover:bg-surface-bright transition-all">#DeepSleep</button>
        <button className="px-5 py-2 rounded-full text-xs font-label tracking-widest uppercase bg-surface-container-high text-on-surface-variant hover:bg-surface-bright transition-all">#Rain</button>
      </div>
    </section>

    <section className="mb-20">
      <div className="flex justify-between items-end mb-8">
        <h3 className="text-2xl font-headline text-on-surface">Recent Soundscapes</h3>
        <button className="text-primary text-xs uppercase tracking-widest font-label hover:opacity-70 transition-opacity">View History</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(savedSoundscapes && savedSoundscapes.length > 0 ? savedSoundscapes : []).map((item, i) => (
          <div key={item.id || i} className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-surface-container transition-transform duration-500 hover:-translate-y-2 cursor-pointer" onClick={() => onLoadSoundscape(item)}>
            <img className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:scale-110 transition-transform duration-700" src={item.image} alt={item.title}/>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-8 glass-panel opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[10px] uppercase tracking-[0.2em] text-secondary mb-2">{item.tag}</span>
              <h4 className="text-2xl font-headline text-on-surface mb-3">{item.title}</h4>
              <p className="text-sm text-tertiary font-light mb-6 leading-relaxed">{item.desc || "A custom synthesized atmospheric soundscape."}</p>
              <button className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-on-primary glow-hover transition-all">
                <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

// --- Component: Custom Vertical Slider ---
const VerticalSliderLevel = ({ level, onChange, soundId }) => {
  const containerRef = useRef(null);
  
  const handleInput = (e) => {
    // Basic calculation for vertical slider dragging logic if standard range is difficult to style cross-browser.
    // Instead we map standard range properties but let CSS styling take care of the vertical alignment.
    onChange(soundId, parseInt(e.target.value));
  };

  return (
    <div className="flex flex-col items-center justify-between h-32 w-4 relative">
        <div className="absolute inset-y-0 w-[2px] bg-outline-variant/50 rounded-full left-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 w-[2px] bg-primary rounded-full left-1/2 -translate-x-1/2 glow-track" style={{ height: `${level}%`, boxShadow: level > 0 ? "0 0 4px 0 rgba(47, 217, 244, 0.5)" : "none" }}></div>
        <input 
            type="range" 
            min="0" 
            max="100" 
            value={level} 
            onChange={handleInput}
            className="absolute inset-y-0 w-8 opacity-0 cursor-pointer -translate-x-1/2 left-1/2 z-20"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
        />
        <div className="absolute w-1.5 h-4 bg-primary rounded-full left-1/2 -translate-x-1/2 cursor-ns-resize shadow-[0_0_8px_rgba(47,217,244,0.8)] pointer-events-none z-10" style={{ bottom: `calc(${level}% - 8px)` }}></div>
    </div>
  )
};

// --- Mixer View ---
const MixerPage = ({ volumes, activeSoundIds, isPlaying, setVolumes, setIsPlaying, setActiveSoundIds, handleVolumeChange, togglePlay, addToMixer, removeFromMixer, onExportClick, onSaveMix }) => {
  const activeMixerSounds = useMemo(() => activeSoundIds.map(id => SOUND_MAP[id]).filter(Boolean), [activeSoundIds]);

  return (
    <div className="ml-64 pt-32 px-12 pb-24 relative min-h-screen z-10 flex flex-col">
      <header className="flex items-center justify-between whitespace-nowrap mb-10 glass-panel rounded-xl px-8 py-6 ambient-shadow">
        <div className="flex flex-col gap-1">
          <h2 className="text-on-surface text-4xl font-headline font-medium leading-tight tracking-[-0.02em]">Mixer Deck</h2>
          <p className="text-secondary text-sm font-label tracking-[0.05em] uppercase">Now Playing</p>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onSaveMix} className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary/20 text-primary text-sm font-label tracking-[0.05em] uppercase hover:bg-primary/30 transition-colors gap-2 border border-primary/20 mr-2">
            <span className="material-symbols-outlined text-sm">save</span> Auto-Save Mix
          </button>
          <button onClick={() => { setActiveSoundIds([]); setVolumes(v => Object.keys(v).reduce((acc, k) => ({...acc, [k]: 0}), {})) }} className="text-primary text-sm font-label tracking-[0.05em] uppercase hover:text-primary-fixed transition-colors">
            Clear All
          </button>
          
          <div className="relative group/add">
            <button className="flex items-center justify-center rounded-lg h-10 px-6 bg-surface-container-high text-on-surface text-sm font-label tracking-[0.05em] uppercase hover:bg-surface-bright transition-colors gap-2">
                <span className="material-symbols-outlined text-sm">add</span> Add Sound
            </button>
            <div className="absolute right-0 top-12 w-64 bg-surface-container-high rounded-xl p-4 shadow-2xl opacity-0 invisible group-hover/add:opacity-100 group-hover/add:visible transition-all z-20 max-h-64 overflow-y-auto">
                {ALL_SOUNDS_FLAT.map(sound => (
                    <div key={sound.id} onClick={() => !activeSoundIds.includes(sound.id) && addToMixer(sound.id)} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-surface-bright ${activeSoundIds.includes(sound.id) ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-sm">{sound.icon}</span>
                            <span className="text-sm font-medium">{sound.name}</span>
                        </div>
                        {activeSoundIds.includes(sound.id) && <span className="material-symbols-outlined text-primary text-xs">check</span>}
                    </div>
                ))}
            </div>
          </div>

          <button onClick={togglePlay} className="flex items-center justify-center rounded-full size-14 bg-gradient-to-tr from-primary to-primary-container text-on-primary ambient-shadow hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>{isPlaying ? 'pause' : 'play_arrow'}</span>
          </button>
          <button onClick={onExportClick} className="flex items-center justify-center rounded-lg h-10 px-6 bg-surface-container-highest text-on-surface border border-outline-variant/15 text-sm font-label tracking-[0.05em] uppercase hover:bg-surface-bright transition-colors">
            Export
          </button>
        </div>
      </header>
      
      <div className="flex-1 w-full max-w-[1024px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
        {activeMixerSounds.map(sound => (
          <div key={sound.id} className="flex flex-col gap-4 rounded-xl glass-panel p-6 ambient-shadow relative group">
            <button onClick={() => removeFromMixer(sound.id)} className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100 z-20">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-start justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-full bg-surface-container-low text-primary">
                  <span className="material-symbols-outlined text-2xl">{sound.icon}</span>
                </div>
                <div className="flex flex-col">
                  <p className="text-on-surface text-lg font-headline font-medium leading-tight">{sound.name}</p>
                  <p className="text-secondary text-xs font-label tracking-[0.05em] uppercase">{sound.category}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4 h-32 relative z-10">
              <VerticalSliderLevel level={volumes[sound.id] || 0} onChange={handleVolumeChange} soundId={sound.id} />
              <div 
                className="w-full h-full bg-center bg-no-repeat bg-cover rounded-lg border border-outline-variant/15 relative overflow-hidden" 
                style={{ backgroundImage: `url('${sound.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmqdJL30I4z3hB2Cbh4xo2t-oUIEsI2-ANN0kwkkDQU0-cf3-YJFbAVQX91oiJEApRSMYFr8swNXSp7QawMT5_dbEIPXfq_xNLrwhSRynDpe7lLo6Mh9_esLlmP5wkVZ7dkHjDVbODbTdZ2NsYpOfBV1yxjB3Ga0CYlKxPpQIbQrY4RFgthTaT7xK3BGorcqdZ59yQjv8uKV9CQLTOBDZ7-6ICpBpgdeDBH667jDgT5Rj760MKGgYOB635RIBO-EGuohOtyIN08DQ'}')` }}
              >
                  <div className="absolute inset-0 bg-background/40"></div>
              </div>
            </div>
          </div>
        ))}
        {activeMixerSounds.length === 0 && (
            <div className="col-span-3 h-64 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 rounded-2xl text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-4 opacity-50">tune</span>
                <p className="font-headline text-xl">Mixer is empty</p>
                <p className="text-sm">Add sounds from the top right menu to build your sanctuary.</p>
            </div>
        )}
      </div>
    </div>
  );
};


// --- App Wrapper ---
export default function AudioAmbientApp() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'library', 'mixer'
  const [isPlaying, setIsPlaying] = useState(false);
  const [volumes, setVolumes] = useState(ALL_SOUNDS_FLAT.reduce((acc, sound) => ({ ...acc, [sound.id]: 0 }), {}));
  const [activeSoundIds, setActiveSoundIds] = useState(['rain', 'ocean', 'forest']);
  const [savedSoundscapes, setSavedSoundscapes] = useState([]);
  const audioRefs = useRef({});

  // Export Modal States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [downloadDuration, setDownloadDuration] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);

  // DB Fetch
  useEffect(() => {
    fetch('/api/soundscapes')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setSavedSoundscapes(data);
      })
      .catch(console.error);
  }, []);

  const handleSaveMix = async () => {
    if(activeSoundIds.length === 0) return alert("Mixer is empty! Add sounds first.");
    const title = prompt("Enter a name for your custom Soundscape:");
    if (!title) return;
    
    // Pick generic aesthetic image
    const images = [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDdNCBwWRIG2ezLPSK2DJRVFh6Cyd5JB5JCdrFjbzL6Td4MfnRTAf_OF4SFzshtuId0WlvgQOK_WM7Gn1K1otYg24rSnNbRxnxxlHQCDPQpw1Mvg34NwYKSpyI0adrJdxIhzU3aqMlQN7_ErNmRcYYoXKMOuBT0K3a_FFT3_QXJJd1KxxGoLvEz-Jk7hEYKrfb_t0tTJt1vtOdggcuoCG9ksL0N9NVSZu1MVoLWmlFIZecCI-uvLQlGyWvUIsuo_1viI8G_0XeHLKw",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDUCge0duWunMDITiI-sehdtVnopikgpzbM_iqYSPqc4W-9VRdw8KfeE0PUQo74uf2IhQV1oGKtQA7iLNRBDmpq8CXlbxNAAJWgAKAaelm5ubAKDAfx_udEZkejuqPeOk6ps8Da487Q-iYyZQ8s7dHZtZs4VQaIN2a-REbqah608oPd87u_uogFgv5AQ4pK1KotfWeC6j6kz2GB7UMN768SSgjfEvxFsch9J0n2ZpJLh4SmxV7tNTx34zf6gZkOekZDZ1j1zfikqYo",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuATTuK3naI6tduIlrkiJb5sUEIhUWwrYe87b-7ogRXf7gyehv-OHiM16UI0xVQ4Iiq5yzBNfyBEYs6OPFNEdWIBSU5P1_pfGHjj8Teci4AqwJF6X6jKih2VovG-fwzJNvUiJa3zx3NXPEHymX7t8jXCudO1AAqDEnjkI55T8o9EFvJcD2L1Ih65g3bOiv1AdCKCj0saXPJhm5p4FyYDJgiQH3OwOJEen1vfQTMTE0l38B26_wtTDPTx2SVXqCo8bysoKjmPlt1NZbI"
    ];
    
    const activeVolumes = {};
    activeSoundIds.forEach(id => {
       if(volumes[id] > 0) activeVolumes[id] = volumes[id];
    });

    try {
        const payload = {
            title, tag: 'Custom', 
            image: images[Math.floor(Math.random() * images.length)],
            volumes: activeVolumes, 
            active_sounds: Object.keys(activeVolumes)
        };
        const res = await fetch('/api/soundscapes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const newMix = await res.json();
        setSavedSoundscapes([newMix, ...savedSoundscapes]);
        alert("Soundscape uploaded to the cloud!");
    } catch(err) {
        console.error(err);
        alert("Error saving soundscape to cloud database.");
    }
  };

  const onLoadSoundscape = (soundscape) => {
      // Load saved state
      if (soundscape.active_sounds && soundscape.volumes) {
          const newVols = { ...ALL_SOUNDS_FLAT.reduce((acc, sound) => ({ ...acc, [sound.id]: 0 }), {}) };
          Object.keys(soundscape.volumes).forEach(k => {
             newVols[k] = parseInt(soundscape.volumes[k]);
          });
          setVolumes(newVols);
          setActiveSoundIds(soundscape.active_sounds);
      }
      setCurrentView('mixer');
      setIsPlaying(true); // Auto play
  };

  // Audio Engine Hook
  useEffect(() => {
    ALL_SOUNDS_FLAT.forEach(sound => {
      const audio = new Audio(`/sounds/${sound.file}`);
      audio.loop = true; 
      audio.preload = 'auto';
      audioRefs.current[sound.id] = audio;
    });
    // Set initial volumes
    ['rain', 'ocean', 'forest'].forEach(id => {
       handleVolumeChange(id, 50); 
    });

    return () => Object.values(audioRefs.current).forEach(audio => { audio.pause(); audio.src = ''; });
  }, []);

  useEffect(() => {
    Object.keys(volumes).forEach(id => {
      const audio = audioRefs.current[id];
      const volumeLevel = volumes[id] / 100;
      if (audio) {
        audio.volume = volumeLevel;
        if (isPlaying && volumeLevel > 0) {
          if (audio.paused) audio.play().catch(e => console.warn(`Autoplay prevented for ${id}`, e));
        } else {
          if (!audio.paused) audio.pause();
        }
      }
    });
  }, [volumes, isPlaying]);

  const handleVolumeChange = (id, newVolume) => {
    setVolumes(prev => ({ ...prev, [id]: newVolume }));
    if (!isPlaying && newVolume > 0) setIsPlaying(true);
    if (newVolume > 0) setActiveSoundIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const togglePlay = () => {
    if (isPlaying) Object.values(audioRefs.current).forEach(audio => audio.pause());
    setIsPlaying(!isPlaying);
  };

  const handleDownloadExport = async () => {
    setIsGenerating(true);
    try {
        const activeMixerSounds = activeSoundIds.map(id => SOUND_MAP[id]).filter(Boolean);
        const activeSounds = activeMixerSounds.filter(s => volumes[s.id] > 0);
        if (activeSounds.length === 0) {
            alert("Please add sounds and increase the volume before downloading.");
            setIsGenerating(false);
            return;
        }

        const durationInSeconds = downloadDuration * 60;
        const sampleRate = 44100;
        const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, sampleRate * durationInSeconds, sampleRate);

        const decodePromises = activeSounds.map(async (sound) => {
            const response = await fetch(`/sounds/${sound.file}`);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);

            const source = offlineCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = true;

            const gainNode = offlineCtx.createGain();
            gainNode.gain.value = volumes[sound.id] / 100;

            source.connect(gainNode);
            gainNode.connect(offlineCtx.destination);
            source.start(0);
        });

        await Promise.all(decodePromises);

        const renderedBuffer = await offlineCtx.startRendering();
        const wavData = audioBufferToWav(renderedBuffer);
        const blob = new Blob([new DataView(wavData)], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `AudioAmbient_Mix_${downloadDuration}min.wav`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setIsExportModalOpen(false);
    } catch (error) {
        console.error("Error generating mix:", error);
        alert("Failed to generate mix. Ensure audio files are accessible.");
    } finally {
        setIsGenerating(false);
    }
  };

  const mixerProps = { 
    volumes, 
    activeSoundIds, 
    isPlaying, 
    setVolumes, 
    setIsPlaying, 
    setActiveSoundIds, 
    handleVolumeChange, 
    togglePlay, 
    addToMixer: (id) => { handleVolumeChange(id, 30); }, 
    removeFromMixer: (id) => { setActiveSoundIds(p=>p.filter(s=>s!==id)); handleVolumeChange(id, 0); },
    onExportClick: () => setIsExportModalOpen(true),
    onSaveMix: handleSaveMix
  };

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-container-low via-background to-background"></div>
      <div className="fixed inset-0 -z-10 opacity-20" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDGp91R1OHXPdnx_cLfEJKSurYAdtbNg3WNNjdsvIxPxZ2g_lfx33ZR6VcGf8l83wN9QxgfS0CJfGB0RuZHNG--88YJi5TVYUB8z7YU-YiTDaS7PiBbRC5lpdcmHhK22cysh_QkPng80tC2v4zNh0XLEXLdChst869VtA6SaL9H48JV_7ydBvXetUsBZbEEYfd-Uzm3j_97eECOoYaUMgBM5PgJsEZGaonXkY5m9RJ0q88Fu7t_80nS8bpziB-S0SAIKUdf1_LQhAM')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(120px)' }}></div>

      {currentView !== 'home' && <SideNavBar currentView={currentView} setCurrentView={setCurrentView} />}
      
      {currentView === 'home' && <HomePage navigateToMixer={() => setCurrentView('mixer')} navigateToLibrary={() => setCurrentView('library')} />}
      {currentView === 'library' && <LibraryPage setCurrentView={setCurrentView} savedSoundscapes={savedSoundscapes} onLoadSoundscape={onLoadSoundscape} />}
      {currentView === 'mixer' && <MixerPage {...mixerProps} />}

      {/* Export Modal */}
      {isExportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/40 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-xl p-10 rounded-3xl flex flex-col gap-10 border border-white/5 animate-in fade-in zoom-in duration-500 relative">
                <div className="absolute -z-10 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex justify-between items-start">
                        <h2 className="font-headline text-4xl font-light tracking-tight text-on-surface">Export Your Mix</h2>
                        <button onClick={() => !isGenerating && setIsExportModalOpen(false)} className="text-on-surface/40 hover:text-error transition-colors disabled:opacity-50" disabled={isGenerating}>
                            <span className="material-symbols-outlined text-3xl">close</span>
                        </button>
                    </div>
                    <p className="font-body text-sm font-light text-on-surface-variant tracking-wide max-w-sm">Preserve your unique atmosphere. High-fidelity audio rendering takes just a few moments.</p>
                </div>
                <div className="space-y-12 relative z-10">
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <label className="font-label text-[11px] uppercase tracking-[0.15em] text-on-surface/60">Duration</label>
                            <div className="flex items-baseline gap-1">
                                <span className="font-headline text-3xl text-primary">{downloadDuration}</span>
                                <span className="font-label text-sm text-on-surface/40 uppercase tracking-widest">min</span>
                            </div>
                        </div>
                        <div className="relative py-2">
                            <input disabled={isGenerating} className="zen-slider w-full appearance-none bg-transparent cursor-pointer relative z-10 h-10" max="5" min="1" type="range" value={downloadDuration} onChange={(e) => setDownloadDuration(parseInt(e.target.value))} />
                            <div className="absolute w-full h-[2px] bg-outline-variant/30 left-0 top-1/2 -translate-y-1/2 rounded-full pointer-events-none"></div>
                            <div className="absolute h-[2px] bg-primary left-0 top-1/2 -translate-y-1/2 rounded-full pointer-events-none glow-track" style={{ width: `${(downloadDuration - 1) * 25}%` }}></div>
                            <div className="absolute -bottom-2 w-full flex justify-between px-0.5">
                                <span className="font-label text-[10px] text-on-surface/20">1m</span>
                                <span className="font-label text-[10px] text-on-surface/20">5m</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-surface-container-high/40 p-5 rounded-2xl border border-primary/40 flex flex-col gap-3 transition-all relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/10"></div>
                            <div className="flex justify-between items-center relative z-10">
                                <span className="material-symbols-outlined text-primary/70">audio_file</span>
                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#2fd9f4]"></div>
                            </div>
                            <div className="relative z-10">
                                <div className="font-headline text-lg text-primary">Uncompressed WAV</div>
                                <div className="font-label text-[10px] text-on-surface/60 uppercase tracking-wider">High Fidelity • 44.1kHz</div>
                            </div>
                        </div>
                        <div className="bg-surface-container-high/20 p-5 rounded-2xl border border-white/5 flex flex-col gap-3 opacity-60">
                            <div className="flex justify-between items-center">
                                <span className="material-symbols-outlined text-on-surface/40">music_note</span>
                            </div>
                            <div>
                                <div className="font-headline text-lg">Standard MP3</div>
                                <div className="font-label text-[10px] text-on-surface/40 uppercase tracking-wider">Available Soon</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-6 pt-4 relative z-10">
                    <button onClick={handleDownloadExport} disabled={isGenerating} className="w-full bg-primary text-on-primary font-label text-sm font-semibold py-5 rounded-full uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(47,217,244,0.2)] hover:shadow-[0_0_30px_rgba(47,217,244,0.4)] disabled:opacity-50 transition-all active:scale-[0.98] flex justify-center items-center gap-3">
                        {isGenerating ? <><span className="material-symbols-outlined animate-spin">refresh</span> Synthesizing...</> : 'Generate & Download'}
                    </button>
                </div>
            </div>
          </div>
      )}
    </>
  );
}
