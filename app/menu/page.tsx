"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

interface MenuItem {
    id: number
    name: string
    price: number
    description?: string
    category?: string
}

export default function Menu() {
    const [menu, setMenu] = useState<MenuItem[]>([])

    useEffect(() => {
        fetchMenu()
    }, [])

    const fetchMenu = async () => {
        const { data } = await supabase.from("menu").select("*")
        setMenu(data || [])
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                    Our <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Menu</span>
                </h1>
                <p className="mt-4 text-lg text-slate-600">Freshly prepared with love from our kitchen to your table.</p>
            </header>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {menu.length > 0 ? (
                    menu.map((item) => (
                        <div key={item.id} className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-slate-800 group-hover:text-orange-600">{item.name}</h2>
                                <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                                    ₹{item.price}
                                </span>
                            </div>
                            {item.description && (
                                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{item.description}</p>
                            )}
                            <div className="mt-6">
                                <button className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 active:scale-95 transition-transform">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
                            <p className="text-slate-400">Loading your menu...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
