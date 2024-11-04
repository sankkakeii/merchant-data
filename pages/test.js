// In AdminDashboard.js
import Login from '@/components/auth-components/Login';
import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [sales, setSales] = useState([]);
    const [checkIns, setCheckIns] = useState([]);


    return (
        <div>
            <h1>Test Page</h1>

            <Login />
        </div>
    );
};

export default AdminDashboard;