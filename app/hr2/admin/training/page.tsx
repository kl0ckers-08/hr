"use client";

import React, { useEffect, useState } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Star,
    Edit2,
    Trash2,
    CheckCircle,
} from "lucide-react";
import axios from "axios";

interface Training {
    _id: string;
    title: string;
    type: "Workshop" | "Seminar" | "Conference" | "Webinar";
    date: string;
    time: string;
    location: string;
    facilitator: string;
    registered: number;
    capacity: number;
    completed?: boolean;
    rating?: number;
}

export default function TrainingPage() {
    const [activeTab, setActiveTab] = useState<
        "overview" | "upcoming" | "completed" | "create"
    >("overview");
    const [trainings, setTrainings] = useState<Training[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        type: "Workshop",
        date: "",
        time: "",
        location: "",
        description: "",
        facilitator: "",
        capacity: 0,
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
    const [loading, setLoading] = useState(false);
    const [showDeleteId, setShowDeleteId] = useState<string | null>(null);


    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await axios.delete(`/hr2/api/admin/trainings?id=${id}`);
            setShowDeleteId(null);
            fetchTrainings();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    // ---------------- OPEN EDIT MODAL -----------------
    const openEditModal = (training: Training) => {
        setSelectedTraining(training);
        setShowEditModal(true);
    };

    // ---------------- SAVE EDIT -----------------
    const saveEdit = async () => {
        if (!selectedTraining) return;

        try {
            setLoading(true);
            await axios.put("/hr2/api/admin/trainings", {
                id: selectedTraining._id,
                ...selectedTraining,
            });

            setShowEditModal(false);
            fetchTrainings();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch trainings from API
    const fetchTrainings = async () => {
        try {
            const res = await axios.get("/hr2/api/admin/trainings");
            setTrainings(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTrainings();
    }, []);

    const handleCreateTraining = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post("/hr2/api/admin/trainings", formData);
            setFormData({
                title: "",
                type: "Workshop",
                date: "",
                time: "",
                location: "",
                description: "",
                facilitator: "",
                capacity: 0,
            });
            fetchTrainings();
            setActiveTab("upcoming");
        } catch (err) {
            console.error(err);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "Workshop":
                return "bg-purple-100 text-purple-700";
            case "Seminar":
                return "bg-blue-100 text-blue-700";
            case "Conference":
                return "bg-green-100 text-green-700";
            case "Webinar":
                return "bg-orange-100 text-orange-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const upcomingTrainings = trainings.filter((t) => !t.completed);
    const completedTrainings = trainings.filter((t) => t.completed);

    // Compute average rating dynamically
    const avgRating =
        trainings.length > 0
            ? (
                trainings.reduce((sum, t) => sum + (t.rating || 0), 0) / trainings.length
            ).toFixed(1)
            : "0.0";



    return (
        <div className="w-full max-h-screen overflow-y-scroll bg-gray-50 p-6">
            <div className="mx-auto ">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Training Management</h1>
                    <p className="text-gray-600 mt-1">
                        Organize and track professional development programs
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                        <Calendar className="w-8 h-8 mb-2 opacity-90" />
                        <p className="text-3xl font-bold">{trainings.length}</p>
                        <p className="text-sm opacity-90">Total Trainings</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                        <Users className="w-8 h-8 mb-2 opacity-90" />
                        <p className="text-3xl font-bold">
                            {trainings.reduce((acc, t) => acc + t.registered, 0)}
                        </p>
                        <p className="text-sm opacity-90">Total Registrations</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                        <CheckCircle className="w-8 h-8 mb-2 opacity-90" />
                        <p className="text-3xl font-bold">{completedTrainings.length}</p>
                        <p className="text-sm opacity-90">Completed</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-xl shadow-lg">
                        <Star className="w-8 h-8 mb-2 opacity-90" />
                        <p className="text-3xl font-bold">{avgRating}</p>
                        <p className="text-sm opacity-90">Avg Rating</p>
                    </div>
                </div>
                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-8 px-6">
                            {(["overview", "upcoming", "completed", "create"] as const).map(
                                (tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-4 px-1 text-sm font-medium capitalize border-b-2 transition-all ${activeTab === tab
                                            ? "border-indigo-600 text-indigo-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        {tab === "create" ? "Create Training" : tab}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    <div className="p-6">

                        {/* Overview Tab */}
                        {/* Overview Tab */}
                        {activeTab === "overview" && (
                            <div className="space-y-8">
                                {/* Main Overview Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                    {/* Upcoming Trainings */}
                                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-purple-900 mb-4">
                                            Upcoming Trainings
                                        </h3>
                                        <div className="space-y-4">
                                            {upcomingTrainings.length === 0 ? (
                                                <p className="text-center py-20 text-gray-500 text-xl">
                                                    No upcoming trainings yet
                                                </p>
                                            ) : (
                                                upcomingTrainings.slice(0, 3).map((t) => (
                                                    <div key={t._id} className="bg-white p-4 rounded-lg">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-semibold text-gray-800">{t.title}</h4>
                                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(t.type)}`}>
                                                                {t.type}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500">{t.facilitator}</p>
                                                        <p className="text-sm text-gray-500">{t.registered}/{t.capacity} registered</p>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                            <MapPin size={14} />
                                                            <span>{t.location}</span>
                                                        </div>

                                                        {/* Optional: Delete/Edit buttons (inside map scope) */}
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <button
                                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                onClick={() => openEditModal(t)}
                                                            >
                                                                <Edit2 className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                onClick={() => setShowDeleteId(t._id)}
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>

                                                            {showDeleteId === t._id && (
                                                                <div className="absolute right-0 top-10 bg-white p-4 w-64 border border-gray-300 rounded-lg shadow-xl z-50">
                                                                    <p className="text-sm text-gray-800">
                                                                        Are you sure you want to delete <strong>{t.title}</strong>?
                                                                    </p>
                                                                    <div className="flex justify-end gap-2 mt-3">
                                                                        <button
                                                                            onClick={() => setShowDeleteId(null)}
                                                                            className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(t._id)}
                                                                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Top Rated Trainings + Training Type Distribution */}
                                    <div className="space-y-6">

                                        {/* Top Rated Trainings */}
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-green-900 mb-4">
                                                Top Rated Trainings
                                            </h3>
                                            <div className="space-y-3">
                                                {[...trainings]
                                                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                                                    .slice(0, 4)
                                                    .map((t) => (
                                                        <div key={t._id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                                                            <div>
                                                                <span className="text-gray-800 font-medium">{t.title}</span>
                                                                <span className="text-xs text-gray-500 ml-2">{t.type}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                                <span className="font-bold text-gray-800">{t.rating || 4.5}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>

                                        {/* Training Type Distribution */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-blue-900 mb-4">
                                                Training Type Distribution
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                {["Workshop", "Seminar", "Webinar", "Conference"].map((type) => {
                                                    const count = trainings.filter((t) => t.type === type).length;
                                                    return (
                                                        <div key={type}>
                                                            <p className="text-sm text-blue-700 font-medium mb-1">{type}s</p>
                                                            <p className="text-2xl font-bold text-blue-900">{count}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Upcoming Tab */}
                        {activeTab === "upcoming" && (
                            <div className="space-y-4">
                                {upcomingTrainings.length === 0 ? (
                                    <p className="text-center py-20 text-gray-500 text-xl">
                                        No upcoming trainings yet
                                    </p>
                                ) : (
                                    upcomingTrainings.map((t) => (
                                        <div
                                            key={t._id}
                                            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                                        >
                                            {/* ...training content... */}
                                            <div className="flex items-center gap-2 ml-6 relative">
                                                <button
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    onClick={() => openEditModal(t)}
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>

                                                <button
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    onClick={() => setShowDeleteId(t._id)}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>

                                                {showDeleteId === t._id && (
                                                    <div className="absolute right-0 top-10 bg-white p-4 w-64 border border-gray-300 rounded-lg shadow-xl z-50">
                                                        <p className="text-sm text-gray-800">
                                                            Are you sure you want to delete <strong>{t.title}</strong>?
                                                        </p>

                                                        <div className="flex justify-end gap-2 mt-3">
                                                            <button
                                                                onClick={() => setShowDeleteId(null)}
                                                                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                                                            >
                                                                Cancel
                                                            </button>

                                                            <button
                                                                onClick={() => handleDelete(t._id)}
                                                                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}



                        {/* Completed Tab */}
                        {activeTab === "completed" && (
                            <div className="space-y-4">
                                {completedTrainings.length === 0 ? (
                                    <p className="text-center py-20 text-gray-500 text-xl">
                                        No completed trainings yet
                                    </p>
                                ) : (
                                    completedTrainings.map((t) => (
                                        <div
                                            key={t._id}
                                            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="text-lg font-bold text-gray-900">{t.title}</h3>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                                                                t.type
                                                            )}`}
                                                        >
                                                            {t.type}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{new Date(t.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{t.time}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{t.location}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                                        <Users className="w-4 h-4" />
                                                        <span>{t.facilitator}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                        <span>{t.rating || "N/A"}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 ml-6">
                                                    {/* Optionally add Edit/Delete buttons here */}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}


                        {/* Create Tab */}
                        {activeTab === "create" && (
                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <h2 className="text-2xl text-[#333] font-bold mb-4">Create New Training</h2>
                                <form onSubmit={handleCreateTraining} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Training Title *"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                        required
                                        className="w-full text-[#333] border px-4 py-2 rounded-lg"
                                    />
                                    <select
                                        value={formData.type}
                                        onChange={(e) =>
                                            setFormData({ ...formData, type: e.target.value })
                                        }
                                        required
                                        className="w-full text-[#333] border px-4 py-2 rounded-lg"
                                    >
                                        <option>Workshop</option>
                                        <option>Seminar</option>
                                        <option>Conference</option>
                                        <option>Webinar</option>
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Capacity *"
                                        value={formData.capacity}
                                        onChange={(e) =>
                                            setFormData({ ...formData, capacity: +e.target.value })
                                        }
                                        required
                                        className="w-full text-[#333] border px-4 py-2 rounded-lg"
                                    />
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) =>
                                            setFormData({ ...formData, date: e.target.value })
                                        }
                                        required
                                        className="w-full text-[#333] border px-4 py-2 rounded-lg"
                                    />
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) =>
                                            setFormData({ ...formData, time: e.target.value })
                                        }
                                        required
                                        className="w-full text-[#333] border px-4 py-2 rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Location *"
                                        value={formData.location}
                                        onChange={(e) =>
                                            setFormData({ ...formData, location: e.target.value })
                                        }
                                        required
                                        className="w-full text-[#333] border px-4 py-2 rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Facilitator *"
                                        value={formData.facilitator}
                                        onChange={(e) =>
                                            setFormData({ ...formData, facilitator: e.target.value })
                                        }
                                        required
                                        className="w-full text-[#333] border px-4 py-2 rounded-lg"
                                    />
                                    <textarea
                                        placeholder="Description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        className="w-full text-[#333] border px-4 py-2 rounded-lg"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full text-[#333] py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition"
                                    >
                                        Create Training
                                    </button>
                                </form>
                            </div>
                        )}

                        {showEditModal && selectedTraining && (
                            <div className="fixed inset-0 bg-black/30 bg-opacity-50  flex items-center justify-center z-50">
                                <div className="bg-white w-full scale-[.7] max-w-lg p-6 rounded-xl shadow-lg">
                                    <h2 className="text-xl text-[#333] font-bold mb-4">Edit Training</h2>

                                    {/* Title */}
                                    <label className="block mb-3">
                                        <span className="text-sm text-[#333] font-medium">Title</span>
                                        <input
                                            type="text"
                                            className="w-full text-[#333] mt-1 border p-2 rounded"
                                            value={selectedTraining.title}
                                            onChange={(e) =>
                                                setSelectedTraining({ ...selectedTraining, title: e.target.value })
                                            }
                                        />
                                    </label>

                                    {/* Type */}
                                    <label className="block mb-3">
                                        <span className="text-sm text-[#333] font-medium">Type</span>
                                        <select
                                            className="w-full text-[#333] mt-1 border p-2 rounded"
                                            value={selectedTraining.type}
                                            onChange={(e) =>
                                                setSelectedTraining({ ...selectedTraining, type: e.target.value as any })
                                            }
                                        >
                                            <option>Workshop</option>
                                            <option>Seminar</option>
                                            <option>Conference</option>
                                            <option>Webinar</option>
                                        </select>
                                    </label>

                                    {/* Date */}
                                    <label className="block mb-3">
                                        <span className="text-sm text-[#333] font-medium">Date</span>
                                        <input
                                            type="date"
                                            className="w-full mt-1 text-[#333] border p-2 rounded"
                                            value={selectedTraining.date.split("T")[0]}
                                            onChange={(e) =>
                                                setSelectedTraining({ ...selectedTraining, date: e.target.value })
                                            }
                                        />
                                    </label>

                                    {/* Time */}
                                    <label className="block mb-3">
                                        <span className="text-sm text-[#333] font-medium">Time</span>
                                        <input
                                            type="time"
                                            className="w-full mt-1 text-[#333] border p-2 rounded"
                                            value={selectedTraining.time}
                                            onChange={(e) =>
                                                setSelectedTraining({ ...selectedTraining, time: e.target.value })
                                            }
                                        />
                                    </label>

                                    {/* Location */}
                                    <label className="block mb-3">
                                        <span className="text-sm text-[#333] font-medium">Location</span>
                                        <input
                                            type="text"
                                            className="w-full mt-1 text-[#333] border p-2 rounded"
                                            value={selectedTraining.location}
                                            onChange={(e) =>
                                                setSelectedTraining({ ...selectedTraining, location: e.target.value })
                                            }
                                        />
                                    </label>

                                    {/* Facilitator */}
                                    <label className="block mb-3">
                                        <span className="text-sm text-[#333] font-medium">Facilitator</span>
                                        <input
                                            type="text"
                                            className="w-full mt-1 text-[#333] border p-2 rounded"
                                            value={selectedTraining.facilitator}
                                            onChange={(e) =>
                                                setSelectedTraining({ ...selectedTraining, facilitator: e.target.value })
                                            }
                                        />
                                    </label>

                                    {/* Capacity */}
                                    <label className="block mb-3">
                                        <span className="text-sm text-[#333] font-medium">Capacity</span>
                                        <input
                                            type="number"
                                            className="w-full mt-1 text-[#333] border p-2 rounded"
                                            value={selectedTraining.capacity}
                                            onChange={(e) =>
                                                setSelectedTraining({ ...selectedTraining, capacity: +e.target.value })
                                            }
                                        />
                                    </label>

                                    <div className="flex justify-end gap-3 mt-4">
                                        <button
                                            className="px-4 text-[#333] py-2 bg-gray-300 rounded"
                                            onClick={() => setShowEditModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-blue-600 text-white rounded"
                                            onClick={saveEdit}
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
