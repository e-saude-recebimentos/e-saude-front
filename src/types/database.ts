export type Client = {
    id: string
    user_id: string
    full_name: string
    cpf: string
    created_at: string
}

export type Receipt = {
    id: string
    user_id: string
    client_id: string
    amount: number
    month: number
    year: number
    created_at: string
}

export type MonthlySummary = {
    id: string
    user_id: string
    month: number
    year: number
    carne_leao_amount: number | null
    carne_leao_date: string | null
    created_at: string
}
