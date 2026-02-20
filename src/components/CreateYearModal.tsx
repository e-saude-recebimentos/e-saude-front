'use client'

import { useState } from 'react'
import { PlusCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CreateYearModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [year, setYear] = useState(new Date().getFullYear().toString())
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (year && year.length === 4) {
            router.push(`/workspace/${year}`)
            setIsOpen(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
                <PlusCircle className="h-4 w-4" />
                Criar Recibo
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-0">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Selecionar Ano</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ano de Referência</label>
                                <input
                                    type="number"
                                    required
                                    min="2000"
                                    max="2100"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-2 text-sm">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                                    Acessar Área
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
