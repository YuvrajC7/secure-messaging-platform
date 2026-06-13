const { createClient } = require('@supabase/supabase-js');

// 1. Initialize the Supabase Client
// We load the URL and KEY from the environment variables (stored in the .env file)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service_role key for backend to bypass RLS

// Ensure the variables are provided
if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Warning: Supabase URL or Key is missing. Check your .env file!");
}

// Create the actual client we will use to talk to the database
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

/*
  Existing Schema:
  CREATE TABLE messages (
      id SERIAL PRIMARY KEY,
      sender VARCHAR(255) NOT NULL,
      recipient VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      delivered BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
*/

/**
 * Persist encrypted message to Supabase DB.
 * Server stores ciphertext only; keys are never transmitted to backend.
 */
async function storeCiphertext(sender, recipient, ciphertext) {
    try {
        // We use the Supabase library to insert the data cleanly
        // Map the parameters to the correct column names:
        // 'sender' -> sender, 'recipient' -> recipient, 'ciphertext' -> content
        const { data, error } = await supabase
            .from('messages')
            .insert([
                { sender: sender, recipient: recipient, content: ciphertext }
            ])
            .select();

        if (error) {
            throw error;
        }

        console.log("Stored ciphertext ID:", data[0].id);
        
        return data[0];
    } catch (error) {
        console.error("DB Insert Error:", error);
        throw error;
    }
}

/**
 * Flips the 'delivered' status of a specific message to TRUE.
 * @param {number} messageId - The ID of the message in the database.
 */
async function markAsDelivered(messageId) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .update({ delivered: true })
            .eq('id', messageId) // Find the exact message by its ID
            .select();

        if (error) {
            throw error;
        }

        console.log(`✅ Success! Message ID ${messageId} is now marked as DELIVERED = TRUE`);
        return data[0];
    } catch (error) {
        console.error("DB Update Error:", error);
        throw error;
    }
}

module.exports = {
    storeCiphertext,
    markAsDelivered
};
