'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Transaction } from '@/lib/types';

type TransactionModalContextType = {
    isOpen: boolean;
    transactionToEdit: Transaction | null;
    openModal: (transaction?: Transaction) => void;
    closeModal: () => void;
    onTransactionCreated: () => void;
    setOnTransactionCreated: (callback: () => void) => void;
};

const TransactionModalContext = createContext<TransactionModalContextType | undefined>(undefined);

export function TransactionModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [onTransactionCreatedCallback, setOnTransactionCreatedCallback] = useState<() => void>(() => () => { });

    const openModal = useCallback((transaction?: Transaction) => {
        setTransactionToEdit(transaction || null);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setTransactionToEdit(null);
    }, []);

    const setOnTransactionCreated = useCallback((callback: () => void) => {
        setOnTransactionCreatedCallback(() => callback);
    }, []);

    const onTransactionCreated = useCallback(() => {
        onTransactionCreatedCallback();
    }, [onTransactionCreatedCallback]);

    return (
        <TransactionModalContext.Provider value={{
            isOpen,
            transactionToEdit,
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
