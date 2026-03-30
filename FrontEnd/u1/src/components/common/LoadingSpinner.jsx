import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'blue' }) => {
    const sizes = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    const colors = {
        blue: 'border-blue-500',
        green: 'border-green-500',
        red: 'border-red-500',
        gray: 'border-gray-500'
    };

    return (
        <div className="flex justify-center items-center">
            <div
                className={`${sizes[size]} border-4 border-t-4 ${colors[color]} border-t-transparent rounded-full animate-spin`}
            ></div>
        </div>
    );
};

export default LoadingSpinner;