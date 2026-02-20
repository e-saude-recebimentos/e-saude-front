'use client'

import { createClient } from '@/utils/supabase/client'
import { LogOut, ReceiptText } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Header() {
    const router = useRouter()
    const supabase = createClient()

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-2">
                        <ReceiptText className="h-6 w-6 text-blue-600" />
                        <span className="font-bold text-xl text-gray-900 tracking-tight">Gerenciador de Recibos</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-md hover:bg-red-50"
                    >
                        <LogOut className="h-4 w-4" />
                        Sair
                    </button>
                </div>
            </div>
        </header>
    )
}
