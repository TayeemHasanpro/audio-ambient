require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function setup() {
    const client = new Client({
        connectionString: process.env.POSTGRES_URL_NON_POOLING.split('?')[0],
        ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    console.log("Connected to PostgreSQL");
    
    const query = `
    CREATE TABLE IF NOT EXISTS soundscapes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        tag VARCHAR(100) DEFAULT 'Custom',
        image TEXT NOT NULL,
        volumes JSONB NOT NULL,
        active_sounds JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `;
    
    await client.query(query);
    console.log("Table 'soundscapes' verified/created successfully.");
    
    // Seed initial default soundscapes if empty
    const { rows } = await client.query('SELECT COUNT(*) FROM soundscapes');
    if (parseInt(rows[0].count) === 0) {
        console.log("Seeding default soundscapes...");
        const seeds = [
            {
                title: "Midnight Peak", tag: "Atmospheric", 
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdNCBwWRIG2ezLPSK2DJRVFh6Cyd5JB5JCdrFjbzL6Td4MfnRTAf_OF4SFzshtuId0WlvgQOK_WM7Gn1K1otYg24rSnNbRxnxxlHQCDPQpw1Mvg34NwYKSpyI0adrJdxIhzU3aqMlQN7_ErNmRcYYoXKMOuBT0K3a_FFT3_QXJJd1KxxGoLvEz-Jk7hEYKrfb_t0tTJt1vtOdggcuoCG9ksL0N9NVSZu1MVoLWmlFIZecCI-uvLQlGyWvUIsuo_1viI8G_0XeHLKw",
                volumes: JSON.stringify({ 'wind': 65, 'forest': 20 }),
                active_sounds: JSON.stringify(['wind', 'forest'])
            },
            {
                title: "Urban Raincoat", tag: "Nature", 
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDUCge0duWunMDITiI-sehdtVnopikgpzbM_iqYSPqc4W-9VRdw8KfeE0PUQo74uf2IhQV1oGKtQA7iLNRBDmpq8CXlbxNAAJWgAKAaelm5ubAKDAfx_udEZkejuqPeOk6ps8Da487Q-iYyZQ8s7dHZtZs4VQaIN2a-REbqah608oPd87u_uogFgv5AQ4pK1KotfWeC6j6kz2GB7UMN768SSgjfEvxFsch9J0n2ZpJLh4SmxV7tNTx34zf6gZkOekZDZ1j1zfikqYo",
                volumes: JSON.stringify({ 'rain': 80, 'city': 40 }),
                active_sounds: JSON.stringify(['rain', 'city'])
            },
            {
                title: "Ether Waves", tag: "Synthesized", 
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuATTuK3naI6tduIlrkiJb5sUEIhUWwrYe87b-7ogRXf7gyehv-OHiM16UI0xVQ4Iiq5yzBNfyBEYs6OPFNEdWIBSU5P1_pfGHjj8Teci4AqwJF6X6jKih2VovG-fwzJNvUiJa3zx3NXPEHymX7t8jXCudO1AAqDEnjkI55T8o9EFvJcD2L1Ih65g3bOiv1AdCKCj0saXPJhm5p4FyYDJgiQH3OwOJEen1vfQTMTE0l38B26_wtTDPTx2SVXqCo8bysoKjmPlt1NZbI",
                volumes: JSON.stringify({ 'binaural': 50, 'brown': 30 }),
                active_sounds: JSON.stringify(['binaural', 'brown'])
            }
        ];
        for (const s of seeds) {
            await client.query('INSERT INTO soundscapes (title, tag, image, volumes, active_sounds) VALUES ($1, $2, $3, $4, $5)', [s.title, s.tag, s.image, s.volumes, s.active_sounds]);
        }
        console.log("Seeding complete.");
    }
    
    await client.end();
}
setup().catch(console.error);
