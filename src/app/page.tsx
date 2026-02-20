import { Header } from '@/components/Header'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { CreateYearModal } from '@/components/CreateYearModal'

export default async function Dashboard() {
  const supabase = await createClient()

  // Buscar os anos que já tem lançamentos
  const { data: receipts } = await supabase.from('receipts').select('year')
  const { data: summaries } = await supabase.from('monthly_summaries').select('year')

  const yearSet = new Set<number>()
  receipts?.forEach(r => yearSet.add(r.year))
  summaries?.forEach(s => yearSet.add(s.year))

  const currentYear = new Date().getFullYear()
  yearSet.add(currentYear) // Sempre mostra pelo menos o ano atual como um atalho

  const years = Array.from(yearSet).sort((a, b) => b - a)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seus Recibos</h1>
            <p className="text-gray-500 mt-1">Gerencie seus recebimentos anuais</p>
          </div>

          <div className="flex items-center gap-3">
            <CreateYearModal />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {years.map(year => (
            <Link
              key={year}
              href={`/workspace/${year}`}
              className="group block bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {year}
                </h2>
                {year === currentYear && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Atual
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">
                Acesse para adicionar ou visualizar os recebimentos de {year}.
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
