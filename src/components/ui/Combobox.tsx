import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    value: string;
    label: string;
    keywords?: string;
}

interface ComboboxProps {
    label?: string;
    value?: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    error?: string;
    className?: string;
    required?: boolean;
}

export default function Combobox({
    label,
    value,
    onChange,
    options,
    placeholder = 'Select option...',
    error,
    className = '',
    required = false,
}: ComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [displayValue, setDisplayValue] = useState('');

    // Update display value when value prop changes or options load
    useEffect(() => {
        if (value) {
            const selectedOption = options.find(opt => opt.value === value);
            // If option found, use label. If not found (custom value), use value itself.
            setDisplayValue(selectedOption ? selectedOption.label : value);
        } else {
            setDisplayValue('');
        }
    }, [value, options]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // On close, if we were searching but didn't select, revert to current value's label
                // OR (decided behavior): keep custom text as value?
                // For this requirement ("default list but searchable"), we probably want to allow custom values for Bank Names if they aren't in the list?
                // Let's implement consistent behavior: 
                // If the user typed something and clicked away, we assume they want that value if it matches nothing?
                // Actually, for a bank list, usually you want them to pick from list OR type a new one.
                // Let's say we update the parent on Blur if it's a "Creatable" mode, but here we keep it simple.
                // If user clicks outside, we just close. The value doesn't change until they click an option or we implement "free text" handling.
                // Given the requirement "list default yang bisa di search", it implies searching the list. 
                // But users MIGHT have banks not in the list (e.g. obscure ones). 
                // I will allow the input itself to act as the value setter if it doesn't match? 
                // For now, let's strictly select from list OR allow typing.

                // Simpler approach for now:
                // Just close.
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (option.keywords && option.keywords.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSelect = (option: Option) => {
        onChange(option.value); // Use value (e.g. code)
        // setDisplayValue(option.label); // Effect will handle this
        setIsOpen(false);
        setSearchTerm('');
    };

    // Allow custom input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setSearchTerm(newVal);
        setDisplayValue(newVal);
        setIsOpen(true);
        // If we want to allow free text as value:
        onChange(newVal);
    };

    return (
        <div className="mb-4" ref={wrapperRef}>
            {label && (
                <label className="block font-bold mb-2 text-sm">
                    {label} {required && <span className="text-[#ff5e75]">*</span>}
                </label>
            )}
            <div className="relative">
                <div
                    className={`relative w-full bg-[#F8F8F8] border-[3px] border-black focus-within:ring-2 focus-within:ring-[#ff5e75] ${error ? 'border-[#ef4343]' : ''} ${className}`}
                >
                    <input
                        type="text"
                        className="w-full px-4 py-2 bg-transparent outline-none placeholder-gray-400"
                        placeholder={placeholder}
                        value={isOpen ? searchTerm : displayValue} // Show search term when open, display label when closed
                        onChange={handleInputChange}
                        onClick={() => {
                            setIsOpen(true);
                            setSearchTerm(''); // Reset search on click to show full list? Or keep generic?
                            // Better UX: if clicking, show full list unless typing. 
                            // If has value, maybe clear search term so they see all?
                        }}
                        onFocus={() => setIsOpen(true)}
                    />
                    <div className="absolute right-0 top-0 bottom-0 px-2 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border-[3px] border-black max-h-60 overflow-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center ${value === option.value ? 'bg-gray-50 font-bold' : ''}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    <span>{option.label}</span>
                                    {value === option.value && <Check className="w-4 h-4 text-[#ff5e75]" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-gray-500 text-sm">
                                "<strong>{searchTerm}</strong>" - Tekan enter untuk gunakan nilai ini
                            </div>
                        )}
                        {/* 
                           If no options match, the user has effectively set the value via onChange in handleInputChange.
                           Just need to visually indicate it.
                        */}
                    </div>
                )}
            </div>
            {error && (
                <p className="text-[#ef4343] text-sm mt-1 font-medium">{error}</p>
            )}
        </div>
    );
}
