import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const TripContext = createContext();

export const TripProvider = ({ children }) => {
    const [popularTrips, setPopularTrips] = useState([]);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        from: "",
        to: "",
        minPrice: "",
        page: 1,
    });

    const limit = 20;

    // -----------------------------
    // API: lấy trip phổ biến
    // -----------------------------
    const fetchPopularTrips = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:5000/api/trips/popular");
            setPopularTrips(res.data);   // sửa tại đây
        } catch (error) {
            console.error("Lỗi load trip:", error);
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------
    // API: lấy danh sách trip có phân trang
    // -----------------------------
    const fetchTrips = async () => {
        try {
            setLoading(true);

            const res = await axios.get("http://localhost:5000/api/trips", {
                params: {
                    from: filters.from,
                    to: filters.to,
                    minPrice: filters.minPrice,
                    page: filters.page,
                },
            });

            setTrips(res.data);
        } catch (error) {
            console.error("Lỗi load trips:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TripContext.Provider
            value={{
                popularTrips,
                trips,
                loading,
                filters,
                setFilters,
                fetchPopularTrips,
            }}
        >
            {children}
        </TripContext.Provider>
    );
};

// custom hook
export const useTrip = () => {
    return useContext(TripContext);
};