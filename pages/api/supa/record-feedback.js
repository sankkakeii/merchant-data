import { supabase } from "@/utils/superbase";
import { verifyToken } from '@/utils/auth'

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
            .from('canvassers_merchant_feedback_logs')
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
        await logActivity('ERROR', 'Invalid request method for recording Merchant data', { method: req.method });
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { feedbackData, location } = req.body;
    const user = verifyToken(req);

    if (!user) {
        await logActivity('FAILURE', 'Unauthorized Merchant data submission attempt');
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const { data, error } = await supabase
            .from('canvassers_merchant_feedback')
            .insert([{
                user_id: user.userId,
                merchant_code: feedbackData.merchant_code,
                merchant_phone: feedbackData.merchant_phone,
                merchant_address: feedbackData.merchant_address,
                extra_feedback: feedbackData.extraFeedback,
                location: location
            }]);

        if (error) {
            await logActivity('ERROR', 'Database insertion error during Merchant data recording', { error, userId: user.userId });
            throw error;
        }

        await logActivity('SUCCESS', 'Merchant data recorded successfully', { userId: user.userId });
        res.status(200).json({ message: 'Merchant data recorded successfully', data });
    } catch (error) {
        await logActivity('ERROR', 'An error occurred during Merchant data submission', { error: error.message, userId: user.userId });
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}