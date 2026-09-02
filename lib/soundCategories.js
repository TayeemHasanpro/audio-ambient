/**
 * AudioAmbient Sound Categorization & Anti-Repetition Engine
 * Differentiates continuous beds (pads, rain, hums) from stochastic foreground transients (chimes, thunder, footsteps)
 * to guard against YouTube "Reused / Static Content" algorithm penalties.
 */

export const SOUND_BEHAVIOR = {
  // Continuous acoustic beds (seamless looping with equal-power boundary crossfade)
  CONTINUOUS: 'continuous',
  // Stochastic foreground events (asynchronous, randomized intervals, subtle pitch/gain jitter)
  STOCHASTIC: 'stochastic',
};

export const SOUND_METADATA = {
  // Nature
  rain_on_leaves: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'Bed' },
  rain_on_tent: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: -0.15, layer: 'Bed' },
  rain_on_umbrella: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.15, layer: 'Bed' },
  rain_on_window: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: -0.2, layer: 'Mid' },
  soft_rain: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'Bed' },
  strong_rain_thunders: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: 0.25, layer: 'Accent', minInterval: 25, maxInterval: 75 },
  river_peaceful: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: -0.3, layer: 'Bed' },
  waterfall: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.3, layer: 'Bed' },
  spring_birds: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: 0.4, layer: 'Accent', minInterval: 15, maxInterval: 45 },
  crows: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: -0.45, layer: 'Accent', minInterval: 30, maxInterval: 90 },
  ducks_on_field: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: 0.35, layer: 'Accent', minInterval: 20, maxInterval: 60 },
  frogs_ambience: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: -0.25, layer: 'Mid' },
  howling_polar_wind: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'Bed' },
  winter_whistling_wind: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.1, layer: 'Bed' },
  rustling_leaves: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: -0.2, layer: 'Mid' },
  seagull_in_town: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: 0.5, layer: 'Accent', minInterval: 25, maxInterval: 70 },
  wooden_windbells_wind: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: -0.35, layer: 'Accent', minInterval: 18, maxInterval: 50 },
  walking_on_rocks: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: 0.1, layer: 'Foley', minInterval: 30, maxInterval: 80 },
  walking_on_snow: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: -0.1, layer: 'Foley', minInterval: 30, maxInterval: 80 },
  walking_tall_grass: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: 0.2, layer: 'Foley', minInterval: 30, maxInterval: 80 },
  walking_gravel_mono: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: -0.2, layer: 'Foley', minInterval: 30, maxInterval: 80 },
  crossroads_after_raining: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'Mid' },

  // Ambient
  low_hum: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'SubBed' },
  magnetic_hum: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'SubBed' },
  mysterious_muted_dimension: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: -0.25, layer: 'Pad' },
  pink_noise: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'Mask' },
  static_white_noise: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'Mask' },
  space_drift: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.1, layer: 'Pad' },
  tibetan_singing_bowl: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: 0.0, layer: 'Harmonic', minInterval: 20, maxInterval: 55 },
  ethereal_loop: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: -0.2, layer: 'Pad' },
  electric_loop_synth_hum: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.2, layer: 'Pad' },
  energy_hum: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'SubBed' },
  delta_range: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'Binaural' },
  enote: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.15, layer: 'Harmonic' },
  vinyl_warm_noise: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'Texture' },
  washy_noises_background: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: -0.1, layer: 'Texture' },
  radio_static: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.2, layer: 'Texture' },

  // Mechanical
  courtyard_ac: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: -0.3, layer: 'Mid' },
  steam_engine: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.1, layer: 'Rhythm' },
  subway_journey: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'Bed' },
  washing_machine: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.35, layer: 'Mid' },
  windscreen_wiper: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: -0.15, layer: 'Rhythm' },
  helicopter_in_flight: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.4, layer: 'Overhead' },
  typewriter: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: 0.25, layer: 'Focus', minInterval: 12, maxInterval: 40 },
  laptop_typing_slow: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: -0.2, layer: 'Focus', minInterval: 10, maxInterval: 35 },
  grandfather_clock: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.3, layer: 'Rhythm' },
  slow_traffic_street: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: -0.2, layer: 'Distance' },
  traffic_in_distance: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.2, layer: 'Distance' },

  // Crowd
  public_gym: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'Atmosphere' },
  supermarket: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'Atmosphere' },
  quiet_library: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'RoomTone' },
  rowing_boat: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: -0.1, layer: 'Rhythm' },
  sizzling_oil: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.25, layer: 'Texture' },
  small_chimes: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: -0.4, layer: 'Accent', minInterval: 15, maxInterval: 50 },
  underwater_bubbles: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.0, layer: 'Bed' },
  distant_fireworks: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: 0.45, layer: 'Accent', minInterval: 30, maxInterval: 90 },
  footsteps_clothes: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: -0.25, layer: 'Foley', minInterval: 25, maxInterval: 75 },
  hair_cut: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: 0.2, layer: 'BinauralFoley', minInterval: 20, maxInterval: 60 },
  happy_dog_indoor: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: -0.3, layer: 'Accent', minInterval: 35, maxInterval: 100 },
  rural_tin_roof_drips: { behavior: SOUND_BEHAVIOR.CONTINUOUS, defaultPan: 0.15, layer: 'Texture' },
  pencil_writing: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: -0.15, layer: 'Focus', minInterval: 15, maxInterval: 45 },
  sweeping_pavement: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: 0.3, layer: 'Foley', minInterval: 25, maxInterval: 70 },
  glass_rolling_stone: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: -0.3, layer: 'Foley', minInterval: 30, maxInterval: 85 },
  newspaper_pages: { behavior: SOUND_BEHAVIOR.STOCHASTIC, defaultPan: 0.2, layer: 'Accent', minInterval: 20, maxInterval: 65 }
};

/**
 * Generates an asynchronous, non-repeating trigger schedule for stochastic sounds
 * over a given duration. Returns timestamps (in seconds) and slight gain/pitch offsets.
 */
export function generateStochasticEvents(soundId, totalDurationSeconds) {
  const meta = SOUND_METADATA[soundId] || { minInterval: 20, maxInterval: 60 };
  const events = [];
  let currentTime = Math.random() * (meta.minInterval || 15);

  while (currentTime < totalDurationSeconds) {
    // Randomized interval
    const interval = (meta.minInterval || 20) + Math.random() * ((meta.maxInterval || 60) - (meta.minInterval || 20));
    // Subtle gain modulation (±15%)
    const gainMod = 0.85 + Math.random() * 0.3;
    // Subtle spatial jitter (±0.1 pan offset)
    const panJitter = (Math.random() - 0.5) * 0.2;

    events.push({
      time: Math.round(currentTime * 100) / 100,
      gainMultiplier: Math.round(gainMod * 100) / 100,
      panOffset: Math.round(panJitter * 100) / 100,
    });

    currentTime += interval;
  }

  return events;
}
