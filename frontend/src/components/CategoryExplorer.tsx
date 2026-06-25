// src/components/CategoryExplorer.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, ChevronRight, LayoutGrid, Shirt } from "lucide-react";
import axiosInstance from "../lib/axios";

interface BackendCategory {
  name: "clothing" | "shoes" | "accessories" | string;
  subCategories: string[];
}

interface DepartmentData {
  department: "men" | "women" | "unisex" | string;
  categories: BackendCategory[];
}

export const CategoryExplorer = () => {
  const [hierarchyData, setHierarchyData] = useState<DepartmentData[]>([]);
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [debugStatus, setDebugStatus] = useState<string>("Initializing...");

  useEffect(() => {
    const fetchHierarchyTree = async () => {
      try {
        setLoading(true);
        setDebugStatus("Fetching from server via Axios...");

        const res = await axiosInstance.get<DepartmentData[]>(
          "/api/products/hierarchy",
        );

        setDebugStatus(`Server responded with status: ${res.status}`);
        const data = res.data;
        console.log("Database Hierarchy Data Output:", data);

        if (!data || data.length === 0) {
          setDebugStatus(
            "Success, but backend returned an EMPTY array []. Check your DB entries.",
          );
        } else {
          setHierarchyData(data);
          setActiveDept(data[0].department);
          setDebugStatus("Data parsed successfully!");
        }
      } catch (err: any) {
        console.error(err);
        const errorMsg = err.response?.data?.message || err.message;
        setDebugStatus(`Error caught: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchyTree();
  }, []);

  // DIAGNOSTIC SCREEN
  if (hierarchyData.length === 0 && !loading) {
    return (
      <div className="w-full p-8 border border-purple-500/30 bg-purple-950/10 rounded-2xl max-w-4xl mx-auto my-10">
        <h3 className="text-purple-400 font-bold text-lg mb-2">
          Sub-Matrix Diagnostic Logs
        </h3>
        <p className="text-gray-300 text-sm mb-4">
          The structural aggregator mounted, but rendering is stalled.
        </p>
        <div className="bg-black/40 p-4 rounded-xl font-mono text-xs text-cyan-400 border border-gray-800">
          Status Tracer: <span className="text-white">{debugStatus}</span>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          If tracer outputs "EMPTY array", ensure your Mongoose documents have
          their `isActive` flags set explicitly to `true`.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 w-full">
        <Loader2 className="h-7 w-7 text-purple-500 animate-spin" />
        <p className="text-gray-500 text-xs font-bold tracking-widest uppercase animate-pulse">
          Scanning Catalog Architecture...
        </p>
      </div>
    );
  }

  const currentDepartmentData = hierarchyData.find(
    (d) => d.department === activeDept,
  );

  // 1. Fixed: Local configuration fallback string safety checkpoint
  const safeActiveDept = activeDept || "";

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
      {/* Sidebar Selection Deck */}
      <div className="space-y-2 border-r border-gray-800/60 pr-6">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-black mb-4 flex items-center gap-2">
          <Shirt className="h-3.5 w-3.5" /> Departments
        </h3>
        {hierarchyData.map((item) => (
          <button
            key={item.department}
            onClick={() => setActiveDept(item.department)}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition flex items-center justify-between capitalize ${
              activeDept === item.department
                ? "bg-purple-600 text-white"
                : "bg-gray-900/40 text-gray-400 hover:text-white"
            }`}
          >
            {item.department}
            <ChevronRight className="h-4 w-4 opacity-40" />
          </button>
        ))}
      </div>

      {/* Grid View Aggregator Layout */}
      <div className="md:col-span-3">
        {currentDepartmentData && (
          <div>
            <h2 className="text-xl font-black text-white capitalize mb-6 tracking-tight">
              Browse {currentDepartmentData.department}'s Matrix
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentDepartmentData.categories.map((cat) => (
                <div
                  key={cat.name}
                  className="p-5 rounded-2xl bg-gray-950/40 border border-gray-800/80 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-sm font-black text-gray-200 capitalize mb-4 flex items-center gap-2 border-b border-gray-800/50 pb-2">
                      <LayoutGrid className="h-3.5 w-3.5 text-cyan-400" />
                      {cat.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cat.subCategories.map((subName) => {
                        // 2. Fixed: String trim and sanitization guard layer
                        const sanitizedSubName = subName.trim();
                        const subUrlSlug = sanitizedSubName
                          .toLowerCase()
                          .replace(/\s+/g, "-");

                        return (
                          <Link
                            key={subName}
                            // 3. Fixed: Replaced activeDept with safeActiveDept reference logic
                            to={`/shop/${safeActiveDept.toLowerCase()}/${cat.name.toLowerCase()}/${subUrlSlug}`}
                            className="px-2.5 py-1.5 bg-gray-900/60 border border-gray-800 text-xs font-medium text-gray-400 hover:text-white rounded-lg transition hover:border-purple-500/40"
                          >
                            {sanitizedSubName}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
