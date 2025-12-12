"use client";

import React, { useState } from 'react';
import { FileText, Calendar, FileBarChart, Search, Download, Filter } from 'lucide-react';

export default function ReportPage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className=" p-6 space-y-6 max-h-screen overflow-y-scroll">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
                <p className="text-gray-600 mt-1">Generate and download HR2 system reports</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-purple-700 font-medium">Total Reports</p>
                            <p className="text-3xl font-bold text-purple-900 mt-1">3</p>
                            <p className="text-xs text-purple-600 mt-1">Generated</p>
                        </div>
                        <FileText className="text-purple-600" size={24} />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-blue-700 font-medium">This Month</p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">0</p>
                            <p className="text-xs text-blue-600 mt-1">Recent Reports</p>
                        </div>
                        <Calendar className="text-blue-600" size={24} />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-green-700 font-medium">Report Types</p>
                            <p className="text-3xl font-bold text-green-900 mt-1">3</p>
                            <p className="text-xs text-green-600 mt-1">Categories</p>
                        </div>
                        <FileBarChart className="text-green-600" size={24} />
                    </div>
                </div>
            </div>

            {/* Generate New Report */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate New Report</h3>
                <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                    <FileBarChart size={20} />
                    Generate Report
                </button>
            </div>

            {/* Recent Reports */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Reports</h3>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                            <Filter size={18} />
                            Newest First
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Report 1 */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <FileText className="text-purple-600" size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">Learning Progress Summary</h4>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        2024-11-08
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FileText size={14} />
                                        System
                                    </span>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                        Learning Management
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm whitespace-nowrap ml-4">
                            <Download size={16} />
                            Download
                        </button>
                    </div>

                    {/* Report 2 */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <FileText className="text-purple-600" size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">Training Attendance Report - October</h4>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        2024-11-05
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FileText size={14} />
                                        HR Admin
                                    </span>
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                                        Training Management
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm whitespace-nowrap ml-4">
                            <Download size={16} />
                            Download
                        </button>
                    </div>

                    {/* Report 3 */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <FileText className="text-purple-600" size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">Q3 2024 Competency Report</h4>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        2024-10-01
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FileText size={14} />
                                        HR Admin
                                    </span>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                        Competency Assessment
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm whitespace-nowrap ml-4">
                            <Download size={16} />
                            Download
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Categories */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Report Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FileBarChart className="text-purple-600" size={20} />
                            </div>
                            <h4 className="font-semibold text-gray-800">Learning Management</h4>
                        </div>
                        <p className="text-sm text-gray-600">Module completion, progress tracking, quiz results</p>
                    </div>

                    <div className="p-4 border border-indigo-200 bg-indigo-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <FileBarChart className="text-indigo-600" size={20} />
                            </div>
                            <h4 className="font-semibold text-gray-800">Training Management</h4>
                        </div>
                        <p className="text-sm text-gray-600">Attendance records, registration data, feedback analysis</p>
                    </div>

                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FileBarChart className="text-green-600" size={20} />
                            </div>
                            <h4 className="font-semibold text-gray-800">Competency Assessment</h4>
                        </div>
                        <p className="text-sm text-gray-600">Employee evaluations, skill gaps, department averages</p>
                    </div>
                </div>
            </div>
        </div>
    );
}