'use client'

import { type Client } from '@/types/database'
import { UserCircle } from 'lucide-react'

export function ClientList({ clients }: { clients: Client[] }) {
    if (!clients || clients.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500 text-sm">
                Nenhum cliente cadastrado ainda.
            </div>
        )
    }

    return (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {clients.map(client => (
                <div
                    key={client.id}
                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg shadow-sm bg-gray-50 hover:bg-white hover:border-blue-200 transition-all cursor-default"
                >
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                        <UserCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-semibold text-gray-900 truncate" title={client.full_name}>
                            {client.full_name}
                        </h4>
                        <span className="text-xs text-gray-500">{client.cpf}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
