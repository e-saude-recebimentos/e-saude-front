'use client'

import { useState } from 'react'
import { addClient } from '@/app/workspace/[year]/actions'
import { UserPlus, Loader2 } from 'lucide-react'

// Função simples para aplicar máscara de CPF no input
function cpfMask(value: string) {
    return value
        .replace(/\D/g, '') // remove letras
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1') // captura até 2 dígitos finais
}

export function ClientForm() {
    const [cpf, setCpf] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setMessage(null)

        const form = event.currentTarget
        const formData = new FormData(form)
        const result = await addClient(formData)

        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'Cliente cadastrado com sucesso!' })
            // Reseta form
            form.reset()
            setCpf('')

            // Limpa mensagem de sucesso depois de 3s
            setTimeout(() => setMessage(null), 3000)
        }

        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
                <div className={`p-3 text-sm font-medium rounded-lg text-center ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {message.text}
                </div>
            )}

            <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                </label>
                <input
                    required
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Ex: João da Silva"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                />
            </div>
            <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                    CPF
                </label>
                <input
                    required
                    id="cpf"
                    name="cpf"
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(cpfMask(e.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                />
            </div>

            <button
                type="submit"
                disabled={loading || cpf.length < 14}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Adicionar Cliente
            </button>
        </form>
    )
}
