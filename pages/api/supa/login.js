import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Logging function to write logs to Supabase
const logActivity = async (logType, message, additionalInfo = {}) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        log_type: logType,
        message,
        additional_info: additionalInfo
    };

    try {
        const { error } = await supabase
            .from('canvassers_merchant_auth_logs')
            .insert([logEntry]);

        if (error) {
            console.error('Error inserting log:', error);
        }
    } catch (err) {
        console.error('Error logging activity:', err);
    }
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        await logActivity('ERROR', 'Invalid request method for login', { method: req.method });
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, password } = req.body;

    try {
        // Fetch user from Supabase
        const { data: user, error } = await supabase
            .from('canvassers_merchant_users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            await logActivity('FAILURE', 'Invalid credentials', { email });
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            await logActivity('FAILURE', 'Password mismatch', { email });
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.active) {
            await logActivity('FAILURE', 'Inactive user attempted login', { email });
            return res.status(401).json({ message: 'User is not active, Please contact admin' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.NEXT_JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Remove sensitive information from user object
        delete user.password;

        await logActivity('SUCCESS', 'User logged in successfully', { userId: user.id, email });
        res.status(200).json({ user, token });
    } catch (error) {
        await logActivity('ERROR', 'An error occurred during login', { error: error.message, email, userId: user?.id });
        console.error('Login error:', error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
}
