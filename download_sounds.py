import urllib.request
import os
import shutil
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

sounds = {
    'rain.ogg': 'https://upload.wikimedia.org/wikipedia/commons/1/18/Rain_1.ogg',
    'ocean.ogg': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Ocean-waves.ogg',
    'forest.ogg': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Bird_song_in_a_forest.ogg',
    'wind.ogg': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Wind.ogg',
    'fireplace.ogg': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Fire_Audio.ogg',
    'brown.ogg': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Brown_noise.ogg',
    'white.ogg': 'https://upload.wikimedia.org/wikipedia/commons/e/ea/White_noise_10s.ogg',
    'binaural.ogg': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Binaural_Beat_%287Hz_Alpha%29.ogg',
    'cafe.ogg': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Coffee_Shop_Ambience.ogg',
    'city.ogg': 'https://upload.wikimedia.org/wikipedia/commons/e/e1/City_Traffic_Sounds.ogg',
    'train.ogg': 'https://upload.wikimedia.org/wikipedia/commons/d/da/Steam_train.ogg',
    'night.ogg': 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Crickets_at_night.ogg'
}

download_dir = 'public/sounds'
os.makedirs(download_dir, exist_ok=True)

# Remove the old dummy mp3s
for file in os.listdir(download_dir):
    if file.endswith('.mp3'):
        os.remove(os.path.join(download_dir, file))

# Download new ogg files
for filename, url in sounds.items():
    filepath = os.path.join(download_dir, filename)
    print(f"Downloading {filename}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Success: {filename}")
    except Exception as e:
        print(f"Failed to download {filename}: {e}")
        # fallback to white noise if file missing
        if filename != 'white.ogg' and os.path.exists(os.path.join(download_dir, 'white.ogg')):
             shutil.copy(os.path.join(download_dir, 'white.ogg'), filepath)

print("All sounds populated.")
