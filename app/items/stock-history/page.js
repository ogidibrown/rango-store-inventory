"use client";

import { useEffect, useState } from "react";
import { db } from "../../../libs/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import jsPDF from "jspdf";
import { applyPlugin } from 'jspdf-autotable';
 // important: this imports and extends jsPDF with autoTable


export default function StockHistoryPage() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const q = query(collection(db, "history"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    const enriched = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const itemRef = doc(db, "items", data.itemId);
        const itemSnap = await getDoc(itemRef);
        const itemData = itemSnap.exists() ? itemSnap.data() : {};

        return {
          id: docSnap.id,
          timestamp: data.timestamp?.toDate().toLocaleString() || "N/A",
          user: data.user || "N/A",
          change: data.change,
          type: data.type,
          partnumber: itemData.partnumber || "N/A",
          description: itemData.description || "N/A",
          location: itemData.location || "N/A",
          quantity: itemData.quantity ?? "N/A",
        };
      })
    );

    setHistory(enriched);
  };

  const filteredHistory = history.filter(
    (entry) =>
      entry.partnumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredHistory.length / pageSize);

  const exportCSV = () => {
    const csv = Papa.unparse(
      filteredHistory.map((h) => ({
        Timestamp: h.timestamp,
        PartNumber: h.partnumber,
        Description: h.description,
        Location: h.location,
        Quantity: h.quantity,
        User: h.user,
        Change: h.change,
        Type: h.type,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "stock-history.csv");
  };

    applyPlugin(jsPDF);
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Stock History", 14, 10);
    doc.autoTable({
      head: [["Date", "Part #", "Description", "Location", "Qty", "User", "Change", "Type"]],
      body: filteredHistory.map((h) => [
        h.timestamp,
        h.partnumber,
        h.description,
        h.location,
        h.quantity,
        h.user,
        h.change,
        h.type,
      ]),
    });
    doc.save("stock-history.pdf");
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold">Stock History</h1>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search part number or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-2 py-1 rounded w-64"
          />
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border  rounded px-2 py-1"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} className="text-black" value={size}>
                Show {size}
              </option>
            ))}
          </select>
          <button onClick={exportCSV} className="bg-blue-600 cursor-pointer text-white px-3 py-1 rounded">
            Export CSV
          </button>
          <button onClick={exportPDF} className="bg-red-600 cursor-pointer text-white px-3 py-1 rounded">
            Export PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-black">Date</th>
              <th className="border p-2 text-black">Part #</th>
              <th className="border p-2 text-black">Description</th>
              <th className="border p-2 text-black">Location</th>
              <th className="border p-2 text-black">Qty</th>
              <th className="border p-2 text-black">User</th>
              <th className="border p-2 text-black">Change</th>
              <th className="border p-2 text-black">Type</th>
            </tr>
          </thead>
          <tbody>
            {paginatedHistory.length > 0 ? (
              paginatedHistory.map((h) => (
                <tr key={h.id}>
                  <td className="border p-2">{h.timestamp}</td>
                  <td className="border p-2">{h.partnumber}</td>
                  <td className="border p-2">{h.description}</td>
                  <td className="border p-2">{h.location}</td>
                  <td className="border p-2">{h.quantity}</td>
                  <td className="border p-2">{h.user}</td>
                  <td className="border p-2">{h.change}</td>
                  <td className="border p-2">{h.type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </p>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-gray-200 px-3 py-1 text-black rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-gray-200 px-3 py-1 rounded text-black disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
