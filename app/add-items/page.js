"use client";

import { useState } from "react";
import { db } from "../../libs/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AddItemPage() {
  const [description, setDescription] = useState("");
  const [partnumber, setPartnumber] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState(0);
  const router = useRouter();

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "items"), {
      description,
      partnumber,
      quantity,
      location,
      createdAt: Date.now(),
    });
    router.push("/items");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Add New Item</h1>
      <form onSubmit={handleAdd} className="space-y-4">
        <input className="w-full border p-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input className="w-full border p-2" placeholder="Part number" value={partnumber} onChange={(e) => setPartnumber(e.target.value)} required />
        <input className="w-full border p-2" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <input type="number" className="w-full border p-2" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
        <button className="w-full bg-blue-600 text-white py-2">Add Item</button>
      </form>
    </div>
  );
}
