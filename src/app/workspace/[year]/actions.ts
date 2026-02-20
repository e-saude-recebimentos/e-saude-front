'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addClient(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Usuário não autenticado' }
    }

    const full_name = formData.get('full_name') as string
    const cpf = formData.get('cpf') as string

    // Removendo formatação do CPF para salvar limpo no banco, se desejar (ou salva com máscara, o PRD fala "com máscara de CPF no cadastro", salvaremos com máscara padrão 000.000.000-00)

    const { data, error } = await supabase
        .from('clients')
        .insert([
            {
                user_id: user.id,
                full_name,
                cpf
            }
        ])
        .select()
        .single()

    if (error) {
        if (error.code === '23505') {
            return { error: 'Este CPF já está cadastrado para você.' }
        }
        return { error: 'Erro ao cadastrar cliente. Tente novamente.' }
    }

    revalidatePath('/workspace/[year]', 'page')
    return { success: true, client: data }
}

export async function getClients() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Erro ao buscar clientes:', error)
        return []
    }

    return data
}
