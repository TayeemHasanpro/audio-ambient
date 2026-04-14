import array
import math
import wave
import random
import os

def generate_sound(filename, kind):
    print(f"Generating {filename}...")
    sample_rate = 44100
    duration = 5 # seconds
    num_samples = sample_rate * duration
    max_amplitude = 32767
    
    samples = []
    if kind == 'white':
        # White noise
        for _ in range(num_samples):
            samples.append(int(random.uniform(-1, 1) * max_amplitude))
    elif kind == 'brown':
        # Brown noise approximation
        val = 0.0
        for _ in range(num_samples):
            val = (val + random.uniform(-1, 1)) / 1.05
            samples.append(int(max(-1, min(1, val)) * max_amplitude))
    else:
        # Generic tone + noise to make them faintly different
        freq = {'rain': 400, 'ocean': 250, 'forest': 800, 'wind': 300, 'fireplace': 150}.get(kind, random.uniform(200, 800))
        val = 0.0
        for i in range(num_samples):
            t = float(i) / sample_rate
            # Mix tone and a bit of noise
            val = math.sin(2 * math.pi * freq * t) * 0.3 + random.uniform(-0.5, 0.5)
            # Add a slow modulation (like waves)
            envelope = (math.sin(2 * math.pi * 0.5 * t) + 1.0) / 2.0
            val *= envelope
            samples.append(int(max(-1, min(1, val)) * max_amplitude))
            
    with wave.open(filename, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sample_rate)
        w.writeframes(array.array('h', samples).tobytes())

os.makedirs('public/sounds', exist_ok=True)
files = ['rain', 'ocean', 'forest', 'wind', 'fireplace', 'brown', 'white', 'binaural', 'cafe', 'city', 'train', 'night']
for f in files:
    generate_sound(f'public/sounds/{f}.wav', f)
print("Done generating valid offline-renderable WAV samples.")
