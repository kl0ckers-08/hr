"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Calendar, Search } from "lucide-react";

interface Report {
  _id: string;
  title: string;
  type: string;
  generatedBy: string;
  createdAt: string;
}

interface Stats {
  totalReports: number;
  thisMonth: number;
  reportTypes: number;
  departments: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalReports: 0,
    thisMonth: 0,
    reportTypes: 0,
    departments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/hr2/api/admin/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-h-screen overflow-y-scroll bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-600 mb-8">
          Generate and download HR2 system reports
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Reports Generated</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalReports}</p>
              </div>
              <FileText className="text-purple-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-600 font-medium">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.thisMonth}</p>
                <p className="text-xs text-gray-500">Recent Reports</p>
              </div>
              <Calendar className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-green-600 font-medium">Report Types</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.reportTypes}</p>
                <p className="text-xs text-gray-500">Categories</p>
              </div>
              <FileText className="text-green-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Departments Covered</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.departments}</p>
                <p className="text-xs text-gray-500">CS, IT, IS</p>
              </div>
              <Download className="text-yellow-500" size={24} />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate New Report</h2>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-4 rounded-xl flex items-center gap-3 transition">
            <FileText className="w-5 h-5" /> Generate Report
          </button>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Reports</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>
            <select className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700">
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No reports found.</p>
            ) : (
              filteredReports.map((r) => (
                <div
                  key={r._id}
                  className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{r.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString()} by{" "}
                        {r.generatedBy} •{" "}
                        <span className="text-purple-600">{r.type}</span>
                      </p>
                    </div>
                  </div>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
