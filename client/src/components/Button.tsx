import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
    isLoading, 
    children, 
    className = '', 
    disabled, 
    ...props 
}) => {
    return (
        <button
            className={`button ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
};

export default Button;
