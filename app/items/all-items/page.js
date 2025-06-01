"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../libs/firebase";
import Link from "next/link";

export default function ItemsPage() {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    const snapshot = await getDocs(collection(db, "items"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setItems(list);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "items", id));
    fetchItems();
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">All Items</h1>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-bold">{item.description}</p>
              <p className="text-sm text-gray-500">{item.partnumber} — Loc: {item.location} — Qty: {item.quantity}</p>
            </div>
            <div className="space-x-2">
            <Link href={`/edit-item/${item.id}`} className="text-blue-600 hover:underline">Edit</Link>
            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
