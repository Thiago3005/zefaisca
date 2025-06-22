import React from 'react';
import audioManager from '../services/audioManager'; // Import AudioManager

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', onClick, ...props }) => {
  const baseStyle = "font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50";
  const variantStyles = {
    primary: "bg-cyan-500 hover:bg-cyan-600 text-white focus:ring-cyan-400",
    secondary: "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    audioManager.playSound('ui_button_click');
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;