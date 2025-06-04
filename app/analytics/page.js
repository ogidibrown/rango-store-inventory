"use client";

import { useEffect, useState } from "react";
import { db } from "../../libs/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c"];

export default function StockAnalyticsPage() {
  const [categoryCosts, setCategoryCosts] = useState([]);
  const [fleetCosts, setFleetCosts] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const q = query(collection(db, "history"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    const tempCategory = {};
    const tempFleet = {};

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (data.type !== "issued") continue;

      const itemRef = doc(db, "items", data.itemId);
      const itemSnap = await getDoc(itemRef);
      const itemData = itemSnap.exists() ? itemSnap.data() : {};

      const category = itemData.category || "Unknown";
      const fleet = data.fleetNumber || "Unassigned";
      const quantity = data.change || 0;
      const unitcost = itemData.unitcost || 0;
      const totalCost = quantity * unitcost;

      tempCategory[category] = (tempCategory[category] || 0) + totalCost;
      tempFleet[fleet] = (tempFleet[fleet] || 0) + totalCost;
    }

    // Convert to chart-ready arrays
    setCategoryCosts(
      Object.entries(tempCategory).map(([name, value]) => ({ name, value }))
    );
    setFleetCosts(
      Object.entries(tempFleet).map(([name, value]) => ({ name, value }))
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Stock Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cost by Category */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Cost by Item Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryCosts}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
                
              >
                {categoryCosts.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cost by Fleet */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Cost by Fleet Number</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fleetCosts}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Total Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
