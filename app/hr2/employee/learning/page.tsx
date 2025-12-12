"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, Search, Plus, Eye, Edit, Trash2, X, Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface Topic {
    title: string;
    content: string;
    order: number;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface Module {
    _id: string;
    title: string;
    description: string;
    category: string;
    numberOfTopics: number;
    duration: string;
    topics: Topic[];
    quizQuestions: QuizQuestion[];
    fileName?: string;
    filePath?: string;
    userProgress?: {
        status: string;
        progress: number;
        quizScore?: number;
        completedTopics?: string[];
    };
}

interface Stats {
    totalModules: number;
    completed: number;
    inProgress: number;
    notStarted: number;
}

export default function LearningPage() {
    const [modules, setModules] = useState<Module[]>([]);
    const [stats, setStats] = useState<Stats>({ totalModules: 0, completed: 0, inProgress: 0, notStarted: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Modules');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', category: 'Technical', numberOfTopics: 8 });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchModules(); }, []);

    const fetchModules = async () => {
        try {
            const res = await fetch('/hr2/api/employee/learning');
            if (res.ok) {
                const data = await res.json();
                setModules(data.modules || []);
                setStats(data.stats || stats);
            }
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    const startModule = async (moduleId: string) => {
        try {
            await fetch('/hr2/api/employee/learning', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ moduleId, progress: 10, status: 'In Progress' }),
            });
            fetchModules();
        } catch (error) { console.error('Error:', error); }
    };

    const updateProgress = async (moduleId: string, progress: number, status?: string, quizScore?: number) => {
        try {
            await fetch('/hr2/api/employee/learning', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ moduleId, progress, status, quizScore }),
            });
            fetchModules();
        } catch (error) { console.error('Error:', error); }
    };

    const openModuleDetails = (module: Module) => { setSelectedModule(module); setShowDetailsModal(true); };
    const openTopicContent = (module: Module, topicIndex: number) => { setSelectedModule(module); setCurrentTopicIndex(topicIndex); setShowTopicModal(true); };
    const openQuiz = (module: Module) => {
        setSelectedModule(module);
        setCurrentQuestionIndex(0);
        setSelectedAnswers(new Array(module.quizQuestions?.length || 5).fill(null));
        setQuizSubmitted(false);
        setShowQuizModal(true);
    };

    const handleQuizAnswer = (answerIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestionIndex] = answerIndex;
        setSelectedAnswers(newAnswers);
    };

    const submitQuiz = async () => {
        if (!selectedModule) return;
        const questions = selectedModule.quizQuestions || [];
        let correct = 0;
        questions.forEach((q, i) => { if (selectedAnswers[i] === q.correctAnswer) correct++; });
        const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 93;
        await updateProgress(selectedModule._id, 100, 'Completed', score);
        setQuizSubmitted(true);
        setTimeout(() => { setShowQuizModal(false); fetchModules(); }, 2000);
    };

    const handleCreateModule = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const form = new FormData();
            form.append('title', formData.title);
            form.append('description', formData.description);
            form.append('category', formData.category);
            form.append('numberOfTopics', formData.numberOfTopics.toString());
            const res = await fetch('/hr2/api/admin/module', { method: 'POST', body: form });
            if (res.ok) { setShowCreateModal(false); setFormData({ title: '', description: '', category: 'Technical', numberOfTopics: 8 }); fetchModules(); }
        } catch (error) { console.error('Error:', error); }
        finally { setSaving(false); }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm('Delete this module?')) return;
        try { await fetch(`/hr2/api/admin/module/${moduleId}`, { method: 'DELETE' }); fetchModules(); }
        catch (error) { console.error('Error:', error); }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'Completed') return 'text-green-600';
        if (status === 'In Progress') return 'text-blue-600';
        return 'text-purple-600';
    };

    const getStatusText = (status: string) => status === 'Not Started' ? 'Available' : status;

    const filteredModules = modules.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All Modules' || m.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Create Module Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-white/30">
                    <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Create New Module</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateModule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Module Title</label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" placeholder="Enter module title" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" rows={3} placeholder="Enter description" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Topics</label>
                                    <input type="number" value={formData.numberOfTopics} onChange={(e) => setFormData({ ...formData, numberOfTopics: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" min="1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                                        <option>Technical</option><option>Pedagogy</option><option>Leadership</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg disabled:opacity-50">{saving ? 'Creating...' : 'Create Module'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Module Details Modal */}
            {showDetailsModal && selectedModule && (
                <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-white/30">
                    <div className="bg-white rounded-xl p-8 w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-semibold text-gray-900">Module Details</h2>
                            <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{selectedModule.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{selectedModule.description}</p>
                        
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center gap-1 text-purple-600 mb-1"><BookOpen size={14} /><span className="text-xs">Topics</span></div>
                                <p className="text-xl font-bold text-gray-900">{selectedModule.numberOfTopics}</p>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center gap-1 text-blue-600 mb-1"><Clock size={14} /><span className="text-xs">Duration</span></div>
                                <p className="text-xl font-bold text-gray-900">{selectedModule.duration || '4h'}</p>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center gap-1 text-pink-600 mb-1"><CheckCircle size={14} /><span className="text-xs">Category</span></div>
                                <p className="text-sm font-bold text-gray-900">{selectedModule.category}</p>
                            </div>
                        </div>

                        <h4 className="font-semibold text-gray-900 mb-3">Module Content</h4>
                        <div className="space-y-2 mb-4">
                            {Array.from({ length: Math.min(selectedModule.numberOfTopics, 5) }, (_, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                    onClick={() => { setShowDetailsModal(false); openTopicContent(selectedModule, i); }}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                        i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : i === 2 ? 'bg-yellow-500' : i === 3 ? 'bg-green-500' : 'bg-teal-500'
                                    }`}>{i + 1}</div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Topic {i + 1}</p>
                                        <p className="text-xs text-gray-500">{selectedModule.topics?.[i]?.title || ['Introduction and Fundamentals', 'Core Concepts', 'Advanced Techniques', 'Practical Applications', 'Summary'][i] || `Topic ${i + 1}`}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowDetailsModal(false)} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Close</button>
                    </div>
                </div>
            )}

            {/* Topic Content Modal */}
            {showTopicModal && selectedModule && (
                <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-white/30">
                    <div className="bg-white rounded-xl p-8 w-full max-w-xl shadow-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <BookOpen size={18} className="text-indigo-600" />
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">{selectedModule.title}</h2>
                                    <p className="text-xs text-gray-500">Topic {currentTopicIndex + 1} of {selectedModule.numberOfTopics}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowTopicModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-5">
                            <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${((currentTopicIndex + 1) / selectedModule.numberOfTopics) * 100}%` }}></div>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 mb-2">
                            {selectedModule.topics?.[currentTopicIndex]?.title || `Data Analytics Overview`}
                        </h3>
                        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                            {selectedModule.topics?.[currentTopicIndex]?.content || 
                                `Data analytics is the science of analyzing raw data to make conclusions about information. It involves applying an algorithmic or mechanical process to derive insights and running through several data sets to search for meaningful correlations.`}
                        </p>

                        {currentTopicIndex === selectedModule.numberOfTopics - 1 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5">
                                <h4 className="font-bold text-gray-900 mb-1">Ready to Test Your Knowledge?</h4>
                                <p className="text-xs text-gray-600 mb-3">You've completed all topics in this module. Take the quiz to assess your understanding.</p>
                                <button onClick={() => { setShowTopicModal(false); openQuiz(selectedModule); }}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Take Quiz</button>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <button onClick={() => setCurrentTopicIndex(Math.max(0, currentTopicIndex - 1))} disabled={currentTopicIndex === 0}
                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40">
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <span className="text-xs text-gray-500">Page {currentTopicIndex + 1} of {selectedModule.numberOfTopics}</span>
                            {currentTopicIndex < selectedModule.numberOfTopics - 1 ? (
                                <button onClick={() => setCurrentTopicIndex(currentTopicIndex + 1)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                                    Next <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button onClick={() => setShowTopicModal(false)} className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700">Close</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quiz Modal */}
            {showQuizModal && selectedModule && (
                <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-white/30">
                    <div className="bg-white rounded-xl p-8 w-full max-w-xl shadow-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">{selectedModule.title} - Quiz</h2>
                                <p className="text-xs text-gray-500">Question {currentQuestionIndex + 1} of {selectedModule.quizQuestions?.length || 5}</p>
                            </div>
                            <button onClick={() => setShowQuizModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>

                        <div className="flex gap-1 mb-5">
                            {Array.from({ length: selectedModule.quizQuestions?.length || 5 }).map((_, i) => (
                                <div key={i} className={`flex-1 h-1.5 rounded-full ${
                                    selectedAnswers[i] !== null ? 'bg-red-500' : i === currentQuestionIndex ? 'bg-orange-400' : 'bg-gray-200'
                                }`}></div>
                            ))}
                        </div>

                        {quizSubmitted ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Quiz Completed!</h3>
                                <p className="text-sm text-gray-600">Your results have been saved.</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-sm font-medium text-gray-900 mb-4">
                                    {selectedModule.quizQuestions?.[currentQuestionIndex]?.question || `What is the main objective of this learning module?`}
                                </h3>
                                <div className="space-y-2 mb-5">
                                    {(selectedModule.quizQuestions?.[currentQuestionIndex]?.options || [
                                        'To understand fundamental concepts', 'To memorize all facts', 'To complete assignments quickly', 'To skip theoretical knowledge'
                                    ]).map((option, index) => (
                                        <button key={index} onClick={() => handleQuizAnswer(index)}
                                            className={`w-full p-3 text-left rounded-lg border text-sm transition-colors ${
                                                selectedAnswers[currentQuestionIndex] === index ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    selectedAnswers[currentQuestionIndex] === index ? 'border-indigo-500' : 'border-gray-300'
                                                }`}>
                                                    {selectedAnswers[currentQuestionIndex] === index && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
                                                </div>
                                                <span className="text-gray-700">{option}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                    <button onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))} disabled={currentQuestionIndex === 0}
                                        className="text-sm text-gray-600 disabled:opacity-40">Previous</button>
                                    <span className="text-xs text-gray-500">{selectedAnswers.filter(a => a !== null).length} of {selectedModule.quizQuestions?.length || 5} answered</span>
                                    {currentQuestionIndex < (selectedModule.quizQuestions?.length || 5) - 1 ? (
                                        <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm">Next</button>
                                    ) : (
                                        <button onClick={submitQuiz} disabled={selectedAnswers.some(a => a === null)} className="px-4 py-1.5 bg-green-600 text-white rounded text-sm disabled:opacity-50">Submit Quiz</button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Stats Cards - Matching Figma exactly */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Total Modules</p>
                            <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalModules}</p>
                            <p className="text-xs text-purple-500 mt-1">Available Courses</p>
                        </div>
                        <BookOpen className="text-gray-400" size={22} />
                    </div>
                </div>
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Completed</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
                            <p className="text-xs text-green-500 mt-1">Modules Finished</p>
                        </div>
                        <CheckCircle className="text-gray-400" size={22} />
                    </div>
                </div>
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">In Progress</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
                            <p className="text-xs text-blue-500 mt-1">Currently Learning</p>
                        </div>
                        <Clock className="text-gray-400" size={22} />
                    </div>
                </div>
            </div>

            {/* Search Bar and Filters - Matching Figma */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Search learning modules..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-indigo-500" />
                </div>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-indigo-500">
                    <option>All Modules</option><option>Technical</option><option>Pedagogy</option><option>Leadership</option>
                </select>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                    <Plus size={18} /> Create Module
                </button>
            </div>

            {/* Learning Modules Section */}
            <div>
                <h3 className="text-base font-bold text-gray-900 mb-4">Learning Modules</h3>
                {filteredModules.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No modules found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredModules.map((module) => {
                            const status = module.userProgress?.status || 'Not Started';
                            const progress = module.userProgress?.progress || 0;
                            const quizScore = module.userProgress?.quizScore;

                            return (
                                <div key={module._id} className="bg-white border border-gray-200 rounded-lg p-5">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-base font-bold text-gray-900">{module.title}</h4>
                                        <span className={`text-xs font-medium ${getStatusBadge(status)}`}>{getStatusText(status)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                                    
                                    {/* Meta info */}
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                        <span>{module.numberOfTopics} topics</span>
                                        <span>•</span>
                                        <span>{module.duration || '4 hours'}</span>
                                        <span>•</span>
                                        <span>{module.category}</span>
                                    </div>

                                    {/* Quiz Score for Completed */}
                                    {status === 'Completed' && quizScore !== undefined && (
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle className="text-green-500" size={14} />
                                            <span className="text-xs font-medium text-green-600">Quiz Score: {quizScore}%</span>
                                        </div>
                                    )}

                                    {/* Progress bar for In Progress */}
                                    {status === 'In Progress' && (
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500">Progress</span>
                                                <span className="font-medium text-blue-600">{progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons - Matching Figma layout */}
                                    {status === 'Completed' ? (
                                        <>
                                            <button onClick={() => openQuiz(module)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 mb-2">
                                                Retake Quiz
                                            </button>
                                            <div className="flex gap-2">
                                                <button onClick={() => openModuleDetails(module)} className="flex-1 p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"><Eye size={16} className="mx-auto" /></button>
                                                <button className="flex-1 p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"><Edit size={16} className="mx-auto" /></button>
                                                <button onClick={() => handleDeleteModule(module._id)} className="flex-1 p-2 border border-gray-200 rounded-lg text-red-400 hover:bg-red-50"><Trash2 size={16} className="mx-auto" /></button>
                                            </div>
                                        </>
                                    ) : status === 'In Progress' ? (
                                        <>
                                            <button onClick={() => openTopicContent(module, Math.floor(progress / (100 / module.numberOfTopics)))}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 mb-2">
                                                <Play size={16} /> Continue Learning
                                            </button>
                                            <div className="flex gap-2">
                                                <button onClick={() => openModuleDetails(module)} className="flex-1 p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"><Eye size={16} className="mx-auto" /></button>
                                                <button className="flex-1 p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"><Edit size={16} className="mx-auto" /></button>
                                                <button onClick={() => handleDeleteModule(module._id)} className="flex-1 p-2 border border-gray-200 rounded-lg text-red-400 hover:bg-red-50"><Trash2 size={16} className="mx-auto" /></button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { startModule(module._id); openTopicContent(module, 0); }}
                                                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 mb-2">
                                                Start Module
                                            </button>
                                            <div className="flex gap-2">
                                                <button onClick={() => openModuleDetails(module)} className="flex-1 p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"><Eye size={16} className="mx-auto" /></button>
                                                <button className="flex-1 p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"><Edit size={16} className="mx-auto" /></button>
                                                <button onClick={() => handleDeleteModule(module._id)} className="flex-1 p-2 border border-gray-200 rounded-lg text-red-400 hover:bg-red-50"><Trash2 size={16} className="mx-auto" /></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
