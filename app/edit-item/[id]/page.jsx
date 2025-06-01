"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../libs/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function EditItemPage() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔒 Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        fetchItem(); // only fetch if user is logged in
      }
    });

    return () => unsubscribe();
  }, [id]);

  // 🔍 Fetch item details
  const fetchItem = async () => {
    const snap = await getDoc(doc(db, "items", id));
    if (snap.exists()) setItem({ id: snap.id, ...snap.data() });
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "items", id), {
      description: item.description,
      partnumber: item.partnumber,
      location: item.location,
      quantity: item.quantity,
    });
    router.push("/items/all-items");
  };

  if (loading) return <p className="p-4">Checking authentication...</p>;
  if (!item) return <p className="p-4">Loading item data...</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Edit Item</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          className="w-full border p-2"
          value={item.description}
          onChange={(e) => setItem({ ...item, description: e.target.value })}
        />
        <input
          className="w-full border p-2"
          value={item.partnumber}
          onChange={(e) => setItem({ ...item, partnumber: e.target.value })}
        />
        <input
          className="w-full border p-2"
          value={item.location}
          onChange={(e) => setItem({ ...item, location: e.target.value })}
        />
        <input
          type="number"
          className="w-full border p-2"
          value={item.quantity}
          onChange={(e) => setItem({ ...item, quantity: Number(e.target.value) })}
        />
        <button className="bg-blue-600 text-white py-2 w-full">Update</button>
      </form>
    </div>
  );
}
