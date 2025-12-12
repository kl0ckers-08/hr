'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../modal';

interface DashboardStats {
    training: { total: number; completed: number; inProgress: number };
    learning: { totalModules: number; completed: number; inProgress: number };
    competency: { totalSkills: number; assessed: number; averageScore: number };
    ess: { total: number; pending: number; approved: number };
}

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [trainings, setTrainings] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const [dashRes, assessRes, moduleRes, trainingRes] = await Promise.all([
                fetch('/hr2/api/employee/dashboard'),
                fetch('/hr2/api/employee/assessments'),
                fetch('/hr2/api/employee/learning'),
                fetch('/hr2/api/admin/training'),
            ]);
            if (dashRes.ok) {
                const data = await dashRes.json();
                setStats(data.stats);
            }
            if (assessRes.ok) {
                const data = await assessRes.json();
                setAssessments(data.assessments?.filter((a: any) => !a.completed)?.slice(0, 4) || []);
            }
            if (moduleRes.ok) {
                const data = await moduleRes.json();
                setModules(data.modules?.slice(0, 4) || []);
            }
            if (trainingRes.ok) {
                const data = await trainingRes.json();
                setTrainings(data.trainings?.filter((t: any) => t.status === 'Upcoming')?.slice(0, 3) || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigateTo = (path: string) => {
        router.push(path);
        setSelectedAction(null);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="space-y-6 p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                    <p className="text-sm font-semibold text-purple-800 mb-1">Competency Level</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.competency.averageScore || 0}%</p>
                    <div className="w-full bg-purple-200 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${stats?.competency.averageScore || 0}%` }}></div>
                    </div>
                </div>
                <div className="bg-pink-50 rounded-lg p-6 border border-pink-100">
                    <p className="text-sm font-semibold text-pink-800 mb-1">Learning Progress</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.learning.completed || 0}/{stats?.learning.totalModules || 0}</p>
                    <div className="w-full bg-pink-200 rounded-full h-2.5">
                        <div className="bg-pink-600 h-2.5 rounded-full" style={{ width: `${stats?.learning.totalModules ? (stats.learning.completed / stats.learning.totalModules) * 100 : 0}%` }}></div>
                    </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-100">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">Upcoming Trainings</p>
                    <p className="text-3xl font-bold text-gray-900">{trainings.length}</p>
                    <p className="text-sm font-medium text-gray-700">Events Scheduled</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                    <p className="text-sm font-semibold text-blue-800 mb-1">Pending Assessments</p>
                    <p className="text-3xl font-bold text-gray-900">{assessments.length}</p>
                    <p className="text-sm font-medium text-gray-700">Action Required</p>
                </div>
            </div>

            {/* Recent Activity & Upcoming Training */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6 border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {stats?.learning.completed ? <div className="p-4 bg-gray-50 rounded-lg"><p className="font-semibold text-gray-900">Completed {stats.learning.completed} learning modules</p><p className="text-sm text-gray-700">Learning Progress</p></div> : null}
                        {stats?.competency.assessed ? <div className="p-4 bg-gray-50 rounded-lg"><p className="font-semibold text-gray-900">Assessed {stats.competency.assessed} skills</p><p className="text-sm text-gray-700">Competency Assessment</p></div> : null}
                        {stats?.ess.total ? <div className="p-4 bg-gray-50 rounded-lg"><p className="font-semibold text-gray-900">{stats.ess.approved} ESS requests approved</p><p className="text-sm text-gray-700">Employee Self-Service</p></div> : null}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Training</h3>
                    <div className="space-y-4">
                        {trainings.length === 0 ? (
                            <p className="text-gray-600 text-center py-4">No upcoming trainings</p>
                        ) : (
                            trainings.map((t, i) => (
                                <div key={i} className="border rounded-lg p-4">
                                    <p className="font-semibold text-gray-900">{t.title}</p>
                                    <p className="text-sm text-gray-700">{t.location} • {new Date(t.date).toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <button onClick={() => navigateTo('/hr2/employee/training')} className="w-full mt-4 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">View All Training</button>
                </div>
            </div>

            {/* Jump Actions */}
            <div className="bg-white rounded-lg shadow p-6 border">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { id: 'assessment', label: 'Start Assessment', path: '/hr2/employee/competency' },
                        { id: 'courses', label: 'Browse Courses', path: '/hr2/employee/learning' },
                        { id: 'training', label: 'Schedule Training', path: '/hr2/employee/training' },
                        { id: 'document', label: 'Request Document', path: '/hr2/employee/employee-ess' },
                    ].map((action) => (
                        <button key={action.id} onClick={() => setSelectedAction(action.id)} className="p-6 border-2 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 text-center group">
                            <div className="w-10 h-10 mx-auto mb-3 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xl group-hover:scale-110 transition-transform">
                                {action.id === 'assessment' && '📝'}
                                {action.id === 'courses' && '📚'}
                                {action.id === 'training' && '📅'}
                                {action.id === 'document' && '📄'}
                            </div>
                            <div className="font-bold text-gray-900">{action.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={selectedAction === 'assessment'} onClose={() => setSelectedAction(null)} title="Start Assessment" size="md">
                <div className="space-y-3">
                    <p className="text-gray-600 mb-4">Select an assessment to begin:</p>
                    {assessments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">All assessments completed!</p>
                    ) : (
                        assessments.map((a, i) => (
                            <button key={i} onClick={() => navigateTo('/hr2/employee/competency')} className="w-full p-4 text-left border rounded-lg hover:border-indigo-600 hover:bg-indigo-50">
                                <div className="font-semibold">{a.skillName}</div>
                                <div className="text-sm text-gray-600">{a.category} • {a.questions?.length || 0} questions</div>
                            </button>
                        ))
                    )}
                </div>
            </Modal>

            <Modal isOpen={selectedAction === 'courses'} onClose={() => setSelectedAction(null)} title="Browse Learning Courses" size="lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules.map((m, i) => (
                        <div key={i} className="border rounded-lg p-4">
                            <div className="font-semibold mb-2">{m.title}</div>
                            <div className="text-sm text-gray-600 mb-4">{m.numberOfTopics} topics • {m.category}</div>
                            <button onClick={() => navigateTo('/hr2/employee/learning')} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                {m.userProgress?.status === 'Completed' ? 'Review' : m.userProgress?.status === 'In Progress' ? 'Continue' : 'Start'}
                            </button>
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal isOpen={selectedAction === 'training'} onClose={() => setSelectedAction(null)} title="Available Training Programs" size="lg">
                <div className="space-y-4">
                    {trainings.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No upcoming trainings available</p>
                    ) : (
                        trainings.map((t, i) => (
                            <div key={i} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-semibold">{t.title}</div>
                                        <div className="text-sm text-gray-600 mt-1">{t.description}</div>
                                        <div className="flex gap-4 text-sm text-gray-600 mt-2">
                                            <span>📅 {new Date(t.date).toLocaleDateString()}</span>
                                            <span>📍 {t.location}</span>
                                            <span>👥 {t.registrations?.length || 0}/{t.maxParticipants}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => navigateTo('/hr2/employee/training')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">Register</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>

            <Modal isOpen={selectedAction === 'document'} onClose={() => setSelectedAction(null)} title="Request Document" size="md">
                <div className="grid grid-cols-2 gap-4">
                    {['Certificate of Employment', 'Training Certificate', 'Leave Request', 'Other Documents'].map((doc, i) => (
                        <button key={i} onClick={() => navigateTo('/hr2/employee/employee-ess')} className="p-5 border rounded-lg hover:border-indigo-600 hover:bg-indigo-50 text-center">
                            <div className="text-2xl mb-2">📄</div>
                            <div className="font-medium">{doc}</div>
                        </button>
                    ))}
                </div>
            </Modal>
        </div>
    );
}
