"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../../../libs/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ManPage = () => {
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
      else fetchItems();
    });
    return () => unsubscribe();
  }, []);

  const fetchItems = async () => {
    const q = query(collection(db, "items"), where("category", "==", "Man Diesel"));
    const snapshot = await getDocs(q);
    setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleQuantityChange = (itemId, value) => {
    setQuantities((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleStockChange = async (itemId, currentQty, type) => {
    const enteredQty = parseInt(quantities[itemId]);
    if (isNaN(enteredQty) || enteredQty <= 0) return alert("Please enter a valid quantity.");
    const change = type === "stock-in" ? enteredQty : -enteredQty;
    const newQty = currentQty + change;
    if (newQty < 0) return alert("Quantity cannot be negative.");
    const itemRef = doc(db, "items", itemId);
    await updateDoc(itemRef, { quantity: newQty });
    await addDoc(collection(db, "history"), {
      itemId,
      change,
      type,
      timestamp: serverTimestamp(),
      user: auth.currentUser?.email || "unknown",
    });
    setQuantities((prev) => ({ ...prev, [itemId]: "" }));
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    await deleteDoc(doc(db, "items", id));
    fetchItems();
  };

  const lowCount = items.filter((i) => i.quantity <= (i.minStock || 4)).length;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Man Diesel</h1>
        {lowCount > 0 && (
          <span className="bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
            ⚠️ {lowCount} low stock
          </span>
        )}
      </div>

      <ul className="space-y-3">
        {items.map((item) => {
          const isLow = item.quantity <= (item.minStock || 4);
          return (
            <li key={item.id} className={`rounded border overflow-hidden shadow-sm ${isLow ? "border-red-500" : "border-gray-700"}`}>
              {isLow && (
                <div className="bg-red-700 text-white text-xs font-semibold px-4 py-1.5">
                  ⚠️ LOW STOCK — Only {item.quantity} left &nbsp;|&nbsp; Min: {item.minStock || 4} &nbsp;|&nbsp; Max: {item.maxStock || "—"}
                </div>
              )}
              <div className={`p-4 ${isLow ? "bg-red-950" : "bg-gray-800"}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white">{item.description}</p>
                    <p className="text-sm text-gray-300 mt-0.5">
                      Part #: {item.partnumber} &nbsp;|&nbsp; Loc: {item.location} &nbsp;|&nbsp;
                      Qty:{" "}
                      <span className={`font-semibold ${isLow ? "text-red-400 font-bold" : "text-white"}`}>
                        {item.quantity}
                      </span>
                      &nbsp;/ Min: {item.minStock ?? "—"} / Max: {item.maxStock ?? "—"}
                    </p>
                    {(item.fleets || []).length > 0 && (
                      <p className="text-xs text-blue-400 mt-1">
                        Fleets: {item.fleets.join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={quantities[item.id] || ""}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="border border-gray-600 bg-gray-700 text-white px-2 py-1 rounded w-20 text-sm"
                    />
                    <button
                      onClick={() => handleStockChange(item.id, item.quantity, "stock-in")}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => handleStockChange(item.id, item.quantity, "stock-out")}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Remove
                    </button>
                    <Link href={`/edit-item/${item.id}`} className="text-blue-400 hover:underline text-sm">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:underline text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        {items.length === 0 && <p className="text-gray-500">No Man Diesel items found.</p>}
      </ul>
    </div>
  );
};

export default ManPage;
