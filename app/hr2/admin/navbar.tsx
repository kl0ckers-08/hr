"use client";
import { Bell, Home, Users, BookOpen, GraduationCap, FileText, BarChart3, FileBarChart, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";


export default function Hr2Navbar() {
    const [currentPage, setCurrentPage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    return (

        <>
            <div className="flex flex-col h-full justify-between">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-xl">O</span>
                    </div>
                    <span className="text-xl font-bold">HR2</span>
                    <div className="ml-auto relative">
                        <Bell size={20} />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">2</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <Link href="/hr2/admin">
                        <button
                            onClick={() => setCurrentPage('dashboard')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'dashboard' ? 'bg-white text-[rgb(89,85,179)]' : 'hover:bg-black/30'}`}
                        >
                            <Home size={20} />
                            <span>Dashboard</span>
                        </button>
                    </Link>
                    <Link href="/hr2/admin/competency">
                        <button
                            onClick={() => setCurrentPage('competency')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'competency' ? 'bg-white text-[rgb(89,85,179)]' : 'hover:bg-black/30'}`}
                        >
                            <Users size={20} />
                            <span>Competency</span>
                        </button>
                    </Link>

                    <Link href="/hr2/admin/learning">
                        <button
                            onClick={() => setCurrentPage('learning')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'learning' ? 'bg-white text-[rgb(89,85,179)]' : 'hover:bg-black/30'}`}
                        >
                            <BookOpen size={20} />
                            <span>Learning</span>
                        </button>
                    </Link>

                    <Link href="/hr2/admin/training">
                        <button
                            onClick={() => setCurrentPage('training')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'training' ? 'bg-white text-[rgb(89,85,179)]' : 'hover:bg-black/30'}`}
                        >
                            <GraduationCap size={20} />
                            <span>Training</span>
                        </button>
                    </Link>

                    <Link href="/hr2/admin/admin-ess">
                        <button
                            onClick={() => setCurrentPage('ess')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'ess' ? 'bg-white text-[rgb(89,85,179)]' : 'hover:bg-black/30'}`}
                        >
                            <FileText size={20} />
                            <span>ESS</span>
                        </button>
                    </Link>

                    <Link href="/hr2/admin/analytics">
                        <button
                            onClick={() => setCurrentPage('analytics')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'analytics' ? 'bg-white text-[rgb(89,85,179)]' : 'hover:bg-black/30'}`}
                        >
                            <BarChart3 size={20} />
                            <span>Analytics</span>
                        </button>
                    </Link>

                    <Link href="/hr2/admin/admin-report">
                        <button
                            onClick={() => setCurrentPage('report')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'report' ? 'bg-white text-[rgb(89,85,179)]' : 'hover:bg-black/30'}`}
                        >
                            <FileBarChart size={20} />
                            <span>Report</span>
                        </button>
                    </Link>

                </nav>

                <div className="p-4 border-t border-indigo-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-indigo-400 rounded-full flex items-center justify-center">
                            <span className="font-semibold">J</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">Jane Smith</p>
                            <p className="text-xs text-indigo-200">HR Admin</p>
                        </div>
                    </div>
                    <button className="w-full flex items-center gap-2 px-4 py-2 bg-indigo-700 rounded-lg hover:bg-indigo-600 transition-colors">
                        <LogOut size={18} />
                        <span className="text-sm">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}

