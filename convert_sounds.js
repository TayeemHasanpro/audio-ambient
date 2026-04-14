const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

const log = (msg) => console.log(msg);

const soundsDir = path.join(process.cwd(), 'public/sounds');
const pagePath = path.join(process.cwd(), 'app/page.js');

try {
  let content = fs.readFileSync(pagePath, 'utf8');
  content = content.replace(/\.wav'/g, ".mp3'"); // Only replace .wav when it's at the end of the string config
  fs.writeFileSync(pagePath, content);
  log("Updated app/page.js replacing .wav with .mp3");
} catch(e) {
  console.error("Error updating page.js", e);
}

fs.readdir(soundsDir, (err, files) => {
  if (err) throw err;
  
  const wavFiles = files.filter(f => f.endsWith('.wav') && !f.startsWith('.'));
  let completed = 0;
  
  if (wavFiles.length === 0) {
      log('No .wav files found.');
      return;
  }

  log(`Found ${wavFiles.length} files. Beginning multi-threaded compression to mp3 (128kbps)...`);
  
  wavFiles.forEach(file => {
    const wavPath = path.join(soundsDir, file);
    const mp3Path = path.join(soundsDir, file.replace('.wav', '.mp3'));
    
    ffmpeg(wavPath)
      .toFormat('mp3')
      .audioBitrate('128k')
      .on('end', () => {
        fs.unlinkSync(wavPath);
        completed++;
        log(`[${completed}/${wavFiles.length}] Successfully compressed ${file}`);
      })
      .on('error', (err) => {
        console.error(`Error converting ${file}:`, err);
        completed++;
      })
      .save(mp3Path);
  });
});
