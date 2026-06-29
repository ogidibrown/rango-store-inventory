"use client";

import { useState, useEffect } from "react";
import { db } from "../../libs/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";

const inputCls = "w-full border border-gray-600 bg-gray-800 text-white placeholder-gray-400 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function AddItemPage() {
  const [description, setDescription] = useState("");
  const [partnumber, setPartnumber] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Filters");
  const [unitcost, setUnitcost] = useState("");
  const [supplier, setSupplier] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minStock, setMinStock] = useState("");
  const [maxStock, setMaxStock] = useState("");
  const [selectedFleets, setSelectedFleets] = useState([]);
  const [fleetInput, setFleetInput] = useState("");
  const [savedFleets, setSavedFleets] = useState([]);

  const router = useRouter();

  useEffect(() => {
    getDocs(collection(db, "fleetNumbers")).then((snap) =>
      setSavedFleets(snap.docs.map((d) => d.data().name))
    );
  }, []);

  const addFleet = (name) => {
    const trimmed = name.trim().toUpperCase();
    if (!trimmed || selectedFleets.includes(trimmed)) return;
    setSelectedFleets((prev) => [...prev, trimmed]);
    setFleetInput("");
  };

  const removeFleet = (name) => {
    setSelectedFleets((prev) => prev.filter((f) => f !== name));
  };

  const handleFleetKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFleet(fleetInput);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const q = query(collection(db, "items"), where("partnumber", "==", partnumber));
    const snap = await getDocs(q);
    if (!snap.empty) {
      alert("Item with this part number already exists!");
      return;
    }
    await addDoc(collection(db, "items"), {
      description,
      partnumber,
      quantity: Number(quantity),
      category,
      unitcost: Number(unitcost),
      supplier,
      location,
      minStock: Number(minStock || 0),
      maxStock: Number(maxStock || 0),
      fleets: selectedFleets,
      createdAt: Date.now(),
    });
    router.push("/items/all-items");
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Add New Item</h1>
      <form onSubmit={handleAdd} className="space-y-4">

        <input className={inputCls} placeholder="Description" value={description}
          onChange={(e) => setDescription(e.target.value)} required />

        <input className={inputCls} placeholder="Part Number" value={partnumber}
          onChange={(e) => setPartnumber(e.target.value)} required />

        <input className={inputCls} placeholder="Location" value={location}
          onChange={(e) => setLocation(e.target.value)} required />

        <input className={inputCls} placeholder="Supplier" value={supplier}
          onChange={(e) => setSupplier(e.target.value)} required />

        <input type="number" className={inputCls} placeholder="Unit Cost (GHs)" value={unitcost}
          onChange={(e) => setUnitcost(e.target.value)} required />

        <div className="grid grid-cols-3 gap-3">
          <input type="number" className={inputCls} placeholder="Qty in Stock" value={quantity}
            onChange={(e) => setQuantity(e.target.value)} required />
          <input type="number" className={inputCls} placeholder="Min Stock" value={minStock}
            onChange={(e) => setMinStock(e.target.value)} />
          <input type="number" className={inputCls} placeholder="Max Stock" value={maxStock}
            onChange={(e) => setMaxStock(e.target.value)} />
        </div>

        <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="Filters">Filters</option>
          <option value="Man Diesel">Man Diesel</option>
          <option value="Volvo">Volvo</option>
          <option value="GET">GET</option>
          <option value="Lubricants">Lubricants</option>
          <option value="Tyres">Tyres</option>
        </select>

        {/* Fleet Numbers */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Fleet Numbers That Use This Item
          </label>

          {/* Type & add */}
          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type fleet number (e.g. SLM1) and press Enter or Add"
              value={fleetInput}
              onChange={(e) => setFleetInput(e.target.value)}
              onKeyDown={handleFleetKeyDown}
            />
            <button
              type="button"
              onClick={() => addFleet(fleetInput)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              + Add
            </button>
          </div>

          {/* Quick-add from saved fleets */}
          {savedFleets.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-gray-400 mb-1">Quick-add:</p>
              <div className="flex flex-wrap gap-1">
                {savedFleets.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => addFleet(f)}
                    disabled={selectedFleets.includes(f.toUpperCase())}
                    className={`text-xs px-2 py-1 rounded border transition ${
                      selectedFleets.includes(f.toUpperCase())
                        ? "border-gray-600 text-gray-600 cursor-default"
                        : "border-blue-500 text-blue-400 hover:bg-blue-900"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected tags */}
          {selectedFleets.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Selected fleets:</p>
              <div className="flex flex-wrap gap-2">
                {selectedFleets.map((f) => (
                  <span
                    key={f}
                    className="flex items-center gap-1 bg-blue-800 text-white text-xs px-2 py-1 rounded-full"
                  >
                    {f}
                    <button
                      type="button"
                      onClick={() => removeFleet(f)}
                      className="text-blue-300 hover:text-white font-bold leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedFleets.length === 0 && (
            <p className="text-xs text-gray-500 italic">No fleets assigned yet.</p>
          )}
        </div>

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold">
          Add Item
        </button>
      </form>
    </div>
  );
}
