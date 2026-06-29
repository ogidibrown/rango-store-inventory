"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../libs/firebase";
import Link from "next/link";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CATEGORIES = ["All", "Filters", "Man Diesel", "Volvo", "GET", "Lubricants", "Tyres"];

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const snapshot = await getDocs(collection(db, "items"));
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    try {
      await deleteDoc(doc(db, "items", id));
      fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      (item.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.partnumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.supplier || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = filteredItems.filter(
    (item) => item.quantity <= (item.minStock || 4)
  );

  const exportToExcel = () => {
    const csv = Papa.unparse(
      filteredItems.map((item) => ({
        Description: item.description || "",
        "Part Number": item.partnumber || "",
        Category: item.category || "",
        Location: item.location || "",
        Supplier: item.supplier || "",
        "Unit Cost": item.unitcost || "",
        Quantity: item.quantity || "",
        "Min Stock": item.minStock || "",
        "Max Stock": item.maxStock || "",
        "Fleet Numbers": (item.fleets || []).join(", "),
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "items.csv");
  };

  const exportToPDF = () => {
    const d = new jsPDF();
    d.text("Items List", 14, 15);
    autoTable(d, {
      startY: 20,
      head: [["Description", "Part #", "Category", "Qty", "Min", "Fleets"]],
      body: filteredItems.map((item) => [
        item.description || "",
        item.partnumber || "",
        item.category || "",
        item.quantity ?? "",
        item.minStock ?? "",
        (item.fleets || []).join(", "),
      ]),
      styles: { fontSize: 8 },
    });
    d.save("items.pdf");
  };

  const downloadLowStockReport = () => {
    if (lowStockItems.length === 0) {
      alert("No low stock items found for the current filter.");
      return;
    }

    const d = new jsPDF({ orientation: "landscape" });
    const title =
      categoryFilter === "All"
        ? "Low Stock Report — All Categories"
        : `Low Stock Report — ${categoryFilter}`;
    const date = new Date().toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });

    d.setFontSize(14);
    d.text(title, 14, 14);
    d.setFontSize(9);
    d.text(`Generated: ${date}`, 14, 21);
    d.text(`${lowStockItems.length} item(s) below minimum stock level`, 14, 27);

    autoTable(d, {
      startY: 32,
      head: [[
        "Part Number", "Description", "Category",
        "Qty in Stock", "Min Stock", "Max Stock",
        "Reorder Qty", "Used By (Fleets)",
      ]],
      body: lowStockItems.map((item) => [
        item.partnumber || "—",
        item.description || "—",
        item.category || "—",
        item.quantity ?? "—",
        item.minStock ?? "—",
        item.maxStock ?? "—",
        item.maxStock != null && item.quantity != null
          ? Math.max(0, Number(item.maxStock) - Number(item.quantity))
          : "—",
        (item.fleets || []).length > 0 ? item.fleets.join(", ") : "—",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [185, 28, 28] },
      alternateRowStyles: { fillColor: [254, 242, 242] },
    });

    const categorySlug =
      categoryFilter === "All" ? "all" : categoryFilter.toLowerCase().replace(/\s+/g, "-");
    d.save(`low-stock-${categorySlug}-${date.replace(/ /g, "-")}.pdf`);
  };

  useEffect(() => { fetchItems(); }, []);

  if (loading) return <div className="p-4"><p>Loading items...</p></div>;

  if (error) {
    return (
      <div className="p-4 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">All Items</h1>
        <div className="bg-red-900 border border-red-500 text-red-200 px-4 py-3 rounded">
          <p>Error loading items: {error}</p>
          <button onClick={fetchItems} className="mt-2 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">All Items</h1>
        {lowStockItems.length > 0 && (
          <span className="bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
            ⚠️ {lowStockItems.length} low stock
          </span>
        )}
      </div>

      {/* Filters & actions row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search description, part #, supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-600 bg-gray-800 text-white placeholder-gray-400 px-3 py-2 rounded w-72"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-600 bg-gray-800 text-white px-3 py-2 rounded"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <span className="text-sm text-gray-400 self-center">
          {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            onClick={downloadLowStockReport}
            className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-600 text-sm font-medium"
          >
            ⬇ Low Stock Report
          </button>
          <button onClick={exportToExcel} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 text-sm">
            Export CSV
          </button>
          <button onClick={exportToPDF} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm">
            Export PDF
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-gray-400">No items match your filters.</p>
      ) : (
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const isLow = item.quantity <= (item.minStock || 4);
            return (
              <li
                key={item.id}
                className={`rounded border overflow-hidden shadow-sm ${
                  isLow ? "border-red-500" : "border-gray-700"
                }`}
              >
                {isLow && (
                  <div className="bg-red-700 text-white text-xs font-semibold px-4 py-1.5">
                    ⚠️ LOW STOCK — Only {item.quantity} left &nbsp;|&nbsp; Min: {item.minStock || 4} &nbsp;|&nbsp; Max: {item.maxStock || "—"}
                  </div>
                )}
                <div className={`p-4 flex justify-between items-start gap-4 ${isLow ? "bg-red-950" : "bg-gray-800"}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white">{item.description || "No description"}</p>
                    <p className="text-sm text-gray-300 mt-0.5">
                      Part #: {item.partnumber || "—"} &nbsp;|&nbsp;
                      Cat: {item.category || "—"} &nbsp;|&nbsp;
                      Supplier: {item.supplier || "—"} &nbsp;|&nbsp;
                      Cost: GHs{item.unitcost || "—"} &nbsp;|&nbsp;
                      Qty:{" "}
                      <span className={isLow ? "text-red-400 font-bold" : "text-white font-semibold"}>
                        {item.quantity ?? "—"}
                      </span>
                      &nbsp;/ Min: {item.minStock ?? "—"}
                    </p>
                    {(item.fleets || []).length > 0 && (
                      <p className="text-xs text-blue-400 mt-1">
                        Fleets: {item.fleets.join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <Link href={`/edit-item/${item.id}`} className="text-blue-400 hover:underline text-sm">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
