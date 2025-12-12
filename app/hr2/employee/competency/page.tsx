'use client';

import { useState, useEffect } from 'react';

interface Question {
    _id: string;
    question: string;
    options: string[];
}

interface Assessment {
    _id: string;
    skillName: string;
    category: string;
    description?: string;
    questions: Question[];
    passingScore: number;
    duration: number;
    completed?: boolean;
    lastScore?: number;
    passed?: boolean;
}

interface Competency {
    _id: string;
    skillName: string;
    category: string;
    level?: string;
    score?: number;
    assessedAt?: string;
}

export default function CompetencyPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [filter, setFilter] = useState('all');
    const [competencies, setCompetencies] = useState<Competency[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [showAssessmentModal, setShowAssessmentModal] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [stats, setStats] = useState({ totalSkills: 0, assessedSkills: 0, averageScore: 0, needsImprovement: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [compRes, assessRes] = await Promise.all([
                fetch('/hr2/api/employee/competency'),
                fetch('/hr2/api/employee/assessments')
            ]);
            
            if (compRes.ok) {
                const compData = await compRes.json();
                setCompetencies(compData.competencies || []);
                setStats(compData.stats || stats);
            }
            
            if (assessRes.ok) {
                const assessData = await assessRes.json();
                setAssessments(assessData.assessments || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const startAssessment = async (assessment: Assessment) => {
        try {
            const res = await fetch(`/hr2/api/employee/assessments/${assessment._id}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedAssessment(data.assessment);
                setCurrentQuestion(0);
                setAnswers({});
                setResult(null);
                setShowAssessmentModal(true);
            }
        } catch (error) {
            console.error('Error starting assessment:', error);
        }
    };

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const submitAssessment = async () => {
        if (!selectedAssessment) return;
        setSubmitting(true);
        try {
            const res = await fetch('/hr2/api/employee/assessments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assessmentId: selectedAssessment._id,
                    answers,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setResult(data.result);
                fetchData();
            }
        } catch (error) {
            console.error('Error submitting assessment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getSkillFromAssessment = (skillName: string) => {
        return competencies.find(c => c.skillName === skillName);
    };

    const filteredAssessments = assessments.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'pending') return !a.completed;
        if (filter === 'completed') return a.completed;
        return true;
    });

    const closeModal = () => {
        setShowAssessmentModal(false);
        setSelectedAssessment(null);
        setResult(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">

            <h1 className='text-4xl text-[#333] font-bold'>Competency Management</h1>
            <p className='text-[#333]'>Track and assess your skills and knowledge</p>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Overall Competency</span>
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stats.averageScore}%</div>
                    <div className="w-full bg-purple-200 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${stats.averageScore}%` }}></div>
                    </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Competent Skills</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.assessedSkills}/{assessments.length}</div>
                    <div className="text-sm text-gray-600">Skills Assessed</div>
                </div>

                <div className="bg-orange-50 rounded-lg p-6 border border-orange-100">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Needs Development</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.needsImprovement}</div>
                    <div className="text-sm text-gray-600">Skills to Improve</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="border-b border-gray-200">
                    <div className="flex gap-1 p-2">
                        {[
                            { id: 'overview', label: 'Skills Overview' },
                            { id: 'assessment', label: 'Take Assessment' },
                            { id: 'results', label: 'Assessment Results' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Your Skills</h3>
                                    <p className="text-sm text-gray-600">Track your competency levels</p>
                                </div>
                                <div className="flex gap-2">
                                    {['all', 'pending', 'completed'].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            {f === 'pending' ? 'Pending Assessment' : f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filteredAssessments.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No assessments available</p>
                                ) : (
                                    filteredAssessments.map((assessment) => {
                                        const skill = getSkillFromAssessment(assessment.skillName);
                                        return (
                                            <div key={assessment._id} className="border border-gray-200 rounded-lg p-5 hover:border-indigo-300 transition-colors">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h4 className="text-lg font-semibold text-gray-900">{assessment.skillName}</h4>
                                                            {skill?.level && (
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${skill.level === 'Advanced' || skill.level === 'Expert' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                    {skill.level}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600">{assessment.category}</p>
                                                        {skill?.assessedAt && (
                                                            <p className="text-xs text-gray-500 mt-1">Last assessed: {new Date(skill.assessedAt).toLocaleDateString()}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => startAssessment(assessment)}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                                                    >
                                                        {skill?.level ? 'Reassess' : 'Assess'}
                                                    </button>
                                                </div>
                                                {skill?.score !== undefined && skill.score > 0 && (
                                                    <div className="mt-4">
                                                        <div className="flex items-center justify-between text-sm mb-2">
                                                            <span className="text-gray-600">Score</span>
                                                            <span className="font-semibold text-gray-900">{skill.score}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div className={`h-2 rounded-full ${skill.score >= 80 ? 'bg-green-600' : 'bg-indigo-600'}`} style={{ width: `${skill.score}%` }}></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'assessment' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Take Assessment</h3>
                            <p className="text-sm text-gray-600 mb-6">Choose a skill to assess your competency level</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {assessments.filter(a => !a.completed).map((assessment) => (
                                    <div key={assessment._id} className="border border-gray-200 rounded-lg p-5 hover:border-indigo-300">
                                        <h4 className="font-semibold text-gray-900 mb-2">{assessment.skillName}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{assessment.category}</p>
                                        <p className="text-xs text-gray-500 mb-4">{assessment.questions?.length || 0} questions • {assessment.duration} min • Pass: {assessment.passingScore}%</p>
                                        <button
                                            onClick={() => startAssessment(assessment)}
                                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            Start Assessment
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {assessments.filter(a => !a.completed).length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-600">All skills have been assessed. Great job!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'results' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment Results</h3>
                            <p className="text-sm text-gray-600 mb-6">View your completed assessments and scores</p>

                            <div className="space-y-4">
                                {competencies.filter(c => c.level).map((comp) => (
                                    <div key={comp._id} className="border border-gray-200 rounded-lg p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{comp.skillName}</h4>
                                                <p className="text-sm text-gray-600">{comp.category}</p>
                                            </div>
                                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${comp.level === 'Advanced' || comp.level === 'Expert' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {comp.level}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-600">Score</span>
                                            <span className="font-semibold text-gray-900">{comp.score}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                            <div className={`h-2 rounded-full ${(comp.score || 0) >= 80 ? 'bg-green-600' : 'bg-indigo-600'}`} style={{ width: `${comp.score}%` }}></div>
                                        </div>
                                        {comp.assessedAt && <p className="text-xs text-gray-500">Assessed on {new Date(comp.assessedAt).toLocaleDateString()}</p>}
                                    </div>
                                ))}
                                {competencies.filter(c => c.level).length === 0 && (
                                    <p className="text-center text-gray-500 py-8">No assessments completed yet</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Assessment Modal */}
            {showAssessmentModal && selectedAssessment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {!result ? (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{selectedAssessment.skillName} Assessment</h2>
                                        <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {selectedAssessment.questions.length}</p>
                                    </div>
                                    <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                                    <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / selectedAssessment.questions.length) * 100}%` }}></div>
                                </div>

                                {/* Question */}
                                <div className="mb-6">
                                    <p className="text-lg font-medium text-gray-900 mb-4">
                                        {selectedAssessment.questions[currentQuestion]?.question}
                                    </p>
                                    <div className="space-y-3">
                                        {selectedAssessment.questions[currentQuestion]?.options.map((option, idx) => (
                                            <label
                                                key={idx}
                                                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${answers[selectedAssessment.questions[currentQuestion]._id] === option
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQuestion}`}
                                                    value={option}
                                                    checked={answers[selectedAssessment.questions[currentQuestion]._id] === option}
                                                    onChange={() => handleAnswer(selectedAssessment.questions[currentQuestion]._id, option)}
                                                    className="sr-only"
                                                />
                                                <span className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${answers[selectedAssessment.questions[currentQuestion]._id] === option
                                                    ? 'border-indigo-600 bg-indigo-600'
                                                    : 'border-gray-300'
                                                }`}>
                                                    {answers[selectedAssessment.questions[currentQuestion]._id] === option && (
                                                        <span className="w-2 h-2 bg-white rounded-full"></span>
                                                    )}
                                                </span>
                                                <span className="text-gray-700">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Navigation */}
                                <div className="flex justify-between">
                                    <button
                                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                        disabled={currentQuestion === 0}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    {currentQuestion < selectedAssessment.questions.length - 1 ? (
                                        <button
                                            onClick={() => setCurrentQuestion(prev => prev + 1)}
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            Next
                                        </button>
                                    ) : (
                                        <button
                                            onClick={submitAssessment}
                                            disabled={submitting || Object.keys(answers).length < selectedAssessment.questions.length}
                                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {submitting ? 'Submitting...' : 'Submit'}
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Results View */
                            <div className="text-center">
                                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {result.passed ? (
                                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    You scored {result.score}% ({result.correctAnswers}/{result.totalQuestions} correct)
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-gray-600">Your competency level:</p>
                                    <p className={`text-xl font-bold ${result.passed ? 'text-green-600' : 'text-orange-600'}`}>{result.level}</p>
                                    <p className="text-xs text-gray-500 mt-1">Passing score: {result.passingScore}%</p>
                                </div>
                                <button onClick={closeModal} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
