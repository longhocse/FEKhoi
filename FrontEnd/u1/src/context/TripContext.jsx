// context/TripContext.jsx
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const TripContext = createContext();

export const useTrip = () => {
    const context = useContext(TripContext);
    if (!context) {
        throw new Error('useTrip must be used within TripProvider');
    }
    return context;
};

export const TripProvider = ({ children }) => {
    const [popularTrips, setPopularTrips] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const fetchPopularTrips = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/trips/popular`);

            console.log('API Response:', response.data);

            // Xử lý response để luôn trả về array
            let tripsData = [];

            if (Array.isArray(response.data)) {
                tripsData = response.data;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                tripsData = response.data.data;
            } else if (response.data?.success && Array.isArray(response.data.data)) {
                tripsData = response.data.data;
            } else if (response.data?.result && Array.isArray(response.data.result)) {
                tripsData = response.data.result;
            } else {
                console.warn('Unexpected API response format:', response.data);
                tripsData = [];
            }

            setPopularTrips(tripsData);
        } catch (error) {
            console.error('Lỗi tải tuyến phổ biến:', error);
            setPopularTrips([]); // Luôn set array rỗng khi lỗi
        } finally {
            setLoading(false);
        }
    };

    const value = {
        popularTrips,
        loading,
        fetchPopularTrips
    };

    return (
        <TripContext.Provider value={value}>
            {children}
        </TripContext.Provider>
    );
};