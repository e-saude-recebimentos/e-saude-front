'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Buscar Recebimentos do Ano
export async function getReceiptsWithSummaries(year: number) {
    const supabase = await createClient()

    const { data: receiptsData, error: receiptsError } = await supabase
        .from('receipts')
        .select(`
      *,
      clients(full_name)
    `)
        .eq('year', year)
        .order('created_at', { ascending: true })

    const { data: summariesData, error: summariesError } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('year', year)

    if (receiptsError || summariesError) {
        console.error('Erro ao buscar dados:', receiptsError, summariesError)
        return { receipts: [], summaries: [] }
    }

    return { receipts: receiptsData || [], summaries: summariesData || [] }
}

// Salvar / Adicionar novo recebimento para um cliente num mês específico
export async function addReceipt(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Usuário não autenticado' }

    const client_id = formData.get('client_id') as string
    const amountStr = formData.get('amount') as string
    const month = parseInt(formData.get('month') as string)
    const year = parseInt(formData.get('year') as string)

    // Remover formatação R$ (ex: R$ 1.500,50 -> 1500.50)
    const numericAmount = parseFloat(
        amountStr.replace(/[^\d,]/g, '').replace(',', '.')
    )

    if (isNaN(numericAmount) || numericAmount <= 0) {
        return { error: 'Valor inválido' }
    }

    const { error } = await supabase
        .from('receipts')
        .insert([{
            user_id: user.id,
            client_id,
            amount: numericAmount,
            month,
            year
        }])

    if (error) return { error: 'Erro ao adicionar recebimento' }

    revalidatePath('/workspace/[year]', 'page')
    return { success: true }
}

// Atualizar Resumo Mensal (Carnê Leão)
export async function updateMonthlySummary(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Usuário não autenticado' }

    const month = parseInt(formData.get('month') as string)
    const year = parseInt(formData.get('year') as string)
    const amountStr = formData.get('carne_leao_amount') as string
    const dateStr = formData.get('carne_leao_date') as string

    let carne_leao_amount = null
    if (amountStr) {
        carne_leao_amount = parseFloat(amountStr.replace(/[^\d,]/g, '').replace(',', '.'))
    }

    let carne_leao_date = null
    if (dateStr) {
        carne_leao_date = dateStr
    }

    // Usamos upsert já que há um constraint UNIQUE(user_id, month, year) configurado
    const { error } = await supabase
        .from('monthly_summaries')
        .upsert(
            {
                user_id: user.id,
                month,
                year,
                carne_leao_amount,
                carne_leao_date,
                // O Supabase precisa de uma chave conflituosa se não for PK para fazer upsert no PostgREST 
                // Em tabelas normais é mais simples mapear. Como a chave unica é composta, faremos via matching manual se der erro.
            },
            { onConflict: 'user_id, month, year' }
        )

    if (error) return { error: 'Erro ao atualizar resumo.' }

    revalidatePath('/workspace/[year]', 'page')
    return { success: true }
}
