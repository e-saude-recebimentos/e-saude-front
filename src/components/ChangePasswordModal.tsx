'use client'

import { useState } from 'react'
import { KeyRound, X, Loader2, CheckCircle2, ShieldEllipsis } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function ChangePasswordModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            return
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            return
        }

        setLoading(true)
        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            setError(error.message === 'New password should be different from the old password'
                ? 'A nova senha deve ser diferente da atual'
                : error.message)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
            setTimeout(() => {
                setIsOpen(false)
                setSuccess(false)
                setPassword('')
                setConfirmPassword('')
            }, 2000)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
            >
                <ShieldEllipsis className="h-4 w-4" />
                Alterar Senha
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-0 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <KeyRound className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-bold text-gray-900">Alterar Senha</h3>
                            </div>
                            <button
                                onClick={() => !loading && setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {success ? (
                            <div className="p-8 flex flex-col items-center text-center space-y-4">
                                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">Senha Alterada!</h4>
                                    <p className="text-sm text-gray-500">Sua senha foi atualizada com sucesso.</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="No mínimo 6 caracteres"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Repita a nova senha"
                                    />
                                </div>

                                <div className="pt-2 flex justify-end gap-2 text-sm">
                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            'Atualizar Senha'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
