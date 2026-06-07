import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { fullName, age, testScore } = request.body;

        if (!fullName || !age || !testScore) {
            return response.status(400).json({ error: 'Missing required fields' });
        }

        // Insert the new record into the database
        const result = await sql`
            INSERT INTO scores (full_name, age, test_score)
            VALUES (${fullName}, ${age}, ${testScore})
            RETURNING id;
        `;

        return response.status(200).json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error('Error inserting record:', error);
        return response.status(500).json({ error: 'Failed to insert record', details: error.message });
    }
}
