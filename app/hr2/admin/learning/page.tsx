"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Upload, FileText, X, BookOpen } from "lucide-react";

// TYPES
interface Module {
    _id?: string;
    title: string;
    description: string;
    category: string;
    numberOfTopics: number;
    targetRoles: string[];
    fileName?: string;
    filePath?: string;
    createdAt?: string;
}

// MAIN DASHBOARD
export default function LMSDashboard() {
    const [activeTab, setActiveTab] = useState<"modules" | "progress" | "create">("modules");
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);

    useEffect(() => { fetchModules(); }, []);

    const fetchModules = async () => {
        try {
            const res = await axios.get("/hr2/api/admin/module");
            setModules(res.data);
        } catch (err) { console.error("Failed to load modules"); }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900">Learning Management (Admin)</h1>
                <p className="text-gray-700 mb-6">Manage learning modules and track employee progress</p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Total Modules" value={modules.length} subtitle="active learning paths" color="purple" />
                    <StatCard title="Total Enrollments" value={120} subtitle="across all modules" color="blue" />
                    <StatCard title="Avg Completion" value="70%" subtitle="completion rate" color="green" />
                    <StatCard title="Avg Score" value="84%" subtitle="quiz performance" color="yellow" />
                </div>

                <div className="flex border-b border-gray-200 mb-8">
                    <TabButton label="All Modules" value="modules" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="User Progress" value="progress" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Create Module" value="create" activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

                {activeTab === "modules" && <ModulesTab modules={modules} setSelectedModule={setSelectedModule} />}
                {activeTab === "progress" && <UserProgressTab />}
                {activeTab === "create" && <CreateModuleTab onSuccess={fetchModules} />}

                {selectedModule && <ModuleModal module={selectedModule} onClose={() => setSelectedModule(null)} />}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                               COMPONENTS                                   */
/* -------------------------------------------------------------------------- */

function StatCard({ title, value, subtitle, color }: { title: string; value: any; subtitle: string; color: string }) {
    const bg = { purple: "bg-purple-100 text-purple-700", blue: "bg-blue-100 text-blue-700", green: "bg-green-100 text-green-700", yellow: "bg-yellow-100 text-yellow-700" }[color];
    return (
        <div className={`p-5 rounded-2xl ${bg} border border-gray-200`}>
            <p className="text-sm font-medium">{title}</p>
            <h2 className="text-3xl font-bold mt-1">{value}</h2>
            <p className="text-xs opacity-80 mt-1">{subtitle}</p>
        </div>
    );
}

function TabButton({ label, value, activeTab, setActiveTab }: any) {
    return (
        <button
            onClick={() => setActiveTab(value)}
            className={`px-6 py-3 font-medium transition-colors relative ${activeTab === value ? "text-purple-600" : "text-gray-500 hover:text-gray-700"}`}
        >
            {label}
            {activeTab === value && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-t-full" />}
        </button>
    );
}

/* -------------------------------------------------------------------------- */
/*                                MODULES TAB                                */
/* -------------------------------------------------------------------------- */
function ModulesTab({ modules, setSelectedModule }: { modules: Module[]; setSelectedModule: (m: Module) => void }) {
    return (
        <div>
            <input type="text" placeholder="Search modules..." className="w-full md:w-96 mb-6 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <div className="grid gap-5">
                {modules.length === 0 ? (
                    <p className="text-gray-700 text-center py-10">No modules yet. Create one!</p>
                ) : modules.map(m => (
                    <div key={m._id} onClick={() => setSelectedModule(m)} className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition cursor-pointer">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold text-gray-900">{m.title}</h3>
                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">Active</span>
                        </div>
                        <p className="text-gray-700 mb-4">{m.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><p className="text-gray-600 font-medium">Category</p><p className="font-semibold text-gray-900">{m.category || "N/A"}</p></div>
                            <div><p className="text-gray-600 font-medium">Topics</p><p className="font-semibold text-gray-900">{m.numberOfTopics}</p></div>
                            <div><p className="text-gray-600 font-medium">Roles</p><p className="font-semibold text-gray-900">{m.targetRoles?.length || 0} roles</p></div>
                            <div><p className="text-gray-600 font-medium">File</p><p className="font-semibold text-gray-900 truncate">{m.fileName ? "Attached" : "None"}</p></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                             USER PROGRESS TAB                              */
/* -------------------------------------------------------------------------- */
function UserProgressTab() {
    return <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-700">User progress tracking coming soon...</div>;
}

/* -------------------------------------------------------------------------- */
/*                     CREATE MODULE TAB                                      */
/* -------------------------------------------------------------------------- */
function CreateModuleTab({ onSuccess }: { onSuccess: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const categories = ["Technical", "Soft Skills", "Compliance", "Leadership", "Onboarding"];
    const roles = ["Instructor", "Lecturer", "Laboratory Facilitator", "Department Staff", "IT Support Staff"];

    const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragover" || e.type === "dragenter"); };
    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); };
    const handleFile = (f: File) => {
        const ext = f.name.split(".").pop()?.toLowerCase();
        if (!["pdf", "docx", "pptx"].includes(ext || "")) return alert("Only PDF, DOCX, PPTX allowed");
        if (f.size > 50 * 1024 * 1024) return alert("File must be under 50MB");
        setFile(f);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (file) formData.append("file", file);
        try { await axios.post("/hr2/api/admin/module", formData, { headers: { "Content-Type": "multipart/form-data" } }); alert("Module created successfully!"); e.currentTarget.reset(); setFile(null); onSuccess(); }
        catch (err: any) { alert("Error: " + (err.response?.data?.error || "Failed to create module")); }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Create New Learning Module</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Module Title <span className="text-red-500">*</span></label><input name="title" required placeholder="Enter module title" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label><textarea name="description" required rows={5} placeholder="Enter module description" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Category</label><select name="category" defaultValue="Technical" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Number of Topics</label><input type="number" name="numberOfTopics" required min="1" defaultValue={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-4">Target Roles</label><div className="flex flex-wrap gap-4">{roles.map(role => (<label key={role} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="targetRoles" value={role} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" /><span className="text-sm text-gray-700">{role}</span></label>))}</div></div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">Upload Module Content</label>
                        <div onClick={() => fileInputRef.current?.click()} onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${dragActive ? "border-purple-500 bg-purple-50" : "border-gray-300"}`}>
                            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.pptx" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="font-medium text-gray-700">Click to upload or drag and drop</p>
                            <p className="text-sm text-gray-500">PDF, DOCX, or PPTX (max 50MB)</p>
                        </div>
                        {file && (<div className="mt-4 flex items-center justify-between bg-gray-50 border rounded-lg p-4"><div className="flex items-center gap-3"><FileText className="w-8 h-8 text-purple-600" /><div><p className="font-medium">{file.name}</p><p className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</p></div></div><button type="button" onClick={() => setFile(null)}><X className="w-5 h-5 text-gray-400 hover:text-red-600" /></button></div>)}
                    </div>
                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition transform hover:scale-[1.02]"><BookOpen className="w-5 h-5" />Create Module</button>
                </form>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                              MODULE MODAL                                  */
/* -------------------------------------------------------------------------- */
function ModuleModal({ module, onClose }: { module: Module; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"><X className="w-6 h-6" /></button>
                <h2 className="text-2xl font-bold pr-10">{module.title}</h2>
                <p className="text-gray-600 mt-2">{module.description}</p>
                <div className="grid grid-cols-2 gap-6 mt-6 text-sm">
                    <div><p className="text-gray-600 font-medium">Category</p><p className="font-semibold text-gray-900">{module.category || "—"}</p></div>
                    <div><p className="text-gray-600 font-medium">Topics</p><p className="font-semibold text-gray-900">{module.numberOfTopics}</p></div>
                    <div><p className="text-gray-600 font-medium">Target Roles</p><p className="font-semibold text-gray-900">{module.targetRoles?.join(", ") || "All"}</p></div>
                    <div><p className="text-gray-600 font-medium">Attachment</p><p className="font-semibold text-gray-900">{module.fileName || "No file"}</p></div>
                </div>
            </div>
        </div>
    );
}
