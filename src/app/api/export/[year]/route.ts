import { createClient } from '@/utils/supabase/server'
import { NextRequest } from 'next/server'

const MONTHS = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
]

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ year: string }> }
) {
    const { year } = await params
    const supabase = await createClient()

    // Verificar Autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new Response('Não autorizado', { status: 401 })
    }

    const numericYear = parseInt(year)

    // Buscar dados
    const { data: receipts } = await supabase
        .from('receipts')
        .select('*, clients(full_name)')
        .eq('year', numericYear)
        .order('created_at', { ascending: true })

    const { data: summaries } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('year', numericYear)

    if (!receipts) {
        return new Response('Erro ao buscar recibos', { status: 500 })
    }

    // Montar o conteúdo do arquivo
    // Adicionar BOM para Excel ler UTF-8 corretamente
    let fileContent = '\uFEFF'
    fileContent += 'Mês;Cliente / Descrição;Valor Recebido;Total do Mês;Carnê Leão;Data Carnê Leão\n'

    let hasData = false

    for (let idx = 0; idx < 12; idx++) {
        const monthNumber = idx + 1
        const monthReceipts = receipts.filter(r => r.month === monthNumber)
        const monthSummary = summaries?.find(s => s.month === monthNumber)

        // Apenas renderiza se tiver algum recibo ou algum resumo preenchido
        if (monthReceipts.length > 0 || monthSummary?.carne_leao_amount) {
            hasData = true
            let totalAmount = 0

            // Listando todos os recibos daquele mês se existirem
            monthReceipts.forEach(r => {
                const clientName = r.clients?.full_name || 'Desconhecido'
                fileContent += `${MONTHS[idx]};${clientName};${formatCurrency(r.amount)};;;;\n`
                totalAmount += r.amount
            })

            // Linha de consolidação/resumo final do mês (para somar no excel facilmente e ler o carnê)
            const carneLeaoAmount = monthSummary?.carne_leao_amount ? formatCurrency(monthSummary.carne_leao_amount) : 'R$ 0,00'
            const carneLeaoDate = monthSummary?.carne_leao_date
                ? new Date(monthSummary.carne_leao_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                : '-'

            fileContent += `${MONTHS[idx]};*** RESUMO DO MÊS ***;;${formatCurrency(totalAmount)};${carneLeaoAmount};${carneLeaoDate}\n`

            // Linha vazia para saltar no csv e ficar bonitinho
            fileContent += ';;;;;\n'
        }
    }

    if (!hasData) {
        fileContent = '\uFEFFNenhum dado encontrado para este ano.'
    }

    // Retornar como arquivo text/csv formatado para planilhas excel
    return new Response(fileContent, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="recibos-${year}.csv"`
        }
    })
}
