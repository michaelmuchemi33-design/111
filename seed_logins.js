/**
 * seed_logins.js
 * Run this script to create test users in your Supabase Auth.
 * 
 * Usage:
 * 1. Open your project's landing_page.html in a browser.
 * 2. Open the browser console (F12).
 * 3. Copy and paste the code below into the console and press Enter.
 * 4. Alternatively, you can include this script in your HTML temporarily.
 */

async function seedTestUsers() {
    if (!window.sbClient) {
        console.error("Supabase client (window.sbClient) not found. Make sure supabase-client.js is loaded.");
        return;
    }

    const testUsers = [
        { email: 'client@test.com', password: 'Password123!', first_name: 'Test', last_name: 'Client' },
        { email: 'admin@test.com', password: 'Password123!', first_name: 'Test', last_name: 'Admin' },
        { email: 'commissioner@test.com', password: 'Password123!', first_name: 'Test', last_name: 'Commissioner' },
        { email: 'developer@test.com', password: 'Password123!', first_name: 'Test', last_name: 'Developer' }
    ];

    for (const user of testUsers) {
        console.log(`Attempting to sign up: ${user.email}...`);
        const { data, error } = await window.sbClient.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
                data: { first_name: user.first_name, last_name: user.last_name }
            }
        });

        if (error) {
            console.warn(`Sign up for ${user.email} failed or user already exists:`, error.message);
        } else {
            console.log(`Sign up successful for: ${user.email}`);
        }
    }

    console.log("Seeding complete. Remember to manually update roles in the Supabase 'profiles' table if needed.");
    console.log("SQL to update roles:");
    console.log(`
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@test.com';
UPDATE public.profiles SET role = 'commissioner' WHERE email = 'commissioner@test.com';
UPDATE public.profiles SET role = 'developer' WHERE email = 'developer@test.com';
UPDATE public.profiles SET role = 'client' WHERE email = 'client@test.com';
    `);
}

// Run the seeding
seedTestUsers();
