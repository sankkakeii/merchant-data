import React, { useState, useEffect } from 'react';
import { Loader2, Info, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [user, setUser] = useState(null);
    const [location, setLocation] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
    });
    const API_URL = '/api';



    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const loginUser = async credentials => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/supa/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            fetchBranches();
            return response.json();
        } catch (error) {
            setMessage(`Login failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    const handleSignIn = async e => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await loginUser(formData);
            setUser(response.user);
            localStorage.setItem('token', response.token);
            setMessage(`Welcome, ${response.user.name}!`);
        } catch (error) {
            setMessage(`Login failed. ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    const renderAuthForm = () => (
        <motion.form
            onSubmit={handleSignIn}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
        >
            <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
                    Email Address
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    className="appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="password">
                    Password
                </label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className="appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                />
            </div>
            <div className="flex items-center justify-between">
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    {'Sign In'}
                </button>
                <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                >
                    {'Create an account'}
                </button>
            </div>
        </motion.form>
    );


    return (
        <div className="flex flex-col items-center justify-center w-full h-screen p-4 gap-6 bg-gradient-to-r from-blue-100 to-purple-200 sm:flex-row">

            <motion.div
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-1/2 lg:w-1/3"
            >
                <h1 className="text-2xl font-bold mb-4">Login/Register</h1>
                {renderAuthForm()}
                {message && <p className="text-red-500 mt-2">{message}</p>}
            </motion.div>
        </div>
    );
};

export default Login;
