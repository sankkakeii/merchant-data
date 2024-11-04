// pages/api/sales
import { createClient } from '@supabase/supabase-js'
import { verifyToken } from '@/utils/auth'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
    const user = verifyToken(req)
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    if (req.method === 'GET') {
        console.log('HERE:::')
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const { data, error } = await supabase
                .from('canvassers_merchant_sales')
                .select('*')
                .eq('user_id', user.userId)
                .gte('created_at', today.toISOString())
                .order('created_at', { ascending: false })

            if (error) throw error

            res.status(200).json(data)
        } catch (error) {
            console.error('Fetch sales error:', error)
            res.status(500).json({ message: 'An error occurred while fetching sales' })
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' })
    }
}
