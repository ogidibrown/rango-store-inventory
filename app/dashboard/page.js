"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../libs/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { Card, CardContent } from "../../components/card";
import {
  ArrowDown,
  ArrowUp,
  PackageCheck,
  Warehouse,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [totalItems, setTotalItems] = useState(0);
  const [itemsIn, setItemsIn] = useState(0);
  const [itemsOut, setItemsOut] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        fetchMessages();
      }
    });
    fetchStats();
    return () => unsubscribe();
  }, [router]);

  const fetchStats = async () => {
    const itemsSnapshot = await getDocs(collection(db, "items"));
    const items = itemsSnapshot.docs.map((doc) => doc.data());
    setTotalItems(items.length);

    const lowStockItems = items.filter((item) => item.quantity <= 4);
    setLowStockCount(lowStockItems.length);

    const historySnapshot = await getDocs(collection(db, "history"));
    const history = historySnapshot.docs.map((doc) => doc.data());
    setItemsIn(history.filter((h) => h.type === "stock-in").length);
    setItemsOut(history.filter((h) => h.type === "stock-out").length);
  };

  const fetchMessages = async () => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    const msgs = querySnapshot.docs.map(doc => doc.data());
    setMessages(msgs);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
    
    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        user: user.email,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const stats = [
    {
      label: "Total Stock Items",
      value: totalItems,
      icon: <PackageCheck className="text-blue-600" />,
    },
    {
      label: "Stock Items In",
      value: itemsIn,
      icon: <ArrowDown className="text-green-600" />,
    },
    {
      label: "Stock Items Out",
      value: itemsOut,
      icon: <ArrowUp className="text-red-600" />,
    },
    {
      label: "Low Stock Alerts",
      value: lowStockCount,
      icon: <Warehouse className="text-yellow-600" />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Inventory Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-2xl shadow-sm border border-gray-200">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-2 bg-gray-100 rounded-full">{stat.icon}</div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-semibold text-gray-800">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 border border-black">
        <h2 className="text-lg font-semibold text-black mb-2">💬 Team Chat</h2>
        <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
          {messages.map((msg, index) => (
            <div key={index} className="bg-gray-100 p-2 rounded">
              <p className="text-sm text-gray-700">
                <strong>{msg.user}: </strong>{msg.text}
              </p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
