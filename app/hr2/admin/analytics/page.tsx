"use client";

import React from 'react';
import { Award, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <div className=" p-6 space-y-6 max-h-screen overflow-y-scroll">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-700 mt-1">Comprehensive performance and competency analytics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-sm text-purple-700 font-medium">Avg Competency</p>
                            <p className="text-3xl font-bold text-purple-900 mt-1">75%</p>
                        </div>
                        <Award className="text-purple-600" size={24} />
                    </div>
                    <p className="text-xs text-green-600 font-medium">+5% from last month</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Learning Hours</p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">24</p>
                        </div>
                        <BookOpen className="text-blue-600" size={24} />
                    </div>
                    <p className="text-xs text-gray-600">This month</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-sm text-green-700 font-medium">Trainings</p>
                            <p className="text-3xl font-bold text-green-900 mt-1">5</p>
                        </div>
                        <GraduationCap className="text-green-600" size={24} />
                    </div>
                    <p className="text-xs text-gray-600">Completed</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-sm text-amber-700 font-medium">Skill Growth</p>
                            <p className="text-3xl font-bold text-amber-900 mt-1">+12%</p>
                        </div>
                        <TrendingUp className="text-amber-600" size={24} />
                    </div>
                    <p className="text-xs text-gray-600">This quarter</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Competency Levels by Skill */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Competency Levels by Skill</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-700 font-medium">Programming</span>
                                <span className="text-gray-600">85%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-8 rounded-full flex items-center justify-end pr-3"
                                    style={{ width: '85%' }}
                                >
                                    <span className="text-white text-xs font-semibold">85</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-700 font-medium">Database</span>
                                <span className="text-gray-600">65%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-8 rounded-full flex items-center justify-end pr-3"
                                    style={{ width: '65%' }}
                                >
                                    <span className="text-white text-xs font-semibold">65</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-700 font-medium">Communication</span>
                                <span className="text-gray-600">80%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-8 rounded-full flex items-center justify-end pr-3"
                                    style={{ width: '80%' }}
                                >
                                    <span className="text-white text-xs font-semibold">80</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-700 font-medium">Data Analytics</span>
                                <span className="text-gray-600">45%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-8 rounded-full flex items-center justify-end pr-3"
                                    style={{ width: '45%' }}
                                >
                                    <span className="text-white text-xs font-semibold">45</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Learning Progress Over Time */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Progress Over Time</h3>
                    <div className="relative h-64">
                        <svg className="w-full h-full" viewBox="0 0 400 200">
                            {/* Grid lines */}
                            <line x1="40" y1="20" x2="40" y2="180" stroke="#e5e7eb" strokeWidth="1" />
                            <line x1="40" y1="180" x2="380" y2="180" stroke="#e5e7eb" strokeWidth="1" />

                            {/* Y-axis labels */}
                            <text x="30" y="25" fontSize="10" fill="#6b7280" textAnchor="end">12</text>
                            <text x="30" y="95" fontSize="10" fill="#6b7280" textAnchor="end">6</text>
                            <text x="30" y="185" fontSize="10" fill="#6b7280" textAnchor="end">0</text>

                            {/* X-axis labels */}
                            <text x="80" y="195" fontSize="10" fill="#6b7280" textAnchor="middle">Jul</text>
                            <text x="160" y="195" fontSize="10" fill="#6b7280" textAnchor="middle">Aug</text>
                            <text x="240" y="195" fontSize="10" fill="#6b7280" textAnchor="middle">Sep</text>
                            <text x="320" y="195" fontSize="10" fill="#6b7280" textAnchor="middle">Oct</text>
                            <text x="380" y="195" fontSize="10" fill="#6b7280" textAnchor="middle">Nov</text>

                            {/* Completed line (teal) */}
                            <polyline
                                points="80,140 160,120 240,100 320,80 380,40"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* In Progress line (blue) */}
                            <polyline
                                points="80,150 160,145 240,155 320,150 380,145"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Data points for Completed */}
                            <circle cx="80" cy="140" r="4" fill="#10b981" />
                            <circle cx="160" cy="120" r="4" fill="#10b981" />
                            <circle cx="240" cy="100" r="4" fill="#10b981" />
                            <circle cx="320" cy="80" r="4" fill="#10b981" />
                            <circle cx="380" cy="40" r="4" fill="#10b981" />

                            {/* Data points for In Progress */}
                            <circle cx="80" cy="150" r="4" fill="#3b82f6" />
                            <circle cx="160" cy="145" r="4" fill="#3b82f6" />
                            <circle cx="240" cy="155" r="4" fill="#3b82f6" />
                            <circle cx="320" cy="150" r="4" fill="#3b82f6" />
                            <circle cx="380" cy="145" r="4" fill="#3b82f6" />
                        </svg>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">in-progress</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Training Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Training Distribution</h3>
                    <div className="flex items-center justify-center h-64">
                        <svg width="200" height="200" viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="40" />

                            {/* Workshops - 40% (144deg) - Blue */}
                            <circle
                                cx="100" cy="100" r="80"
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="40"
                                strokeDasharray="201 503"
                                strokeDashoffset="0"
                                transform="rotate(-90 100 100)"
                            />

                            {/* Seminars - 40% (144deg) - Purple */}
                            <circle
                                cx="100" cy="100" r="80"
                                fill="none"
                                stroke="#8b5cf6"
                                strokeWidth="40"
                                strokeDasharray="201 503"
                                strokeDashoffset="-201"
                                transform="rotate(-90 100 100)"
                            />

                            {/* Webinars - 20% (72deg) - Teal */}
                            <circle
                                cx="100" cy="100" r="80"
                                fill="none"
                                stroke="#14b8a6"
                                strokeWidth="40"
                                strokeDasharray="100.5 503"
                                strokeDashoffset="-402"
                                transform="rotate(-90 100 100)"
                            />

                            <text x="100" y="105" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1f2937">5</text>
                            <text x="100" y="125" textAnchor="middle" fontSize="12" fill="#6b7280">Total</text>
                        </svg>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <div>
                                <p className="text-xs text-gray-600">Workshops</p>
                                <p className="text-sm font-semibold">40%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded"></div>
                            <div>
                                <p className="text-xs text-gray-600">Seminars</p>
                                <p className="text-sm font-semibold">40%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-teal-500 rounded"></div>
                            <div>
                                <p className="text-xs text-gray-600">Webinars</p>
                                <p className="text-sm font-semibold">20%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Department Competency Comparison */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Department Competency Comparison</h3>
                    <div className="relative h-64">
                        <svg className="w-full h-full" viewBox="0 0 400 200">
                            {/* Grid */}
                            <line x1="40" y1="20" x2="40" y2="180" stroke="#e5e7eb" strokeWidth="1" />
                            <line x1="40" y1="180" x2="380" y2="180" stroke="#e5e7eb" strokeWidth="1" />

                            {/* Y-axis labels */}
                            <text x="30" y="25" fontSize="10" fill="#6b7280" textAnchor="end">80</text>
                            <text x="30" y="95" fontSize="10" fill="#6b7280" textAnchor="end">40</text>
                            <text x="30" y="185" fontSize="10" fill="#6b7280" textAnchor="end">0</text>

                            {/* Bars */}
                            <rect x="70" y="45" width="60" height="135" fill="#6366f1" rx="4" />
                            <rect x="160" y="25" width="60" height="155" fill="#6366f1" rx="4" />
                            <rect x="250" y="20" width="60" height="160" fill="#6366f1" rx="4" />
                            <rect x="340" y="20" width="60" height="160" fill="#6366f1" rx="4" />

                            {/* X-axis labels */}
                            <text x="100" y="195" fontSize="10" fill="#6b7280" textAnchor="middle">CS</text>
                            <text x="190" y="195" fontSize="10" fill="#6b7280" textAnchor="middle">IT</text>
                            <text x="280" y="195" fontSize="10" fill="#6b7280" textAnchor="middle">IS</text>
                            <text x="370" y="195" fontSize="10" fill="#6b7280" textAnchor="middle">Math</text>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}