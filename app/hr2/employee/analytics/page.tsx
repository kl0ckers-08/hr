'use client';

import { useState } from 'react';

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('month');

    const competencyData = [
        { skill: 'Programming', level: 85 },
        { skill: 'Database', level: 65 },
        { skill: 'Communication', level: 75 },
        { skill: 'Data Analytics', level: 45 }
    ];

    const topSkills = [
        { name: 'Programming', score: 85, trend: '+5%' },
        { name: 'Communication', score: 80, trend: '+8%' },
        { name: 'Database Management', score: 65, trend: '+7%' },
        { name: 'Data Analytics', score: 45, trend: '+12%' }
    ];

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Avg Competency</span>
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="text-3xl font-bold text-gray-900">75%</div>
                        <div className="text-sm text-green-600 font-medium mb-1">+5% from last month</div>
                    </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Learning Hours</span>
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">24</div>
                    <div className="text-sm text-gray-600">This month</div>
                </div>

                <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Trainings</span>
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">5</div>
                    <div className="text-sm text-gray-600">Completed</div>
                </div>

                <div className="bg-orange-50 rounded-lg p-6 border border-orange-100">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Skill Growth</span>
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="text-3xl font-bold text-gray-900">+12%</div>
                        <div className="text-sm text-gray-600 mb-1">This quarter</div>
                    </div>
                </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center justify-end gap-2">
                {['week', 'month', 'quarter', 'year'].map((range) => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${timeRange === range
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        {range}
                    </button>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Competency Levels by Skill */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Competency Levels by Skill</h3>

                    <div className="space-y-4">
                        {competencyData.map((item, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">{item.skill}</span>
                                    <span className="text-sm font-semibold text-gray-900">{item.level}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-10">
                                    <div
                                        className={`h-10 rounded-full transition-all duration-500 flex items-center justify-end pr-3 ${item.level >= 80
                                                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                                                : item.level >= 60
                                                    ? 'bg-gradient-to-r from-indigo-400 to-indigo-500'
                                                    : item.level >= 40
                                                        ? 'bg-gradient-to-r from-purple-400 to-purple-500'
                                                        : 'bg-gradient-to-r from-indigo-300 to-indigo-400'
                                            }`}
                                        style={{ width: `${item.level}%` }}
                                    >
                                        {item.level > 15 && <span className="text-xs font-semibold text-white">{item.level}%</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Learning Progress Over Time */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Progress Over Time</h3>

                    <div className="relative h-64">
                        {/* Simple Line Chart Visualization */}
                        <svg className="w-full h-full" viewBox="0 0 400 200">
                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4].map((i) => (
                                <line
                                    key={i}
                                    x1="0"
                                    y1={i * 50}
                                    x2="400"
                                    y2={i * 50}
                                    stroke="#e5e7eb"
                                    strokeWidth="1"
                                />
                            ))}

                            {/* Completed line */}
                            <polyline
                                points="0,180 100,160 200,120 300,80 400,50"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* In Progress line */}
                            <polyline
                                points="0,150 100,140 200,110 300,90 400,70"
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Points */}
                            {[[0, 180], [100, 160], [200, 120], [300, 80], [400, 50]].map((point, i) => (
                                <circle key={`c${i}`} cx={point[0]} cy={point[1]} r="4" fill="#10b981" />
                            ))}
                            {[[0, 150], [100, 140], [200, 110], [300, 90], [400, 70]].map((point, i) => (
                                <circle key={`p${i}`} cx={point[0]} cy={point[1]} r="4" fill="#6366f1" />
                            ))}
                        </svg>

                        {/* X-axis labels */}
                        <div className="flex justify-between mt-2 text-xs text-gray-600">
                            <span>Jul</span>
                            <span>Aug</span>
                            <span>Sep</span>
                            <span>Oct</span>
                            <span>Nov</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-600">Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                            <span className="text-sm text-gray-600">In Progress</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Training Distribution */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Training Distribution</h3>

                    <div className="flex items-center justify-center h-64">
                        {/* Simple Pie Chart */}
                        <svg className="w-48 h-48" viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" strokeWidth="40" strokeDasharray="157 314" transform="rotate(-90 100 100)" />
                            <circle cx="100" cy="100" r="80" fill="none" stroke="#6366f1" strokeWidth="40" strokeDasharray="94 314" strokeDashoffset="-157" transform="rotate(-90 100 100)" />
                            <circle cx="100" cy="100" r="80" fill="none" stroke="#f59e0b" strokeWidth="40" strokeDasharray="63 314" strokeDashoffset="-251" transform="rotate(-90 100 100)" />
                        </svg>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                        {[
                            { label: 'Technical', count: 5, color: 'bg-green-500', percentage: '50%' },
                            { label: 'Soft Skills', count: 3, color: 'bg-indigo-600', percentage: '30%' },
                            { label: 'Management', count: 2, color: 'bg-orange-500', percentage: '20%' }
                        ].map((item, i) => (
                            <div key={i} className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                    <span className="text-sm font-medium text-gray-900">{item.percentage}</span>
                                </div>
                                <div className="text-xs text-gray-600">{item.label}</div>
                                <div className="text-xs text-gray-500">{item.count} trainings</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Skills This Month */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Skills This Month</h3>

                    <div className="space-y-4">
                        {topSkills.map((skill, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 mb-1">{skill.name}</div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${skill.score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-4 flex flex-col items-end">
                                    <span className="text-lg font-bold text-gray-900">{skill.score}%</span>
                                    <span className="text-xs text-green-600 font-medium">{skill.trend}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}