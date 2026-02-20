import { Header } from '@/components/Header'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import { ClientForm } from '@/components/ClientForm'
import { ClientList } from '@/components/ClientList'
import { getClients } from '@/app/workspace/[year]/actions'
import { getReceiptsWithSummaries } from '@/app/workspace/[year]/receipts-actions'
import { ReceiptsAccordion } from '@/components/ReceiptsAccordion'

type PageProps = {
    params: Promise<{ year: string }>
}

export default async function WorkspacePage({ params }: PageProps) {
    const resolvedParams = await params
    const { year } = resolvedParams

    // Buscar clientes pelo servidor (Server Component)
    const clients = await getClients()

    // Buscar todos os recibos e resumos mensais daquele ano
    const { receipts, summaries } = await getReceiptsWithSummaries(parseInt(year))

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors"
                            title="Voltar para a página inicial"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Área de Trabalho <span className="text-blue-600 font-extrabold">{year}</span>
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Gerencie seus clientes e recebimentos para este ano.</p>
                        </div>
                    </div>
                    <div>
                        <a
                            href={`/api/export/${year}`}
                            download
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Download className="h-4 w-4" />
                            Exportar Planilha
                        </a>
                    </div>
                </div>

                {/* --- SPLIT VIEW LAYOUT --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* COLUNA ESQUERDA: CLIENTES (Ocupa 4/12 partes da tela em desktop) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Gerenciar Clientes</h2>

                            {/* Form placeholder */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                                <ClientForm />
                            </div>

                            {/* Lista placeholder */}
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Meus Clientes</h3>
                                <ClientList clients={clients} />
                            </div>
                        </div>
                    </div>

                    {/* COLUNA DIREITA: RECEBIMENTOS E ACORDEÃO (Ocupa 8/12 partes em desktop) */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Recebimentos Mensais</h2>

                            {/* Acordeão */}
                            <div className="mt-4">
                                <ReceiptsAccordion
                                    receipts={receipts}
                                    summaries={summaries}
                                    clients={clients}
                                    year={parseInt(year)}
                                />
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
