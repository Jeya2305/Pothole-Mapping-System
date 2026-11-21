import { useEffect, useState } from "react";

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No token found. Please log in.");
          return;
        }

        const res = await fetch("http://localhost:5000/api/protected-route", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch protected data");
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProtectedData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {error && <p className="text-red-500">❌ {error}</p>}
      {!data && !error && <p>🔄 Loading...</p>}
      {data && <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

export default AdminDashboard;
