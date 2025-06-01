"use client";

import { useState } from "react";
import { db } from "../../libs/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AddItemPage() {
  const [description, setDescription] = useState("");
  const [partnumber, setPartnumber] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Filters"); // default selection
  const [quantity, setQuantity] = useState(0);

  const router = useRouter();

  const handleAdd = async (e) => {
    e.preventDefault();

    // 🔍 Check if partnumber already exists
    const q = query(
      collection(db, "items"),
      where("partnumber", "==", partnumber)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert("Item with this part number already exists!");
      return;
    }

    // ✅ If not duplicate, add item
    await addDoc(collection(db, "items"), {
      description,
      partnumber,
      quantity,
      category,
      location,
      createdAt: Date.now(),
    });

    router.push("/items/all-items");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Add New Item</h1>
      <form onSubmit={handleAdd} className="space-y-4">
        <input
          className="w-full border p-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          className="w-full border p-2"
          placeholder="Part number"
          value={partnumber}
          onChange={(e) => setPartnumber(e.target.value)}
          required
        />
        <input
          className="w-full border p-2"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <input
          type="number"
          className="w-full border p-2"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          required
        />

        {/* Category Dropdown */}
        <select
          className="w-full border p-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option className="text-black" value="Filters">
            Filters
          </option>
          <option className="text-black" value="Man Diesel">
            Man Diesel
          </option>
          <option className="text-black" value="Volvo">
            Volvo
          </option>
          <option className="text-black" value="GET">
            GET
          </option>
          <option className="text-black" value="Lubricant">
            Lubricant
          </option>
          <option className="text-black" value="Tyres">
            Tyres
          </option>
        </select>

        <button className="w-full bg-blue-600 text-white py-2">
          Add Item
        </button>
      </form>
    </div>
  );
}
