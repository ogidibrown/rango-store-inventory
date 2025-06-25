"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../libs/firebase";
import Link from "next/link";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching items from Firebase...");
      const snapshot = await getDocs(collection(db, "items"));
      console.log("Snapshot received:", snapshot);
      console.log("Number of docs:", snapshot.docs.length);
      
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      console.log("Items fetched:", list);
      setItems(list);
    } catch (err) {
      console.error("Error fetching items:", err);
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
      console.error("Error deleting item:", err);
      setError(err.message);
    }
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
      
      {items.length === 0 ? (
        <p className="text-gray-500">No items found. Make sure you have data in your 'items' collection.</p>
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
