"use client";

import { useEffect, useState } from "react";
import { db } from "../../libs/firebase";
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

  useEffect(() => {
    fetchFleets();
    fetchSuppliers();
  }, []);

  const fetchFleets = async () => {
    const snapshot = await getDocs(collection(db, "fleetNumbers"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFleets(data);
  };

  const fetchSuppliers = async () => {
    const snapshot = await getDocs(collection(db, "suppliers"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSuppliers(data);
  };

  const addFleet = async () => {
    if (!fleetInput.trim()) return;
    await addDoc(collection(db, "fleetNumbers"), { name: fleetInput.trim() });
    setFleetInput("");
    fetchFleets();
  };

  const addSupplier = async () => {
    if (!supplierInput.trim()) return;
    await addDoc(collection(db, "suppliers"), { name: supplierInput.trim() });
    setSupplierInput("");
    fetchSuppliers();
  };

  const deleteFleet = async (id) => {
    await deleteDoc(doc(db, "fleetNumbers", id));
    fetchFleets();
  };

  const deleteSupplier = async (id) => {
    await deleteDoc(doc(db, "suppliers", id));
    fetchSuppliers();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Fleet & Supplier Settings</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Fleet Numbers */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Fleet Numbers</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g. T13"
              value={fleetInput}
              onChange={(e) => setFleetInput(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
            <button
              onClick={addFleet}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {fleets.map(f => (
              <li key={f.id} className="flex justify-between border px-3 py-2 rounded">
                <span>{f.name}</span>
                <button onClick={() => deleteFleet(f.id)} className="text-red-500">Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Suppliers */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Suppliers</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g. ABC Spare Parts"
              value={supplierInput}
              onChange={(e) => setSupplierInput(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
            <button
              onClick={addSupplier}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {suppliers.map(s => (
              <li key={s.id} className="flex justify-between border px-3 py-2 rounded">
                <span>{s.name}</span>
                <button onClick={() => deleteSupplier(s.id)} className="text-red-500">Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
