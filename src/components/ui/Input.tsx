import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div className="mb-4">
            {label && (
                <label className="block font-bold mb-2 text-sm">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-2 bg-[#F8F8F8] border-[3px] border-black focus:outline-none focus:ring-2 focus:ring-[#ff5e75] ${error ? 'border-[#ef4343]' : ''} ${className}`}
                {...props}
            />
            {error && (
                <p className="text-[#ef4343] text-sm mt-1 font-medium">{error}</p>
            )}
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
    return (
        <div className="mb-4">
            {label && (
                <label className="block font-bold mb-2 text-sm">
                    {label}
                </label>
            )}
            <select
                className={`w-full px-4 py-2 bg-[#F8F8F8] border-[3px] border-black focus:outline-none focus:ring-2 focus:ring-[#ff5e75] ${error ? 'border-[#ef4343]' : ''} ${className}`}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-[#ef4343] text-sm mt-1 font-medium">{error}</p>
            )}
        </div>
    );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
    return (
        <div className="mb-4">
            {label && (
                <label className="block font-bold mb-2 text-sm">
                    {label}
                </label>
            )}
            <textarea
                className={`w-full px-4 py-2 bg-[#F8F8F8] border-[3px] border-black focus:outline-none focus:ring-2 focus:ring-[#ff5e75] ${error ? 'border-[#ef4343]' : ''} ${className}`}
                {...props}
            />
            {error && (
                <p className="text-[#ef4343] text-sm mt-1 font-medium">{error}</p>
            )}
        </div>
    );
}
