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
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const GetPage = () => {
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        fetchItems();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchItems = async () => {
    const q = query(collection(db, "items"), where("category", "==", "GET"));
    const snapshot = await getDocs(q);
    const itemsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setItems(itemsData);
  };

  const handleQuantityChange = (itemId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleStockChange = async (itemId, currentQty, type) => {
    const enteredQty = parseInt(quantities[itemId]);
    if (isNaN(enteredQty) || enteredQty <= 0) {
      return alert("Please enter a valid quantity.");
    }

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
    fetchItems(); // Refresh
  };

  const handleDelete = (id) => {
    alert("Delete function not implemented yet.");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">G.E.T</h1>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className={`border p-4 rounded ${
              item.quantity <= 4 ? "border-red-500 bg-red-5" : "border-gray-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="font-bold">{item.description}</p>
                <p className="text-sm text-gray-500">
                  {item.partnumber} — Loc: {item.location} — Qty:{" "}
                  <span
                    className={`font-semibold ${
                      item.quantity <= 4 ? "text-red-700" : ""
                    }`}
                  >
                    {item.quantity}
                  </span>
                </p>
                {item.quantity <= 4 && (
                  <p className="text-red-600 text-sm font-medium mt-1">
                    ⚠️ Alert: Only {item.quantity} left in stock!
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={quantities[item.id] || ""}
                  onChange={(e) =>
                    handleQuantityChange(item.id, e.target.value)
                  }
                  className="border px-2 py-1 rounded w-20"
                />
                <button
                  onClick={() =>
                    handleStockChange(item.id, item.quantity, "stock-in")
                  }
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Add
                </button>
                <button
                  onClick={() =>
                    handleStockChange(item.id, item.quantity, "stock-out")
                  }
                  className="bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
                <Link
                  href={`/edit-item/${item.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GetPage;
