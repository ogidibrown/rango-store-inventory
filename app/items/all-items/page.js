"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../libs/firebase";
import Link from "next/link";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const snapshot = await getDocs(collection(db, "items"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "items", id));
      fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const exportToExcel = () => {
    const csv = Papa.unparse(
      items.map((item) => ({
        Description: item.description || "",
        "Part Number": item.partnumber || "",
        Location: item.location || "",
        Supplier: item.supplier || "",
        "Unit Cost": item.unitcost || "",
        Quantity: item.quantity || "",
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "items.csv");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Items List", 14, 15);
    const tableColumn = ["Description", "Part Number", "Location", "Supplier", "Unit Cost", "Quantity"];
    const tableRows = items.map((item) => [
      item.description || "",
      item.partnumber || "",
      item.location || "",
      item.supplier || "",
      item.unitcost || "",
      item.quantity || "",
    ]);
    doc.autoTable({
      startY: 20,
      head: [tableColumn],
      body: tableRows,
    });
    doc.save("items.pdf");
  };

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <p>Loading items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">All Items</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading items: {error}</p>
          <button 
            onClick={fetchItems}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">All Items</h1>

      <div className="flex flex-col space-x-4 mb-4">
        <button onClick={exportToExcel} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Export to Excel
        </button>
        <button onClick={exportToPDF} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Export to PDF
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500">No items found.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <p className="font-bold">{item.description || 'No description'}</p>
                <p className="text-sm text-gray-500">
                  {item.partnumber || 'No part number'} — 
                  Loc: {item.location || 'No location'} - 
                  Supplier: {item.supplier || 'No supplier'} - 
                  Unit cost: {item.unitcost || 'No cost'} — 
                  Qty: {item.quantity || 'No quantity'}
                </p>
              </div>
              <div className="space-x-2">
                <Link href={`/edit-item/${item.id}`} className="text-blue-600 hover:underline">
                  Edit
                </Link>
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
