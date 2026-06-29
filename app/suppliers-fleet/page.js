"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../../libs/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function FleetSupplierSettings() {
  const [fleetInput, setFleetInput] = useState("");
  const [supplierInput, setSupplierInput] = useState("");
  const [fleets, setFleets] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setReady(true);
        fetchFleets();
        fetchSuppliers();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchFleets = async () => {
    try {
      const snapshot = await getDocs(collection(db, "fleetNumbers"));
      setFleets(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setError("Failed to load fleet numbers: " + e.message);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "suppliers"));
      setSuppliers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setError("Failed to load suppliers: " + e.message);
    }
  };

  const addFleet = async () => {
    const name = fleetInput.trim().toUpperCase();
    if (!name) return;
    if (fleets.some((f) => f.name.toUpperCase() === name)) {
      setError(`Fleet "${name}" already exists.`);
      return;
    }
    try {
      setError("");
      await addDoc(collection(db, "fleetNumbers"), { name });
      setFleetInput("");
      fetchFleets();
    } catch (e) {
      setError("Failed to add fleet: " + e.message);
    }
  };

  const addSupplier = async () => {
    const name = supplierInput.trim();
    if (!name) return;
    if (suppliers.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setError(`Supplier "${name}" already exists.`);
      return;
    }
    try {
      setError("");
      await addDoc(collection(db, "suppliers"), { name });
      setSupplierInput("");
      fetchSuppliers();
    } catch (e) {
      setError("Failed to add supplier: " + e.message);
    }
  };

  const deleteFleet = async (id) => {
    if (!confirm("Delete this fleet number?")) return;
    try {
      await deleteDoc(doc(db, "fleetNumbers", id));
      fetchFleets();
    } catch (e) {
      setError("Failed to delete fleet: " + e.message);
    }
  };

  const deleteSupplier = async (id) => {
    if (!confirm("Delete this supplier?")) return;
    try {
      await deleteDoc(doc(db, "suppliers", id));
      fetchSuppliers();
    } catch (e) {
      setError("Failed to delete supplier: " + e.message);
    }
  };

  if (!ready) return <p className="p-4 text-gray-400">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Fleet & Supplier Settings</h1>

      {error && (
        <div className="mb-4 bg-red-900 border border-red-500 text-red-200 px-4 py-3 rounded flex justify-between items-start">
          <p className="text-sm">{error}</p>
          <button onClick={() => setError("")} className="text-red-300 hover:text-white ml-4 font-bold">×</button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">

        {/* Fleet Numbers */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Fleet Numbers</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="e.g. SLM1, D2, EG4"
              value={fleetInput}
              onChange={(e) => setFleetInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFleet()}
              className="border border-gray-600 bg-gray-800 text-white placeholder-gray-400 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addFleet}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {fleets.length === 0 && (
              <p className="text-sm text-gray-500 italic">No fleet numbers added yet.</p>
            )}
            {fleets.map((f) => (
              <li key={f.id} className="flex justify-between items-center border border-gray-700 bg-gray-800 px-3 py-2 rounded">
                <span className="text-white font-medium">{f.name}</span>
                <button onClick={() => deleteFleet(f.id)} className="text-red-400 hover:text-red-300 text-sm">
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-2">{fleets.length} fleet number{fleets.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Suppliers */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Suppliers</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="e.g. E K Bonsu Parts"
              value={supplierInput}
              onChange={(e) => setSupplierInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSupplier()}
              className="border border-gray-600 bg-gray-800 text-white placeholder-gray-400 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={addSupplier}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {suppliers.length === 0 && (
              <p className="text-sm text-gray-500 italic">No suppliers added yet.</p>
            )}
            {suppliers.map((s) => (
              <li key={s.id} className="flex justify-between items-center border border-gray-700 bg-gray-800 px-3 py-2 rounded">
                <span className="text-white">{s.name}</span>
                <button onClick={() => deleteSupplier(s.id)} className="text-red-400 hover:text-red-300 text-sm">
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-2">{suppliers.length} supplier{suppliers.length !== 1 ? "s" : ""}</p>
        </div>

      </div>
    </div>
  );
}
