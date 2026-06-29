"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../../libs/firebase";
import { onAuthStateChanged } from "firebase/auth";

const inputCls = "w-full border border-gray-600 bg-gray-800 text-white placeholder-gray-400 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function EditItemPage() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedFleets, setSavedFleets] = useState([]);
  const [fleetInput, setFleetInput] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) { router.push("/login"); return; }
      fetchItem();
      getDocs(collection(db, "fleetNumbers")).then((snap) =>
        setSavedFleets(snap.docs.map((d) => d.data().name))
      );
    });
    return () => unsubscribe();
  }, [id]);

  const fetchItem = async () => {
    const snap = await getDoc(doc(db, "items", id));
    if (snap.exists()) setItem({ id: snap.id, ...snap.data() });
    setLoading(false);
  };

  const addFleet = (name) => {
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) return;
    const current = item.fleets || [];
    if (current.includes(trimmed)) return;
    setItem({ ...item, fleets: [...current, trimmed] });
    setFleetInput("");
  };

  const removeFleet = (name) => {
    setItem({ ...item, fleets: (item.fleets || []).filter((f) => f !== name) });
  };

  const handleFleetKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addFleet(fleetInput); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "items", id), {
      description: item.description,
      partnumber: item.partnumber,
      location: item.location,
      quantity: Number(item.quantity),
      unitcost: Number(item.unitcost),
      supplier: item.supplier,
      category: item.category,
      minStock: Number(item.minStock || 0),
      maxStock: Number(item.maxStock || 0),
      fleets: item.fleets || [],
    });
    router.push("/items/all-items");
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!item) return <p className="p-4">Item not found.</p>;

  const selectedFleets = item.fleets || [];

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Edit Item</h1>
      <form onSubmit={handleUpdate} className="space-y-4">

        <div>
          <label className="block text-xs text-gray-400 mb-1">Description</label>
          <input className={inputCls} value={item.description || ""} required
            onChange={(e) => setItem({ ...item, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Part Number</label>
          <input className={inputCls} value={item.partnumber || ""} required
            onChange={(e) => setItem({ ...item, partnumber: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Location</label>
          <input className={inputCls} value={item.location || ""}
            onChange={(e) => setItem({ ...item, location: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Category</label>
          <select className={inputCls} value={item.category || "Filters"} required
            onChange={(e) => setItem({ ...item, category: e.target.value })}>
            <option value="Filters">Filters</option>
            <option value="Man Diesel">Man Diesel</option>
            <option value="Volvo">Volvo</option>
            <option value="GET">GET</option>
            <option value="Lubricants">Lubricants</option>
            <option value="Tyres">Tyres</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Supplier</label>
          <input className={inputCls} value={item.supplier || ""}
            onChange={(e) => setItem({ ...item, supplier: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Unit Cost (GHs)</label>
          <input type="number" className={inputCls} value={item.unitcost || ""}
            onChange={(e) => setItem({ ...item, unitcost: e.target.value })} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Qty in Stock</label>
            <input type="number" className={inputCls} value={item.quantity ?? ""} required
              onChange={(e) => setItem({ ...item, quantity: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Min Stock</label>
            <input type="number" className={inputCls} value={item.minStock ?? ""}
              onChange={(e) => setItem({ ...item, minStock: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Max Stock</label>
            <input type="number" className={inputCls} value={item.maxStock ?? ""}
              onChange={(e) => setItem({ ...item, maxStock: e.target.value })} />
          </div>
        </div>

        {/* Fleet Numbers */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Fleet Numbers That Use This Item
          </label>

          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type fleet number (e.g. SLM1) and press Enter or Add"
              value={fleetInput}
              onChange={(e) => setFleetInput(e.target.value)}
              onKeyDown={handleFleetKeyDown}
            />
            <button type="button" onClick={() => addFleet(fleetInput)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
              + Add
            </button>
          </div>

          {savedFleets.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-gray-400 mb-1">Quick-add:</p>
              <div className="flex flex-wrap gap-1">
                {savedFleets.map((f) => (
                  <button key={f} type="button" onClick={() => addFleet(f)}
                    disabled={selectedFleets.includes(f.toUpperCase())}
                    className={`text-xs px-2 py-1 rounded border transition ${
                      selectedFleets.includes(f.toUpperCase())
                        ? "border-gray-600 text-gray-600 cursor-default"
                        : "border-blue-500 text-blue-400 hover:bg-blue-900"
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedFleets.length > 0 ? (
            <div>
              <p className="text-xs text-gray-400 mb-1">Selected fleets:</p>
              <div className="flex flex-wrap gap-2">
                {selectedFleets.map((f) => (
                  <span key={f} className="flex items-center gap-1 bg-blue-800 text-white text-xs px-2 py-1 rounded-full">
                    {f}
                    <button type="button" onClick={() => removeFleet(f)}
                      className="text-blue-300 hover:text-white font-bold leading-none">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No fleets assigned yet.</p>
          )}
        </div>

        <button className="bg-blue-600 text-white py-2 w-full rounded hover:bg-blue-700 font-semibold">
          Update Item
        </button>
      </form>
    </div>
  );
}
