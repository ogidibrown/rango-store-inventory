"use client";

import { useEffect, useState } from "react";
import { updateDoc } from "firebase/firestore";
import { db, auth } from "../../libs/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function IssuePage() {
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [fleetNumber, setFleetNumber] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [unitcost, setUnitcost] = useState(0);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        fetchItems();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchItems = async () => {
    const snapshot = await getDocs(collection(db, "items"));
    const itemsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setItems(itemsData);
  };

  const handleQuantityChange = (itemId, value) => {
    setQuantities((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleIssue = async (itemId, currentQty) => {
    const qty = parseInt(quantities[itemId]);
    if (!fleetNumber) return alert("Please enter a fleet number.");
    if (isNaN(qty) || qty <= 0) return alert("Enter valid quantity");
    if (qty > currentQty) return alert("Not enough stock available");

    const newQty = currentQty - qty;
    const itemRef = doc(db, "items", itemId);
    const itemSnap = await getDoc(itemRef);
    const itemData = itemSnap.exists() ? itemSnap.data() : {};

    await addDoc(collection(db, "history"), {
      itemId,
      change: -qty,
      type: "stock-out",
      timestamp: serverTimestamp(),
      user: userEmail || "unknown",
      fleetNumber,
      category: itemData.category || "Unknown",
      supplier: itemData.supplier || "Unknown",
      unitcost: itemData.unitcost || "Unknown",
    });

    await updateDoc(itemRef, { quantity: newQty });
    setQuantities((prev) => ({ ...prev, [itemId]: "" }));
    fetchItems();
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Issue Items to Fleet</h1>

      <input
        type="text"
        placeholder="Enter Fleet Number (e.g. T13)"
        value={fleetNumber}
        onChange={(e) => setFleetNumber(e.target.value)}
        className="border px-3 py-2 rounded mb-4 w-full sm:w-1/2"
      />

      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="border p-4 rounded border-gray-300 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row justify-between">
              <div>
                <p className="font-bold">{item.description}</p>
                <p className="text-sm  text-gray-400">
                  Part #: {item.partnumber} | Qty: {item.quantity} | Supplier: {item.supplier} | Unit Cost: Ghs{item.unitcost}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={quantities[item.id] || ""}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  className="border px-2 py-1 rounded w-20"
                />
                <button
                  onClick={() => handleIssue(item.id, item.quantity)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Issue
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
