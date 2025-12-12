'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Search } from 'lucide-react';

interface TrainingProgram {
    _id: string;
    title: string;
    type: string;
    description?: string;
    date: string;
    time?: string;
    location?: string;
    maxParticipants: number;
    registrations: string[];
    attendees: string[];
    status: string;
    facilitator?: string;
    rating?: number;
}

interface Stats {
    upcoming: number;
    registered: number;
    completed: number;
}

export default function TrainingPage() {
    const [trainings, setTrainings] = useState<TrainingProgram[]>([]);
    const [myRegistrations, setMyRegistrations] = useState<string[]>([]);
    const [stats, setStats] = useState<Stats>({ upcoming: 0, registered: 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'registered' | 'completed'>('upcoming');
    const [searchQuery, setSearchQuery] = useState('');
    const [registering, setRegistering] = useState<string | null>(null);

    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = async () => {
        try {
            const res = await fetch('/hr2/api/employee/training');
            if (res.ok) {
                const data = await res.json();
                setTrainings(data.trainings || []);
                setMyRegistrations(data.myRegistrations || []);
                setStats(data.stats || stats);
            }
        } catch (error) {
            console.error('Error fetching trainings:', error);
        } finally {
            setLoading(false);
        }
    };

    const registerForTraining = async (trainingId: string) => {
        setRegistering(trainingId);
        try {
            const res = await fetch('/hr2/api/employee/training', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trainingId }),
            });
            if (res.ok) {
                alert('Successfully registered for training!');
                fetchTrainings();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to register');
            }
        } catch (error) {
            console.error('Error registering:', error);
            alert('Failed to register for training');
        } finally {
            setRegistering(null);
        }
    };

    const isRegistered = (trainingId: string) => myRegistrations.includes(trainingId);

    const filteredTrainings = trainings.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.description?.toLowerCase().includes(searchQuery.toLowerCase()));
        
        if (activeTab === 'upcoming') {
            return matchesSearch && t.status === 'Upcoming' && !isRegistered(t._id);
        }
        if (activeTab === 'registered') {
            return matchesSearch && isRegistered(t._id) && t.status !== 'Completed';
        }
        if (activeTab === 'completed') {
            return matchesSearch && isRegistered(t._id) && t.status === 'Completed';
        }
        return matchesSearch;
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div>
                <p className="text-gray-600">Training Schedule with registration and evaluation</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Upcoming Trainings</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
                            <p className="text-xs text-gray-500 mt-1">Available to Register</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Registered</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.registered}</p>
                            <p className="text-xs text-gray-500 mt-1">Trainings Scheduled</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Completed</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                            <p className="text-xs text-gray-500 mt-1">Trainings Attended</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'upcoming' 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    Upcoming Trainings
                </button>
                <button
                    onClick={() => setActiveTab('registered')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'registered' 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    My Registered Trainings
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'completed' 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    My Completed Trainings
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search trainings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                />
            </div>

            {/* Available Training Programs */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                    {activeTab === 'upcoming' && 'Available Training Programs'}
                    {activeTab === 'registered' && 'My Registered Trainings'}
                    {activeTab === 'completed' && 'My Completed Trainings'}
                </h2>

                <div className="space-y-4">
                    {filteredTrainings.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">No trainings found</p>
                            <p className="text-gray-500 text-sm mt-1">
                                {activeTab === 'upcoming' && 'Check back later for new training programs'}
                                {activeTab === 'registered' && 'You haven\'t registered for any trainings yet'}
                                {activeTab === 'completed' && 'You haven\'t completed any trainings yet'}
                            </p>
                        </div>
                    ) : (
                        filteredTrainings.map((training) => (
                            <div 
                                key={training._id} 
                                className="bg-white rounded-lg border border-gray-200 p-6 hover:border-indigo-300 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{training.title}</h3>
                                        {training.description && (
                                            <p className="text-sm text-gray-600 mb-4">{training.description}</p>
                                        )}
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="w-4 h-4 text-red-500" />
                                                    <span className="text-gray-700">{formatDate(training.date)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Users className="w-4 h-4 text-blue-500" />
                                                    <span className="text-gray-700">
                                                        {training.registrations?.length || 0}/{training.maxParticipants} slots available
                                                    </span>
                                                </div>
                                                {training.time && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="w-4 h-4 text-gray-500" />
                                                        <span className="text-gray-700">Time: {training.time}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                {training.location && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin className="w-4 h-4 text-purple-500" />
                                                        <span className="text-gray-700">{training.location}</span>
                                                    </div>
                                                )}
                                                {training.facilitator && (
                                                    <div className="text-sm text-gray-700">
                                                        Facilitator: {training.facilitator}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ml-4">
                                        {activeTab === 'upcoming' && !isRegistered(training._id) && (
                                            <button
                                                onClick={() => registerForTraining(training._id)}
                                                disabled={registering === training._id || (training.registrations?.length || 0) >= training.maxParticipants}
                                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {registering === training._id ? 'Registering...' : 'Register'}
                                            </button>
                                        )}
                                        {isRegistered(training._id) && training.status !== 'Completed' && (
                                            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                                Registered
                                            </span>
                                        )}
                                        {training.status === 'Completed' && training.rating && (
                                            <div className="flex items-center gap-1 text-amber-500">
                                                <span>⭐</span>
                                                <span className="font-bold">{training.rating}/5</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
