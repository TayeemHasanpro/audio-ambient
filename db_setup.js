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

  // 1. Delete all existing soundscapes
  const snapshot = await db.collection('soundscapes').get();
  console.log(`Deleting ${snapshot.size} existing soundscapes...`);
  const deleteBatch = db.batch();
  snapshot.docs.forEach(doc => {
    deleteBatch.delete(doc.ref);
  });
  await deleteBatch.commit();
  console.log('Deleted existing soundscapes.');

  // 2. Seed default soundscapes with new sound IDs
  console.log('Seeding default soundscapes with new sound IDs...');
  const seeds = [
    {
      title: 'Midnight Peak',
      tag: 'Atmospheric',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdNCBwWRIG2ezLPSK2DJRVFh6Cyd5JB5JCdrFjbzL6Td4MfnRTAf_OF4SFzshtuId0WlvgQOK_WM7Gn1K1otYg24rSnNbRxnxxlHQCDPQpw1Mvg34NwYKSpyI0adrJdxIhzU3aqMlQN7_ErNmRcYYoXKMOuBT0K3a_FFT3_QXJJd1KxxGoLvEz-Jk7hEYKrfb_t0tTJt1vtOdggcuoCG9ksL0N9NVSZu1MVoLWmlFIZecCI-uvLQlGyWvUIsuo_1viI8G_0XeHLKw',
      volumes: { howling_polar_wind: 65, spring_birds: 20 },
      active_sounds: ['howling_polar_wind', 'spring_birds'],
      created_at: new Date().toISOString(),
    },
    {
      title: 'Urban Raincoat',
      tag: 'Nature',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUCge0duWunMDITiI-sehdtVnopikgpzbM_iqYSPqc4W-9VRdw8KfeE0PUQo74uf2IhQV1oGKtQA7iLNRBDmpq8CXlbxNAAJWgAKAaelm5ubAKDAfx_udEZkejuqPeOk6ps8Da487Q-iYyZQ8s7dHZtZs4VQaIN2a-REbqah608oPd87u_uogFgv5AQ4pK1KotfWeC6j6kz2GB7UMN768SSgjfEvxFsch9J0n2ZpJLh4SmxV7tNTx34zf6gZkOekZDZ1j1zfikqYo',
      volumes: { soft_rain: 80, slow_traffic_street: 40 },
      active_sounds: ['soft_rain', 'slow_traffic_street'],
      created_at: new Date().toISOString(),
    },
    {
      title: 'Ether Waves',
      tag: 'Synthesized',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATTuK3naI6tduIlrkiJb5sUEIhUWwrYe87b-7ogRXf7gyehv-OHiM16UI0xVQ4Iiq5yzBNfyBEYs6OPFNEdWIBSU5P1_pfGHjj8Teci4AqwJF6X6jKih2VovG-fwzJNvUiJa3zx3NXPEHymX7t8jXCudO1AAqDEnjkI55T8o9EFvJcD2L1Ih65g3bOiv1AdCKCj0saXPJhm5p4FyYDJgiQH3OwOJEen1vfQTMTE0l38B26_wtTDPTx2SVXqCo8bysoKjmPlt1NZbI',
      volumes: { low_hum: 50, static_white_noise: 30 },
      active_sounds: ['low_hum', 'static_white_noise'],
      created_at: new Date().toISOString(),
    },
  ];

  const seedBatch = db.batch();
  for (const s of seeds) {
    const docRef = db.collection('soundscapes').doc();
    seedBatch.set(docRef, s);
  }
  await seedBatch.commit();
  console.log('Seeding complete — 3 soundscapes added.');
  console.log('Done.');
}

setup().catch(console.error);
