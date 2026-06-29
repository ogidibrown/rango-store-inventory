import { useState } from "react";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { db } from "../libs/firebase";

const StockAdjustment = ({ itemId, currentQty }) => {
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState("in");

  const adjustStock = async () => {
    if (amount <= 0) return alert("Enter a valid quantity");

    const ref = doc(db, "items", itemId);
    const adjAmount = type === "in" ? amount : -amount;

    await updateDoc(ref, {
      quantity: increment(adjAmount),
      history: arrayUnion({
        type,
        amount,
        timestamp: new Date().toISOString()
      })
    });

    alert("Stock updated successfully!");
    setAmount(0);
  };

  return (
    <div className="mt-4 space-x-2">
      <select
        className="border px-2 py-1 rounded"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="in">Stock In</option>
        <option value="out">Stock Out</option>
      </select>

      <input
        type="number"
        placeholder="Qty"
        className="border px-2 py-1 w-24 rounded"
        value={amount}
        onChange={(e) => setAmount(parseInt(e.target.value))}
      />

      <button
        onClick={adjustStock}
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
      >
        Update
      </button>
    </div>
  );
};

export default StockAdjustment;
