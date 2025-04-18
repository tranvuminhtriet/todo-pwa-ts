import { useEffect, useState } from "react";

type Todo = {
  id: number;
  text: string;
  synced: boolean;
};

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncingIds, setSyncingIds] = useState<number[]>([]);

  // Load todos from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("todos");
    if (stored) {
      setTodos(JSON.parse(stored));
    }
  }, []);

  // Save todos to localStorage
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Monitor online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Try to sync unsynced todos when back online
  useEffect(() => {
    if (isOnline) {
      const unsynced = todos.filter((todo) => !todo.synced);
      unsynced.forEach((todo) => simulateApiSync(todo.id));
    }
  }, [isOnline]);

  const simulateApiSync = (id: number) => {
    setSyncingIds((prev) => [...prev, id]); // show loading
    setTimeout(() => {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, synced: true } : todo))
      );
      setSyncingIds((prev) => prev.filter((syncId) => syncId !== id));
    }, 1000);
  };

  const addTodo = () => {
    if (!input.trim()) return;
    const newTodo = {
      id: Date.now(),
      text: input,
      synced: isOnline,
    };
    setTodos([newTodo, ...todos]);
    setInput("");

    if (isOnline) {
      simulateApiSync(newTodo.id);
    }
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-primary bg-cover flex items-center justify-center px-4 bg-">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 ">
        <h1 className="text-2xl font-bold text-center mb-2">
          📋 PWA To-Do List
        </h1>
        <p className="text-sm text-gray-500 text-center mb-4">
          Status: {isOnline ? "🟢 Online" : "🔴 Offline"}
        </p>

        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
            type="text"
            placeholder="Add a new task..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition"
            onClick={addTodo}
          >
            Add
          </button>
        </div>

        <ul className="space-y-3 max-h-[60vh] overflow-auto pr-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm border"
            >
              <span className="text-gray-800">{todo.text}</span>
              <div className="flex gap-2 items-center">
                {syncingIds.includes(todo.id) ? (
                  <span className="text-blue-500 text-sm animate-pulse">
                    Syncing...
                  </span>
                ) : (
                  <span
                    title={todo.synced ? "Synced" : "Not synced"}
                    className={`text-xl ${
                      todo.synced ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {todo.synced ? "✅" : "❌"}
                  </span>
                )}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  title="Delete"
                  className="text-red-400 hover:text-red-600 text-xl"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
