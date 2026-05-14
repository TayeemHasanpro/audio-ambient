const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();

async function setup() {
  console.log('Connected to Firestore');

  // Check if soundscapes collection has any documents
  const snapshot = await db.collection('soundscapes').limit(1).get();

  if (snapshot.empty) {
    console.log('Seeding default soundscapes...');

    const seeds = [
      {
        title: 'Midnight Peak',
        tag: 'Atmospheric',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdNCBwWRIG2ezLPSK2DJRVFh6Cyd5JB5JCdrFjbzL6Td4MfnRTAf_OF4SFzshtuId0WlvgQOK_WM7Gn1K1otYg24rSnNbRxnxxlHQCDPQpw1Mvg34NwYKSpyI0adrJdxIhzU3aqMlQN7_ErNmRcYYoXKMOuBT0K3a_FFT3_QXJJd1KxxGoLvEz-Jk7hEYKrfb_t0tTJt1vtOdggcuoCG9ksL0N9NVSZu1MVoLWmlFIZecCI-uvLQlGyWvUIsuo_1viI8G_0XeHLKw',
        volumes: { wind: 65, forest: 20 },
        active_sounds: ['wind', 'forest'],
        created_at: new Date().toISOString(),
      },
      {
        title: 'Urban Raincoat',
        tag: 'Nature',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUCge0duWunMDITiI-sehdtVnopikgpzbM_iqYSPqc4W-9VRdw8KfeE0PUQo74uf2IhQV1oGKtQA7iLNRBDmpq8CXlbxNAAJWgAKAaelm5ubAKDAfx_udEZkejuqPeOk6ps8Da487Q-iYyZQ8s7dHZtZs4VQaIN2a-REbqah608oPd87u_uogFgv5AQ4pK1KotfWeC6j6kz2GB7UMN768SSgjfEvxFsch9J0n2ZpJLh4SmxV7tNTx34zf6gZkOekZDZ1j1zfikqYo',
        volumes: { rain: 80, city: 40 },
        active_sounds: ['rain', 'city'],
        created_at: new Date().toISOString(),
      },
      {
        title: 'Ether Waves',
        tag: 'Synthesized',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATTuK3naI6tduIlrkiJb5sUEIhUWwrYe87b-7ogRXf7gyehv-OHiM16UI0xVQ4Iiq5yzBNfyBEYs6OPFNEdWIBSU5P1_pfGHjj8Teci4AqwJF6X6jKih2VovG-fwzJNvUiJa3zx3NXPEHymX7t8jXCudO1AAqDEnjkI55T8o9EFvJcD2L1Ih65g3bOiv1AdCKCj0saXPJhm5p4FyYDJgiQH3OwOJEen1vfQTMTE0l38B26_wtTDPTx2SVXqCo8bysoKjmPlt1NZbI',
        volumes: { binaural: 50, brown: 30 },
        active_sounds: ['binaural', 'brown'],
        created_at: new Date().toISOString(),
      },
    ];

    const batch = db.batch();
    for (const s of seeds) {
      const docRef = db.collection('soundscapes').doc();
      batch.set(docRef, s);
    }
    await batch.commit();
    console.log('Seeding complete — 3 soundscapes added.');
  } else {
    console.log('Soundscapes collection already has data. Skipping seed.');
  }

  console.log('Done.');
}

setup().catch(console.error);
