'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, CalendarIcon, FileLineChart, X, Loader2 } from 'lucide-react'
import type { Client, Receipt, MonthlySummary } from '@/types/database'
import { addReceipt, updateMonthlySummary } from '@/app/workspace/[year]/receipts-actions'

type ReceiptsAccordionProps = {
    receipts: (Receipt & { clients: { full_name: string } })[]
    summaries: MonthlySummary[]
    clients: Client[]
    year: number
}

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

// Currency Mask helper
const currencyMask = (value: string) => {
    let val = value.replace(/\D/g, "")
    if (val.length === 0) return ""
    val = (parseInt(val) / 100).toFixed(2)
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(val))
}

export function ReceiptsAccordion({ receipts, summaries, clients, year }: ReceiptsAccordionProps) {
    const [openMonth, setOpenMonth] = useState<number | null>(null)

    // Modal States
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)
    const [activeMonthId, setActiveMonthId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)

    // Form states Helper
    const [currencyInput, setCurrencyInput] = useState('')

    const toggleMonth = (m: number) => {
        setOpenMonth(openMonth === m ? null : m)
    }

    const formatCurrencyLabel = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

    const handleOpenReceiptModal = (monthNumber: number) => {
        setActiveMonthId(monthNumber)
        setCurrencyInput('')
        setIsReceiptModalOpen(true)
    }

    const handleOpenSummaryModal = (monthNumber: number, summary?: MonthlySummary) => {
        setActiveMonthId(monthNumber)
        setCurrencyInput(summary?.carne_leao_amount ? formatCurrencyLabel(summary.carne_leao_amount) : '')
        setIsSummaryModalOpen(true)
    }

    const handleReceiptSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.append('month', String(activeMonthId))
        formData.append('year', String(year))

        await addReceipt(formData)

        setLoading(false)
        setIsReceiptModalOpen(false)
    }

    const handleSummarySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.append('month', String(activeMonthId))
        formData.append('year', String(year))

        await updateMonthlySummary(formData)

        setLoading(false)
        setIsSummaryModalOpen(false)
    }

    return (
        <div className="space-y-4">
            {MONTHS.map((monthName, index) => {
                const monthNumber = index + 1
                const monthReceipts = receipts.filter(r => r.month === monthNumber)
                const monthSummary = summaries.find(s => s.month === monthNumber)
                const monthTotal = monthReceipts.reduce((acc, curr) => acc + curr.amount, 0)

                const isOpen = openMonth === monthNumber

                return (
                    <div key={monthNumber} className={`border rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? 'border-blue-300 shadow-md ring-1 ring-blue-100 bg-white' : 'border-gray-200 bg-gray-50/50'}`}>
                        <div
                            onClick={() => toggleMonth(monthNumber)}
                            className={`px-5 py-4 flex justify-between items-center cursor-pointer transition-colors ${isOpen ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`font-semibold ${isOpen ? 'text-blue-700' : 'text-gray-800'}`}>
                                    {monthName}
                                </span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${monthReceipts.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {monthReceipts.length} recibos
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-sm font-bold ${isOpen ? 'text-blue-700' : 'text-gray-900'}`}>
                                    {formatCurrencyLabel(monthTotal)}
                                </span>
                                {isOpen ? <ChevronUp className="h-5 w-5 text-blue-500" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                            </div>
                        </div>

                        {isOpen && (
                            <div className="bg-white border-t border-blue-100 p-5 pl-8">
                                {monthReceipts.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500 text-sm italic">
                                        Nenhum recebimento registrado em {monthName}.
                                    </div>
                                ) : (
                                    <div className="space-y-3 mb-6">
                                        {monthReceipts.map(receipt => (
                                            <div key={receipt.id} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                                <span className="text-sm font-medium text-gray-700">{receipt.clients?.full_name || 'Desconhecido'}</span>
                                                <span className="text-sm text-gray-900 font-semibold">{formatCurrencyLabel(receipt.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 mt-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleOpenReceiptModal(monthNumber)}
                                            className="flex items-center justify-center gap-2 bg-white border border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 hover:border-blue-500 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <Plus className="h-4 w-4 text-blue-500" />
                                            Adicionar Recebimento
                                        </button>

                                        <div className="bg-orange-50 rounded-lg p-3 border border-orange-100 flex flex-col gap-2 relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenSummaryModal(monthNumber, monthSummary)}
                                                    className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded font-semibold hover:bg-orange-300"
                                                >
                                                    Editar
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-orange-800 uppercase tracking-widest flex items-center gap-1">
                                                    <FileLineChart className="h-3 w-3" /> Carnê Leão
                                                </span>
                                                {!monthSummary && (
                                                    <button
                                                        onClick={() => handleOpenSummaryModal(monthNumber)}
                                                        className="text-xs text-orange-600 font-semibold underline hover:text-orange-800"
                                                    >
                                                        Detalhar
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex justify-between text-sm mt-1">
                                                <span className="text-orange-900">
                                                    Valor: <span className="font-semibold">{monthSummary?.carne_leao_amount ? formatCurrencyLabel(monthSummary.carne_leao_amount) : '-'}</span>
                                                </span>
                                                <span className="text-orange-900 flex items-center gap-1 font-medium">
                                                    <CalendarIcon className="h-3 w-3 text-orange-700" />
                                                    {monthSummary?.carne_leao_date ? new Date(monthSummary.carne_leao_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}

            {/* --- MODAL RECEBIMENTO --- */}
            {isReceiptModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Novo Recebimento - {MONTHS[(activeMonthId || 1) - 1]}</h3>
                            <button onClick={() => setIsReceiptModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleReceiptSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                <select name="client_id" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="">Selecione o Cliente</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.full_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                                <input
                                    type="text"
                                    name="amount"
                                    required
                                    value={currencyInput}
                                    onChange={(e) => setCurrencyInput(currencyMask(e.target.value))}
                                    placeholder="R$ 0,00"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-2 text-sm">
                                <button type="button" onClick={() => setIsReceiptModalOpen(false)} className="px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center w-28 disabled:opacity-75">
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL CARNÊ LEÃO --- */}
            {isSummaryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-orange-50">
                            <h3 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                                <FileLineChart className="h-5 w-5" /> Carnê Leão - {MONTHS[(activeMonthId || 1) - 1]}
                            </h3>
                            <button onClick={() => setIsSummaryModalOpen(false)} className="text-orange-700/50 hover:text-orange-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSummarySubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Devido (R$)</label>
                                <input
                                    type="text"
                                    name="carne_leao_amount"
                                    required
                                    value={currencyInput}
                                    onChange={(e) => setCurrencyInput(currencyMask(e.target.value))}
                                    placeholder="R$ 0,00"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Pagamento</label>
                                <input
                                    type="date"
                                    name="carne_leao_date"
                                    required
                                    defaultValue={summaries.find(s => s.month === activeMonthId)?.carne_leao_date || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-2 text-sm">
                                <button type="button" onClick={() => setIsSummaryModalOpen(false)} className="px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" disabled={loading} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg flex items-center justify-center w-28 disabled:opacity-75">
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}
