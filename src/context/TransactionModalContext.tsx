'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type TransactionModalContextType = {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    onTransactionCreated: () => void;
    setOnTransactionCreated: (callback: () => void) => void;
};

const TransactionModalContext = createContext<TransactionModalContextType | undefined>(undefined);

export function TransactionModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [onTransactionCreatedCallback, setOnTransactionCreatedCallback] = useState<() => void>(() => () => {});

    const openModal = useCallback(() => setIsOpen(true), []);
    const closeModal = useCallback(() => setIsOpen(false), []);

    const setOnTransactionCreated = useCallback((callback: () => void) => {
        setOnTransactionCreatedCallback(() => callback);
    }, []);

    const onTransactionCreated = useCallback(() => {
        onTransactionCreatedCallback();
    }, [onTransactionCreatedCallback]);

    return (
        <TransactionModalContext.Provider value={{
            isOpen,
            openModal,
            closeModal,
            onTransactionCreated,
            setOnTransactionCreated
        }}>
            {children}
        </TransactionModalContext.Provider>
    );
}

export function useTransactionModal() {
    const context = useContext(TransactionModalContext);
    if (context === undefined) {
        throw new Error('useTransactionModal must be used within a TransactionModalProvider');
    }
    return context;
}
