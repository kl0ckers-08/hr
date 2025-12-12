"use client";

import React from 'react';
import { Users, BookOpen, Calendar, Clock } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className=" max-h-screen overflow-y-scroll space-y-6">
            <div className='p-6'>
                <h1 className="text-3xl font-bold text-gray-800">Welcome back, Jane</h1>
                <p className="text-gray-600 mt-1">Here's your development overview</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 ">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-sm text-purple-700 font-medium">Competency Level</p>
                            <p className="text-3xl font-bold text-purple-900 mt-1">75%</p>
                        </div>
                        <Users className="text-purple-600" size={24} />
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2 mt-4">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-sm text-pink-700 font-medium">Learning Progress</p>
                            <p className="text-3xl font-bold text-pink-900 mt-1">12/20</p>
                        </div>
                        <BookOpen className="text-pink-600" size={24} />
                    </div>
                    <div className="w-full bg-pink-200 rounded-full h-2 mt-4">
                        <div className="bg-pink-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-amber-700 font-medium">Upcoming Trainings</p>
                            <p className="text-3xl font-bold text-amber-900 mt-1">2</p>
                            <p className="text-xs text-amber-600 mt-1">Events Scheduled</p>
                        </div>
                        <Calendar className="text-amber-600" size={24} />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Pending Assessments</p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">1</p>
                            <p className="text-xs text-blue-600 mt-1">Action Required</p>
                        </div>
                        <Clock className="text-blue-600" size={24} />
                    </div>
                </div>
            </div>

            {/* Recent Activity & Upcoming Training */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                    <p className="text-sm text-gray-600 mb-4">Your latest learning and development activities</p>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-800">Completed AI Fundamentals Assessment</p>
                                <p className="text-sm text-gray-500">2025-11-13</p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Completed</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-800">Started Advanced Data Analytics Module</p>
                                <p className="text-sm text-gray-500">2025-11-12</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">In Progress</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-800">Registered for Teaching Excellence Workshop</p>
                                <p className="text-sm text-gray-500">2025-11-08</p>
                            </div>
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">Upcoming</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Upcoming Training</h3>
                            <p className="text-sm text-gray-600">Scheduled workshops and seminars</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="font-medium text-gray-800">Teaching Excellence Workshop</p>
                            <p className="text-sm text-gray-600">Room 301</p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                <Calendar size={16} />
                                <span>15/20</span>
                            </div>
                        </div>
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="font-medium text-gray-800">AI in Education Seminar</p>
                            <p className="text-sm text-gray-600">Auditorium</p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                <Calendar size={16} />
                                <span>15/20</span>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        View All Training
                    </button>
                </div>
            </div>

            {/* Jump Actions */}
            <div className="bg-white p-6 mx-6 rounded-xl border border-gray-200 ">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Jump Actions</h3>
                <p className="text-sm text-gray-600 mb-4">Jump to important tasks</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors">
                        <Users className="mx-auto mb-2 text-gray-600" size={24} />
                        <span className="text-sm font-medium text-gray-800">Start Assessment</span>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors">
                        <BookOpen className="mx-auto mb-2 text-gray-600" size={24} />
                        <span className="text-sm font-medium text-gray-800">Browse Courses</span>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors">
                        <Calendar className="mx-auto mb-2 text-gray-600" size={24} />
                        <span className="text-sm font-medium text-gray-800">Schedule Training</span>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors">
                        <Users className="mx-auto mb-2 text-gray-600" size={24} />
                        <span className="text-sm font-medium text-gray-800">Request Document</span>
                    </button>
                </div>
            </div>
        </div>
    );
}