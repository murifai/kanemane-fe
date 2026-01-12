// Asset types
export interface Asset {
    id: number;
    owner_type: string;
    owner_id: number;
    country: 'JP' | 'ID';
    name: string;
    type: 'tabungan' | 'e-money' | 'investasi';
    currency: 'JPY' | 'IDR';
    balance: number;
    created_at: string;
    updated_at: string;
}

// Transaction types
export interface Income {
    id: number;
    type: 'income';
    owner_type: string;
    owner_id: number;
    asset_id: number;
    category: string;
    amount: number;
    currency: 'JPY' | 'IDR';
    date: string;
    note?: string;
    created_by: number;
    created_at: string;
    updated_at: string;
    asset?: Asset;
}

export interface Expense {
    id: number;
    type: 'expense';
    owner_type: string;
    owner_id: number;
    asset_id: number;
    category: string;
    amount: number;
    currency: 'JPY' | 'IDR';
    date: string;
    note?: string;
    created_by: number;
    created_at: string;
    updated_at: string;
    asset?: Asset;
}

export type Transaction = Income | Expense;

// Dashboard types
export interface Goal {
    id: number;
    name: string;
    target_amount: number;
    current_amount: number;
    currency: 'JPY' | 'IDR';
    deadline?: string;
}

export interface DashboardSummary {
    total_assets_jpy: number;
    total_assets_idr: number;
    monthly_income: number;
    monthly_expense: number;
    balance: number;
    top_expense_category: string | null;
    recent_transactions?: Transaction[];
    goals?: Goal[];
}

export interface MonthlyTrend {
    month: string;
    income: number;
    expense: number;
}

export interface CategoryBreakdown {
    category: string;
    amount: number;
}

export interface DashboardCharts {
    weekly_trend?: MonthlyTrend[];
    monthly_trend: MonthlyTrend[];
    yearly_trend?: MonthlyTrend[];
    category_breakdown: CategoryBreakdown[];
}

// API Response types
export interface AssetsResponse {
    personal: Asset[];
    family: Asset[];
}

// Form types
export interface CreateAssetData {
    name: string;
    type: 'tabungan' | 'e-money' | 'investasi';
    country: 'JP' | 'ID';
    currency: 'JPY' | 'IDR';
    balance: number;
    owner_type?: 'user' | 'family';
    family_id?: number;
}

export interface CreateIncomeData {
    asset_id: number;
    category: string;
    amount: number;
    date: string;
    note?: string;
}

export interface CreateExpenseData {
    asset_id: number;
    category: string;
    amount: number;
    date: string;
    note?: string;
}

// Receipt scan types
export interface ReceiptItem {
    name: string;
    price: number;
}

export interface ReceiptScanResult {
    amount: number;
    date: string;
    merchant: string;
    category: string;
    items: ReceiptItem[];
}

export interface ReceiptScanResponse {
    success: boolean;
    data: ReceiptScanResult;
}

// User types
export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    language?: string;
    phone?: string;
}

// Onboarding types
export interface OnboardingStatus {
    completed: boolean;
    has_assets: boolean;
    has_primary_asset: boolean;
}

export interface OnboardingUser {
    id: number;
    name: string;
    email: string;
    phone: string;
}
