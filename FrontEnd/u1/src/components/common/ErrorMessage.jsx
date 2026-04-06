import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Lỗi! </strong>
            <span className="block sm:inline">{message}</span>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                    Thử lại
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;