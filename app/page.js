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
  setUint32(length - 44);                        // chunk length (total length - header)

  for (i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
  }

  while (pos < buffer.length) {
      for (i = 0; i < numOfChan; i++) {             
          sample = Math.max(-1, Math.min(1, channels[i][pos])); 
          sample = Math.round(sample < 0 ? sample * 32768 : sample * 32767);
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
    { id: 'binaural', name: 'Binaural', category: 'Ambient', icon: 'headphones', file: 'brown.mp3' },
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

// --- Quick-Start Presets ---
const PRESETS = [
  { name: 'Deep Focus', icon: 'psychology', tag: 'Work', desc: 'Brown noise + rain for flow state', color: 'from-blue-500/20 to-cyan-500/20', sounds: { brown: 60, rain: 40, cafe: 15 } },
  { name: 'Rainy Morning', icon: 'coffee', tag: 'Relax', desc: 'Gentle rain with a café backdrop', color: 'from-amber-500/20 to-orange-500/20', sounds: { rain: 55, cafe: 35, forest: 20 } },
  { name: 'Night Forest', icon: 'dark_mode', tag: 'Sleep', desc: 'Crickets, wind & crackling campfire', color: 'from-emerald-500/20 to-teal-500/20', sounds: { crickets: 45, wind: 30, fireplace: 50 } },
  { name: 'Ocean Drift', icon: 'sailing', tag: 'Relax', desc: 'Waves and wind for deep relaxation', color: 'from-indigo-500/20 to-purple-500/20', sounds: { ocean: 60, wind: 25, white: 10 } },
  { name: 'City Commute', icon: 'train', tag: 'Vibe', desc: 'Train rhythms and urban white noise', color: 'from-slate-500/20 to-zinc-500/20', sounds: { diesel_train_passing: 40, city: 30, white: 20 } },
  { name: 'Summer Meadow', icon: 'wb_sunny', tag: 'Relax', desc: 'Warm birds, gentle breeze & cicadas', color: 'from-yellow-500/20 to-lime-500/20', sounds: { summer_birds_singing: 50, wind: 20, summer_cicadas: 35 } },
  { name: 'Study Lounge', icon: 'menu_book', tag: 'Work', desc: 'Café chatter with brown noise blanket', color: 'from-rose-500/20 to-pink-500/20', sounds: { cafe: 40, brown: 50, rain: 15 } },
  { name: 'Storm Watch', icon: 'thunderstorm', tag: 'Sleep', desc: 'Heavy rain, howling wind & thunder', color: 'from-gray-500/20 to-blue-500/20', sounds: { rising_summer_rain: 60, wind_02: 45, ocean: 20 } },
  { name: 'Wilderness Camp', icon: 'camping', tag: 'Vibe', desc: 'Crackling campfire under open skies', color: 'from-orange-500/20 to-red-500/20', sounds: { fireplace: 55, crickets: 35, wind: 15, nature: 25 } },
  { name: 'White Cocoon', icon: 'noise_aware', tag: 'Work', desc: 'Pure white noise for total isolation', color: 'from-neutral-500/20 to-stone-500/20', sounds: { white: 70, brown: 20 } },
  { name: 'Dawn Chorus', icon: 'wb_twilight', tag: 'Relax', desc: 'Birdsong at sunrise in a quiet field', color: 'from-sky-500/20 to-cyan-500/20', sounds: { dawn_skyline: 55, summer_morning: 40, wind: 10 } },
  { name: 'Control Tower', icon: 'flight', tag: 'Vibe', desc: 'Air traffic radio & airport ambience', color: 'from-teal-500/20 to-emerald-500/20', sounds: { control_tower: 50, heathrow_air_traffic: 40, white: 10 } },
  { name: 'Reading Nook', icon: 'auto_stories', tag: 'Work', desc: 'Soft birds and protective brown noise', color: 'from-amber-700/20 to-yellow-600/20', sounds: { forest: 25, wind_01: 20, brown: 45 } },
  { name: 'Cozy Cabin', icon: 'house', tag: 'Relax', desc: 'Roaring fire and gusty mountain wind', color: 'from-red-600/20 to-orange-600/20', sounds: { fireplace: 65, wind: 50, rain: 20 } },
  { name: 'Urban Rain', icon: 'location_city', tag: 'Relax', desc: 'City hum under a curtain of rainfall', color: 'from-blue-700/20 to-indigo-700/20', sounds: { city: 35, rain: 60, white: 15 } },
  { name: 'Autumn Breeze', icon: 'eco', tag: 'Sleep', desc: 'Cool wind through trees and crickets', color: 'from-orange-400/20 to-yellow-700/20', sounds: { wind_02: 40, crickets: 35, nature: 30 } },
  { name: 'Mountain Top', icon: 'landscape', tag: 'Relax', desc: 'Pristine high-altitude wind and dawn', color: 'from-cyan-700/20 to-blue-900/20', sounds: { wind: 60, wind_03: 35, dawn_skyline: 45 } },
  { name: 'Crowded Cafe', icon: 'local_cafe', tag: 'Vibe', desc: 'The bustling energy of a full bistro', color: 'from-brown-500/20 to-amber-900/20', sounds: { cafe: 65, city: 25, arena_crowd: 10 } },
  { name: 'Binaural Flow', icon: 'headphones', tag: 'Work', desc: 'Deep focus with binaural rain layers', color: 'from-purple-700/20 to-indigo-900/20', sounds: { binaural: 50, brown: 40, rain: 25 } },
  { name: 'Summer Eve', icon: 'nights_stay', tag: 'Sleep', desc: 'Warm night air and field insects', color: 'from-indigo-900/20 to-black/20', sounds: { summer_night: 55, crickets_insects: 40, wind_01: 15 } },
];

// --- HomePage View ---
const HomePage = ({ navigateToMixer, navigateToLibrary, onLoadPreset }) => {
  const [filter, setFilter] = useState('All');
  
  const filteredPresets = useMemo(() => {
    if (filter === 'All') return PRESETS;
    return PRESETS.filter(p => p.tag === filter);
  }, [filter]);

  return (
    <main className="relative min-h-screen">
      {/* NavBar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/40 dark:bg-slate-950/40 backdrop-blur-xl flex justify-between items-center px-6 md:px-10 py-5 md:py-6">
        <div className="text-xl md:text-2xl font-serif italic text-slate-100">AudioAmbient</div>
        <div className="hidden md:flex gap-12">
          <a className="text-primary font-medium border-b border-primary/30 pb-1 font-serif font-light tracking-tight transition-all duration-300 cursor-pointer">Home</a>
          <a onClick={navigateToMixer} className="text-slate-400 hover:text-slate-200 font-serif font-light tracking-tight hover:text-primary transition-all duration-300 cursor-pointer">Audio Mixer</a>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={navigateToMixer} className="md:hidden px-4 py-2 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">Mixer</button>
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
        <h1 className="font-headline text-5xl md:text-8xl font-light tracking-tight mb-6 md:mb-8 text-on-surface">
          Master Your <span className="italic text-primary">Environment</span>
        </h1>
        <p className="text-base md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 md:mb-12 font-light leading-relaxed">
          Sculpt your personal acoustic sanctuary with high-fidelity atmospheric layers designed for focus, rest, and transcendence.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
          <button onClick={navigateToMixer} className="w-full md:w-auto px-10 py-4 bg-primary text-on-primary font-medium rounded-full shadow-[0_0_20px_rgba(47,217,244,0.3)] hover:shadow-[0_0_30px_rgba(47,217,244,0.5)] transition-all active:scale-95">
            Start Mixing Now
          </button>
          <button onClick={navigateToLibrary} className="w-full md:w-auto px-10 py-4 glass-panel edge-light border border-outline-variant/15 text-on-surface rounded-full hover:bg-surface-variant/60 transition-all">
            Explore Library
          </button>
        </div>
      </div>
    </section>

    {/* Features Bento Grid */}
    <section className="py-16 md:py-24 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            <div className="md:col-span-8 glass-panel edge-light rounded-3xl p-8 md:p-10 flex flex-col justify-end min-h-[300px] md:min-h-[400px] relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    <img className="w-full h-full object-cover" alt="waves" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9DoIOKRSzDZfEKTryYW8Qf8O1in4vVS2l8_jFRGqauAKJON_pYHRc_yX8_VaZb49tR1_NOZX2YZ35v5-eoJzZkU_7UkYU_YDHTWN7iQWnmPe3QMDdyRk3UFqj3-zPqn0pjqM3ck10vBebYhHDbkSGXo5XTS-AE1ilP0fCNqXfP9ra5wQ2iQq7oPPvKyC1fyQIx_wGohiBDsNEpyuL3qIfEbjDFTaltUOnOhGXdZhPN6QAGQhhLnUuUxrzYAfKoV_9kQNh9b0q0og"/>
                </div>
                <div className="relative z-10">
                    <span className="material-symbols-outlined text-primary text-4xl mb-4 md:mb-6">waves</span>
                    <h3 className="font-headline text-3xl md:text-4xl mb-3 md:mb-4">Neural-Adaptive Rhythms</h3>
                    <p className="text-on-surface-variant max-w-lg font-light leading-relaxed text-sm md:text-base">
                        Our proprietary engine adjusts sound frequencies in real-time based on your session duration to maximize cognitive flow.
                    </p>
                </div>
            </div>
            <div className="md:col-span-4 bg-surface-container-low rounded-3xl p-8 md:p-10 flex flex-col gap-4 md:gap-6 group hover:bg-surface-container transition-colors duration-500">
                <span className="material-symbols-outlined text-secondary text-4xl">forest</span>
                <div>
                    <h3 className="font-headline text-2xl mb-2">Organic Textures</h3>
                    <p className="text-sm text-on-surface-variant font-light leading-relaxed">Field recordings from the world's most remote landscapes, captured in 96kHz/24-bit resolution.</p>
                </div>
            </div>
            <div className="md:col-span-4 bg-surface-container-low rounded-3xl p-8 md:p-10 flex flex-col gap-4 md:gap-6 group hover:bg-surface-container transition-colors duration-500">
                <span className="material-symbols-outlined text-primary text-4xl">settings_slow_motion</span>
                <div>
                    <h3 className="font-headline text-2xl mb-2">Precision Control</h3>
                    <p className="text-sm text-on-surface-variant font-light leading-relaxed">Independently modulate ten discrete layers of white noise, mechanical hums, and natural mists.</p>
                </div>
            </div>
            <div className="md:col-span-8 glass-panel edge-light rounded-3xl overflow-hidden relative min-h-[250px] md:min-h-[300px]">
                <img className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" alt="desk" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDctrP42abB0V7uM7FxRNSlteF0DpvZdwmwkgvoSZgaCD2TJ29LrHyMMiJx6Hqul9abJzMxx26KZJHLpos2PE5kcNxMn9LR3POrUU7loR3PXCukqB116L9svNoiKnuz-6Hk3lW36MkIrP91FMr5ceedhQyxRglwOVdf5qsuqDEuhLhkBnSHMLJFtVqeeb1i_ZNe80m_ZdaY76V8swGSil9p2d2ubWBgGRqFh3UOVCluR3ikVMOUYygZY1BtdutGz-gWF2sGMWVg6jA"/>
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent p-8 md:p-10 flex flex-col justify-center">
                    <h3 className="font-headline text-2xl md:text-3xl mb-2">Anywhere, Anytime</h3>
                    <p className="text-on-surface-variant max-w-xs font-light text-sm md:text-base">Available across all platforms with seamless cloud sync.</p>
                </div>
            </div>
        </div>
    </section>

    {/* Presets Showcase */}
    <section className="py-12 md:py-20 px-6 md:px-10 max-w-7xl mx-auto">
      <div className="text-center mb-10 md:mb-14">
        <span className="material-symbols-outlined text-primary text-4xl mb-4">auto_awesome</span>
        <h2 className="font-headline text-3xl md:text-5xl font-light text-on-surface mb-3">One-Tap Soundscapes</h2>
        <p className="text-on-surface-variant font-light max-w-lg mx-auto text-sm md:text-base">Curated presets to instantly set the mood. Tap any card to start mixing.</p>
      </div>

      {/* Tag filter row */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {['All', 'Work', 'Relax', 'Sleep', 'Vibe'].map(tag => (
          <button 
            key={tag} 
            onClick={() => setFilter(tag)}
            className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-medium transition-all duration-300 ${filter === tag ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 text-on-surface-variant/60 border-white/5 hover:bg-white/10'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {filteredPresets.map(preset => (
          <button
            key={preset.name}
            onClick={() => onLoadPreset(preset)}
            className="preset-card text-left group relative overflow-hidden h-full flex flex-col"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${preset.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-2xl">{preset.icon}</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-on-surface-variant/40 font-label bg-white/5 px-2 py-0.5 rounded-full">{preset.tag}</span>
              </div>
              <p className="text-on-surface text-sm font-medium mb-1 group-hover:text-primary transition-colors">{preset.name}</p>
              <p className="text-on-surface-variant/50 text-[11px] leading-relaxed line-clamp-2">{preset.desc}</p>
              <div className="mt-auto pt-4 flex items-center gap-1 text-primary/50 text-[10px] font-label tracking-wider uppercase group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-xs">play_circle</span>
                Tap to play
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-12 md:py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="glass-panel edge-light rounded-[2rem] p-10 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 hero-glow opacity-60"></div>
          <div className="relative z-10">
            <span className="material-symbols-outlined text-primary text-5xl mb-6">headphones</span>
            <h2 className="font-headline text-3xl md:text-5xl font-light mb-4 text-on-surface">Ready to find your flow?</h2>
            <p className="text-on-surface-variant font-light mb-8 md:mb-10 max-w-md mx-auto text-sm md:text-base">Layer ambient sounds, customize your perfect atmosphere, and export high-fidelity audio — all free.</p>
            <button onClick={navigateToMixer} className="w-full md:w-auto px-10 py-4 bg-primary text-on-primary font-medium rounded-full shadow-[0_0_20px_rgba(47,217,244,0.3)] hover:shadow-[0_0_30px_rgba(47,217,244,0.5)] transition-all active:scale-95">
              Open the Mixer
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-10 md:py-12 px-6 md:px-10 border-t border-outline-variant/10 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
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
};

// --- Component: SideNavBar (Desktop) + BottomNav (Mobile) ---
const SideNavBar = ({ currentView, setCurrentView }) => (
  <>
    {/* Desktop Sidebar — hidden on mobile */}
    <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 z-50 flex-col p-8 bg-slate-950/60 backdrop-blur-2xl rounded-r-3xl">
      <div className="mb-12">
        <h2 className="text-xl font-serif text-primary">AudioAmbient</h2>
        <p className="font-sans text-[10px] uppercase tracking-widest text-slate-500 mt-1">Personal Soundscape</p>
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
          <p className="text-[10px] text-slate-500 text-left">Active Member</p>
        </div>
      </div>
    </nav>

    {/* Mobile Bottom Nav — visible only on mobile */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center px-2 py-2 pb-safe">
      <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${currentView === 'home' ? 'text-cyan-400' : 'text-slate-500'}`}>
        <span className="material-symbols-outlined text-xl">home</span>
        <span className="text-[9px] uppercase tracking-widest">Home</span>
      </button>
      <button onClick={() => setCurrentView('library')} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${currentView === 'library' ? 'text-cyan-400' : 'text-slate-500'}`}>
        <span className="material-symbols-outlined text-xl">library_music</span>
        <span className="text-[9px] uppercase tracking-widest">Library</span>
      </button>
      <button onClick={() => setCurrentView('mixer')} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${currentView === 'mixer' ? 'text-cyan-400' : 'text-slate-500'}`}>
        <span className="material-symbols-outlined text-xl">tune</span>
        <span className="text-[9px] uppercase tracking-widest">Mixer</span>
      </button>
    </nav>
  </>
);

// --- Library View ---
const LibraryPage = ({ setCurrentView, savedSoundscapes, onLoadSoundscape }) => (
  <div className="md:ml-64 pt-20 md:pt-32 px-4 md:px-12 pb-28 md:pb-24 relative min-h-screen z-10">
    <section className="mb-10 md:mb-16">
      <h1 className="text-4xl md:text-6xl font-headline font-semibold text-on-surface mb-4 md:mb-6 leading-tight">Explore Your <span className="italic font-normal text-primary">Sanctuary</span></h1>
      <div className="flex flex-wrap gap-3 mt-4 md:mt-8">
        <button className="px-5 py-2 rounded-full text-xs font-label tracking-widest uppercase bg-primary text-on-primary glow-hover transition-all">#Focus</button>
        <button className="px-5 py-2 rounded-full text-xs font-label tracking-widest uppercase bg-surface-container-high text-on-surface-variant hover:bg-surface-bright transition-all">#DeepSleep</button>
        <button className="px-5 py-2 rounded-full text-xs font-label tracking-widest uppercase bg-surface-container-high text-on-surface-variant hover:bg-surface-bright transition-all">#Rain</button>
      </div>
    </section>

    <section className="mb-20">
      <div className="flex justify-between items-end mb-6 md:mb-8">
        <h3 className="text-xl md:text-2xl font-headline text-on-surface">Recent Soundscapes</h3>
        <button className="text-primary text-xs uppercase tracking-widest font-label hover:opacity-70 transition-opacity">View History</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {(savedSoundscapes && savedSoundscapes.length > 0 ? savedSoundscapes : []).map((item, i) => (
          <div key={item.id || i} className="group relative rounded-2xl md:rounded-3xl overflow-hidden aspect-[4/5] bg-surface-container transition-transform duration-500 hover:-translate-y-2 cursor-pointer" onClick={() => onLoadSoundscape(item)}>
            <img className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:scale-110 transition-transform duration-700" src={item.image} alt={item.title}/>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
            {/* Info always visible on mobile, hover on desktop */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-8">
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-secondary mb-1 md:mb-2">{item.tag}</span>
              <h4 className="text-base md:text-2xl font-headline text-on-surface mb-1 md:mb-3">{item.title}</h4>
              <p className="hidden md:block text-sm text-tertiary font-light mb-6 leading-relaxed">{item.desc || "A custom synthesized atmospheric soundscape."}</p>
              <button className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 rounded-full bg-primary text-on-primary glow-hover transition-all">
                <span className="material-symbols-outlined text-base md:text-xl" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

// --- Component: Circular Waveform Visualizer (Web Audio API) ---
const WaveformVisualizer = ({ analyserRef, isPlaying }) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 200 * dpr;
    canvas.height = 200 * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      const W = 200, H = 200, cx = W / 2, cy = H / 2, R = 72;
      ctx.clearRect(0, 0, W, H);

      const analyser = analyserRef.current;
      let dataArray;
      if (analyser) {
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
      } else {
        dataArray = new Uint8Array(128).fill(0);
      }

      // Outer glow ring
      ctx.beginPath();
      ctx.arc(cx, cy, R + 20, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(47, 217, 244, 0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw circular frequency bars
      const bars = 64;
      const step = Math.floor(dataArray.length / bars);
      for (let i = 0; i < bars; i++) {
        const val = dataArray[i * step] / 255;
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
        const barLen = 8 + val * 40;
        const innerR = R - 4;
        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * (innerR + barLen);
        const y2 = cy + Math.sin(angle) * (innerR + barLen);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(47, 217, 244, ${0.3 + val * 0.7})`;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Inner circle
      ctx.beginPath();
      ctx.arc(cx, cy, R - 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(8, 12, 24, 0.6)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(47, 217, 244, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Center icon
      ctx.fillStyle = isPlaying ? 'rgba(47, 217, 244, 0.9)' : 'rgba(255,255,255,0.4)';
      ctx.font = '32px "Material Symbols Outlined"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isPlaying ? '♫' : '♪', cx, cy);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [analyserRef, isPlaying]);

  return <canvas ref={canvasRef} className="w-[200px] h-[200px]" style={{ width: 200, height: 200 }} />;
};

// --- Component: Horizontal Volume Slider ---
const HorizontalVolumeSlider = ({ value, onChange, soundId }) => (
  <div className="relative flex items-center flex-1 min-w-0 group/slider">
    <div className="absolute h-[4px] bg-white/[0.06] rounded-full w-full pointer-events-none"></div>
    <div className="absolute h-[4px] bg-primary rounded-full pointer-events-none transition-all" style={{ width: `${value}%`, boxShadow: value > 0 ? '0 0 8px rgba(47,217,244,0.4)' : 'none' }}></div>
    <input
      type="range" min="0" max="100" value={value}
      onChange={e => onChange(soundId, parseInt(e.target.value))}
      className="vol-slider w-full relative z-10"
    />
  </div>
);

// --- Mixer View (Redesigned Two-Column Layout) ---
const MixerPage = ({ volumes, activeSoundIds, isPlaying, setVolumes, setIsPlaying, setActiveSoundIds, handleVolumeChange, togglePlay, addToMixer, removeFromMixer, onExportClick, onSaveMix, analyserRef }) => {
  const activeMixerSounds = useMemo(() => activeSoundIds.map(id => SOUND_MAP[id]).filter(Boolean), [activeSoundIds]);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Nature');
  const [mutedSounds, setMutedSounds] = useState({});
  const prevVolumes = useRef({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMute = (id) => {
    if (mutedSounds[id]) {
      handleVolumeChange(id, prevVolumes.current[id] || 50);
      setMutedSounds(p => ({ ...p, [id]: false }));
    } else {
      prevVolumes.current[id] = volumes[id];
      handleVolumeChange(id, 0);
      setMutedSounds(p => ({ ...p, [id]: true }));
    }
  };

  const loadPreset = (preset) => {
    Object.entries(preset.sounds).forEach(([id, vol]) => {
      addToMixer(id);
      handleVolumeChange(id, vol);
    });
  };

  const filteredSounds = useMemo(() => {
    const sounds = ALL_SOUNDS_CONFIG[activeCategory] || [];
    if (!searchQuery) return sounds;
    return sounds.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeCategory, searchQuery]);

  const heroImage = activeMixerSounds.length > 0 ? (activeMixerSounds[0].image || '') : '';

  return (
    <div className="md:ml-64 relative min-h-screen z-10 flex flex-col view-enter">

      {/* ===== DESKTOP: Two Column Layout ===== */}
      <div className="hidden md:flex flex-1 h-[calc(100vh-72px)]">

        {/* --- LEFT COLUMN: Track List + Controls --- */}
        <div className="flex-1 flex flex-col min-w-0 px-8 pt-6 pb-24 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 shrink-0">
            <div>
              <h2 className="font-headline text-2xl font-light text-on-surface tracking-tight">
                {activeMixerSounds.length > 0 ? 'Your Mix' : 'Start Mixing'}
              </h2>
              <p className="text-on-surface-variant/60 text-xs font-label tracking-[0.1em] uppercase mt-0.5">
                {activeMixerSounds.length} layer{activeMixerSounds.length !== 1 ? 's' : ''} active
              </p>
            </div>
            <button onClick={() => setBrowserOpen(!browserOpen)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-label tracking-wider uppercase transition-all ${browserOpen ? 'bg-primary/15 text-primary border border-primary/20' : 'bg-white/5 text-on-surface-variant hover:bg-white/10 border border-white/5'}`}>
              <span className="material-symbols-outlined text-base">{browserOpen ? 'close' : 'add_circle'}</span>
              {browserOpen ? 'Close' : 'Add Sounds'}
            </button>
          </div>

          {/* Sound Browser Panel (inline, toggleable) */}
          {browserOpen && (
            <div className="mb-5 shrink-0 glass-panel rounded-2xl p-4 border border-white/5 view-enter">
              {/* Search */}
              <div className="relative mb-3">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">search</span>
                <input
                  type="text" placeholder="Search sounds..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-lg pl-9 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:border-primary/30 transition-colors"
                />
              </div>
              {/* Category Tabs */}
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {Object.keys(ALL_SOUNDS_CONFIG).map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`category-tab ${activeCategory === cat ? 'active' : ''}`}>{cat}</button>
                ))}
              </div>
              {/* Sound Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto track-list-scroll pr-1">
                {filteredSounds.map(sound => (
                  <div
                    key={sound.id}
                    onClick={() => { if (!activeSoundIds.includes(sound.id)) addToMixer(sound.id); }}
                    className={`sound-tile ${activeSoundIds.includes(sound.id) ? 'active' : ''}`}
                  >
                    <span className="material-symbols-outlined text-primary/70 text-lg">{sound.icon}</span>
                    <span className="text-xs text-on-surface truncate">{sound.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Track List */}
          <div className="flex-1 overflow-y-auto track-list-scroll pr-1 min-h-0">
            {activeMixerSounds.length > 0 ? (
              <div className="flex flex-col gap-2">
                {activeMixerSounds.map((sound, idx) => (
                  <div key={sound.id} className={`track-row rounded-xl px-4 py-3.5 flex items-center gap-4 group stagger-${Math.min(idx + 1, 8)}`}>
                    <span className="text-on-surface-variant/25 text-xs font-mono w-5 text-right shrink-0">{idx + 1}</span>
                    <div className="flex items-center justify-center size-10 rounded-xl bg-primary/8 text-primary shrink-0">
                      <span className="material-symbols-outlined text-lg">{sound.icon}</span>
                    </div>
                    <div className="flex flex-col min-w-0 w-32 shrink-0">
                      <p className="text-on-surface text-sm font-medium truncate">{sound.name}</p>
                      <p className="text-on-surface-variant/40 text-[10px] font-label tracking-[0.1em] uppercase">{sound.category}</p>
                    </div>
                    <HorizontalVolumeSlider value={volumes[sound.id] || 0} onChange={handleVolumeChange} soundId={sound.id} />
                    <span className="text-on-surface-variant/60 text-xs font-mono w-9 text-right shrink-0 tabular-nums">{volumes[sound.id] || 0}%</span>
                    <button onClick={() => toggleMute(sound.id)} className="text-on-surface-variant/40 hover:text-primary transition-colors shrink-0">
                      <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>{mutedSounds[sound.id] || volumes[sound.id] === 0 ? 'volume_off' : 'volume_up'}</span>
                    </button>
                    <button onClick={() => removeFromMixer(sound.id)} className="text-on-surface-variant/20 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State with Presets */
              <div className="flex flex-col items-center justify-center py-12">
                <span className="material-symbols-outlined text-on-surface-variant/20 text-6xl mb-4">graphic_eq</span>
                <h3 className="font-headline text-xl text-on-surface/80 mb-2">Build your soundscape</h3>
                <p className="text-on-surface-variant/40 text-sm mb-8 max-w-sm text-center">Add sounds from the browser or try a preset to get started.</p>
                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                  {PRESETS.map(preset => (
                    <button key={preset.name} onClick={() => loadPreset(preset)} className="preset-card text-left">
                      <span className="material-symbols-outlined text-primary text-2xl mb-3">{preset.icon}</span>
                      <p className="text-on-surface text-sm font-medium">{preset.name}</p>
                      <p className="text-on-surface-variant/50 text-[11px] mt-1 leading-relaxed">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: Now Playing Panel --- */}
        <div className="w-[320px] shrink-0 now-playing-panel flex flex-col items-center px-6 pt-8 pb-24 overflow-y-auto">
          {/* Visualizer */}
          <div className="visualizer-ring rounded-full mb-4">
            <WaveformVisualizer analyserRef={analyserRef} isPlaying={isPlaying} />
          </div>

          {/* Now Playing Info */}
          <h3 className="font-headline text-xl font-light text-on-surface tracking-tight text-center mb-1">
            {isPlaying ? 'Now Playing' : 'Paused'}
          </h3>
          <p className="text-primary/60 text-[10px] font-label tracking-[0.15em] uppercase mb-6">
            {activeMixerSounds.length} layer{activeMixerSounds.length !== 1 ? 's' : ''}
          </p>

          {/* Play button */}
          <button onClick={togglePlay} className={`flex items-center justify-center rounded-full size-16 bg-gradient-to-br from-primary to-cyan-400 text-on-primary shadow-lg hover:scale-105 active:scale-95 transition-all mb-6 ${isPlaying ? 'play-btn-active' : ''}`}>
            <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>{isPlaying ? 'pause' : 'play_arrow'}</span>
          </button>

          {/* Active Layers Chips */}
          {activeMixerSounds.length > 0 && (
            <div className="w-full mb-6">
              <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-2">Active Layers</p>
              <div className="flex flex-wrap gap-1.5">
                {activeMixerSounds.map(s => (
                  <span key={s.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/8 text-primary text-[11px] rounded-full border border-primary/15">
                    <span className="material-symbols-outlined text-xs">{s.icon}</span>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="w-full flex flex-col gap-2 mt-auto">
            <button onClick={onSaveMix} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 text-primary text-xs font-label tracking-wider uppercase hover:bg-primary/15 transition-colors border border-primary/10">
              <span className="material-symbols-outlined text-base">bookmark_add</span>
              Save Soundscape
            </button>
            <button onClick={onExportClick} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-on-surface-variant text-xs font-label tracking-wider uppercase hover:bg-white/8 transition-colors border border-white/5">
              <span className="material-symbols-outlined text-base">download</span>
              Export Audio
            </button>
            <button onClick={() => { setActiveSoundIds([]); setVolumes(v => Object.keys(v).reduce((acc, k) => ({...acc, [k]: 0}), {})); }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-on-surface-variant/40 text-xs font-label tracking-wider uppercase hover:text-red-400 hover:bg-red-400/5 transition-colors">
              <span className="material-symbols-outlined text-base">delete_sweep</span>
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden flex flex-col min-h-screen pt-4 pb-40">
        {/* Mobile Header */}
        <div className="px-4 mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-headline text-xl font-light text-on-surface">Your Mix</h2>
            <p className="text-on-surface-variant/60 text-[10px] font-label tracking-[0.1em] uppercase">{activeMixerSounds.length} layer{activeMixerSounds.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onSaveMix} className="size-9 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-lg">bookmark_add</span>
            </button>
            <button onClick={onExportClick} className="size-9 flex items-center justify-center rounded-lg bg-white/5 text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">download</span>
            </button>
          </div>
        </div>

        {/* Mobile Visualizer (compact) */}
        <div className="flex justify-center py-3 mb-2">
          <div className="scale-75 origin-center">
            <div className="visualizer-ring rounded-full">
              <WaveformVisualizer analyserRef={analyserRef} isPlaying={isPlaying} />
            </div>
          </div>
        </div>

        {/* Mobile Track List */}
        <div className="flex-1 px-4 overflow-y-auto track-list-scroll">
          {activeMixerSounds.length > 0 ? (
            <div className="flex flex-col gap-2">
              {activeMixerSounds.map((sound, idx) => (
                <div key={sound.id} className={`track-row rounded-xl px-3 py-3 flex items-center gap-3 stagger-${Math.min(idx + 1, 8)}`}>
                  <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 text-primary shrink-0">
                    <span className="material-symbols-outlined text-base">{sound.icon}</span>
                  </div>
                  <div className="flex flex-col min-w-0 w-20 shrink-0">
                    <p className="text-on-surface text-sm font-medium truncate">{sound.name}</p>
                    <p className="text-on-surface-variant/40 text-[9px] font-label tracking-[0.1em] uppercase">{sound.category}</p>
                  </div>
                  <HorizontalVolumeSlider value={volumes[sound.id] || 0} onChange={handleVolumeChange} soundId={sound.id} />
                  <span className="text-on-surface-variant/60 text-[11px] font-mono w-8 text-right shrink-0 tabular-nums">{volumes[sound.id] || 0}%</span>
                  <button onClick={() => toggleMute(sound.id)} className="text-on-surface-variant/40 hover:text-primary transition-colors shrink-0">
                    <span className="material-symbols-outlined text-base" style={{fontVariationSettings: "'FILL' 1"}}>{mutedSounds[sound.id] || volumes[sound.id] === 0 ? 'volume_off' : 'volume_up'}</span>
                  </button>
                  <button onClick={() => removeFromMixer(sound.id)} className="text-on-surface-variant/30 shrink-0">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <span className="material-symbols-outlined text-on-surface-variant/20 text-5xl mb-3">graphic_eq</span>
              <h3 className="font-headline text-lg text-on-surface/80 mb-2">Build your soundscape</h3>
              <p className="text-on-surface-variant/40 text-sm mb-6 text-center px-4">Try a preset or add sounds to begin.</p>
              <div className="grid grid-cols-2 gap-2.5 w-full">
                {PRESETS.map(preset => (
                  <button key={preset.name} onClick={() => loadPreset(preset)} className="preset-card text-left">
                    <span className="material-symbols-outlined text-primary text-xl mb-2">{preset.icon}</span>
                    <p className="text-on-surface text-xs font-medium">{preset.name}</p>
                    <p className="text-on-surface-variant/50 text-[10px] mt-0.5">{preset.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Transport Bar — above bottom nav */}
        <div className="fixed bottom-14 left-0 right-0 z-40 transport-bar px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button onClick={() => { setActiveSoundIds([]); setVolumes(v => Object.keys(v).reduce((acc, k) => ({...acc, [k]: 0}), {})); }} className="text-on-surface-variant/30 hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-xl">delete_sweep</span>
            </button>
            <button onClick={togglePlay} className={`flex items-center justify-center rounded-full size-12 bg-gradient-to-br from-primary to-cyan-400 text-on-primary shadow-lg hover:scale-105 active:scale-95 transition-all ${isPlaying ? 'play-btn-active' : ''}`}>
              <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>{isPlaying ? 'pause' : 'play_arrow'}</span>
            </button>
            <button onClick={() => setBrowserOpen(true)} className="text-on-surface-variant/50 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">add_circle</span>
            </button>
          </div>
        </div>

        {/* Mobile Sound Browser — Bottom Sheet */}
        {browserOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50 mobile-overlay" onClick={() => setBrowserOpen(false)} />
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-high rounded-t-3xl max-h-[75vh] flex flex-col mobile-panel">
              <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
                <h3 className="font-headline text-lg text-on-surface">Add Sounds</h3>
                <button onClick={() => setBrowserOpen(false)} className="text-on-surface-variant/40 hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              {/* Search */}
              <div className="px-5 mb-3 shrink-0">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">search</span>
                  <input
                    type="text" placeholder="Search sounds..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-lg pl-9 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:border-primary/30 transition-colors"
                  />
                </div>
              </div>
              {/* Tabs */}
              <div className="flex gap-2 px-5 mb-3 overflow-x-auto shrink-0 pb-1">
                {Object.keys(ALL_SOUNDS_CONFIG).map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`category-tab ${activeCategory === cat ? 'active' : ''}`}>{cat}</button>
                ))}
              </div>
              {/* Sounds */}
              <div className="flex-1 overflow-y-auto px-5 pb-8 track-list-scroll">
                <div className="grid grid-cols-2 gap-1.5">
                  {filteredSounds.map(sound => (
                    <div
                      key={sound.id}
                      onClick={() => { if (!activeSoundIds.includes(sound.id)) { addToMixer(sound.id); } }}
                      className={`sound-tile ${activeSoundIds.includes(sound.id) ? 'active' : ''}`}
                    >
                      <span className="material-symbols-outlined text-primary/70 text-lg">{sound.icon}</span>
                      <span className="text-xs text-on-surface truncate">{sound.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== DESKTOP Transport Bar ===== */}
      <div className="hidden md:block fixed bottom-0 left-64 right-0 z-40 transport-bar px-8 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-on-surface-variant/40 text-xs">
            <span className="material-symbols-outlined text-sm">layers</span>
            {activeMixerSounds.length} layer{activeMixerSounds.length !== 1 ? 's' : ''} · {isPlaying ? 'Playing' : 'Paused'}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => { setActiveSoundIds([]); setVolumes(v => Object.keys(v).reduce((acc, k) => ({...acc, [k]: 0}), {})); }} className="text-on-surface-variant/30 hover:text-on-surface transition-colors" title="Clear all">
              <span className="material-symbols-outlined text-xl">delete_sweep</span>
            </button>
            <button onClick={togglePlay} className={`flex items-center justify-center rounded-full size-12 bg-gradient-to-br from-primary to-cyan-400 text-on-primary shadow-lg hover:scale-105 active:scale-95 transition-all ${isPlaying ? 'play-btn-active' : ''}`}>
              <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>{isPlaying ? 'pause' : 'play_arrow'}</span>
            </button>
            <button onClick={() => setBrowserOpen(o => !o)} className="text-on-surface-variant/40 hover:text-primary transition-colors" title="Add sound">
              <span className="material-symbols-outlined text-xl">playlist_add</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onSaveMix} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-primary/70 hover:text-primary hover:bg-primary/10 transition-all text-xs font-label tracking-wider uppercase">
              <span className="material-symbols-outlined text-sm">bookmark_add</span>
              Save
            </button>
            <button onClick={onExportClick} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-on-surface-variant/50 hover:text-on-surface hover:bg-white/5 transition-all text-xs font-label tracking-wider uppercase">
              <span className="material-symbols-outlined text-sm">download</span>
              Export
            </button>
          </div>
        </div>
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
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const gainNodesRef = useRef({});
  const sourceNodesRef = useRef({});

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

  // Audio Engine Hook — Web Audio API for visualizer
  useEffect(() => {
    // Create AudioContext and AnalyserNode (lazily, once)
    const initAudioContext = () => {
      if (audioContextRef.current) return;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyser.connect(ctx.destination);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
    };

    ALL_SOUNDS_FLAT.forEach(sound => {
      const audio = new Audio(`/sounds/${sound.file}`);
      audio.loop = true;
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      audioRefs.current[sound.id] = audio;
    });

    // Set initial volumes
    ['rain', 'ocean', 'forest'].forEach(id => {
       handleVolumeChange(id, 50);
    });

    // Init audio context on first user interaction
    const handleInteraction = () => {
      initAudioContext();
      document.removeEventListener('click', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      Object.values(audioRefs.current).forEach(audio => { audio.pause(); audio.src = ''; });
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Volume sync — route through Web Audio API gain nodes
  useEffect(() => {
    const ctx = audioContextRef.current;
    const analyser = analyserRef.current;

    Object.keys(volumes).forEach(id => {
      const audio = audioRefs.current[id];
      const volumeLevel = volumes[id] / 100;
      if (!audio) return;

      // Connect to Web Audio API graph if context is ready and not yet connected
      if (ctx && analyser && !sourceNodesRef.current[id]) {
        try {
          const source = ctx.createMediaElementSource(audio);
          const gain = ctx.createGain();
          source.connect(gain);
          gain.connect(analyser);
          sourceNodesRef.current[id] = source;
          gainNodesRef.current[id] = gain;
        } catch(e) {
          // Already connected — ignore
        }
      }

      // Set volume via GainNode if available, otherwise fallback
      const gainNode = gainNodesRef.current[id];
      if (gainNode) {
        gainNode.gain.value = volumeLevel;
      } else {
        audio.volume = volumeLevel;
      }

      // Play/pause logic
      if (isPlaying && volumeLevel > 0) {
        if (audio.paused) {
          if (ctx && ctx.state === 'suspended') ctx.resume();
          audio.play().catch(e => console.warn(`Autoplay prevented for ${id}`, e));
        }
      } else {
        if (!audio.paused) audio.pause();
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
        const blob = new Blob([wavData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `AudioAmbient_Mix_${downloadDuration}min.wav`;
        document.body.appendChild(a);
        a.click();
        
        // Delay revocation to ensure browser captures the filename/extension
        setTimeout(() => {
          URL.revokeObjectURL(url);
          if (document.body.contains(a)) document.body.removeChild(a);
        }, 100);
        
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
    onSaveMix: handleSaveMix,
    analyserRef
  };

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-container-low via-background to-background"></div>
      <div className="fixed inset-0 -z-10 opacity-20" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDGp91R1OHXPdnx_cLfEJKSurYAdtbNg3WNNjdsvIxPxZ2g_lfx33ZR6VcGf8l83wN9QxgfS0CJfGB0RuZHNG--88YJi5TVYUB8z7YU-YiTDaS7PiBbRC5lpdcmHhK22cysh_QkPng80tC2v4zNh0XLEXLdChst869VtA6SaL9H48JV_7ydBvXetUsBZbEEYfd-Uzm3j_97eECOoYaUMgBM5PgJsEZGaonXkY5m9RJ0q88Fu7t_80nS8bpziB-S0SAIKUdf1_LQhAM')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(120px)' }}></div>

      {currentView !== 'home' && <SideNavBar currentView={currentView} setCurrentView={setCurrentView} />}
      
      {currentView === 'home' && <HomePage navigateToMixer={() => setCurrentView('mixer')} navigateToLibrary={() => setCurrentView('library')} onLoadPreset={(preset) => { const newVols = { ...ALL_SOUNDS_FLAT.reduce((acc, s) => ({ ...acc, [s.id]: 0 }), {}) }; const ids = []; Object.entries(preset.sounds).forEach(([id, vol]) => { newVols[id] = vol; ids.push(id); }); setVolumes(newVols); setActiveSoundIds(ids); setCurrentView('mixer'); setIsPlaying(true); }} />}
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
