"use client";
import { motion } from "framer-motion";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateChatroomPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [members, setMembers] = useState([""]);
  const [suggestions, setSuggestions] = useState([[]]);
  const [allUsers, setAllUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setAllUsers(data.emails))
      .catch(console.error);
  }, []);

  const handleMemberChange = (value, index) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);

    const filtered = allUsers
    .filter((user) => {    
      if (user && typeof user === 'string') {
        return user.toLowerCase().includes(value.toLowerCase()) && value.length > 1;
      }
      return false;
    });
    const newSuggestions = [...suggestions];
    newSuggestions[index] = filtered;
    setSuggestions(newSuggestions);
  };

  const selectSuggestion = (email, index) => {
    const updated = [...members];
    updated[index] = email;
    setMembers(updated);
    const newSuggestions = [...suggestions];
    newSuggestions[index] = [];
    setSuggestions(newSuggestions);
  };

  const addMemberField = () => {
    setMembers([...members, ""]);
    setSuggestions([...suggestions, []]);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Chatroom name is required");
      return;
    }

    try {
      const res = await fetch("/api/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, members }),
      });

      const data = await res.json();

      if (!res.ok) console.log(data.message)

      if (!res.ok) throw new Error(data.message,"Failed to create room");

      router.push(`/chatroom/${data.roomId}`);
    } catch (err) {
      console.log(error,"server error")
      setError(err.message);
    }
  };

  return (
    <motion.div
      initial={{ x: "100vw", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100vw", opacity: 0 }}
      transition={{ type: "spring", stiffness: 70, damping: 15 }}
      className="min-h-screen bg-gray-100 flex items-center justify-center"
    >
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold text-center">Create a Chatroom</h1>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Chatroom Name"
            className="w-full p-3 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password (Optional)"
            className="w-full p-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="space-y-3">
            <label className="block font-medium">Invite Members:</label>
            {members.map((email, idx) => (
              <div key={idx} className="relative">
                <Input
                  type="email"
                  placeholder={`Member ${idx + 1} Email`}
                  value={email}
                  onChange={(e) => handleMemberChange(e.target.value, idx)}
                />
                {suggestions[idx]?.length > 0 && (
                  <ul className="absolute z-10 bg-white border rounded shadow w-full mt-1 max-h-40 overflow-y-auto">
                    {suggestions[idx].map((suggestedEmail, i) => (
                      <li
                        key={i}
                        onClick={() => selectSuggestion(suggestedEmail, idx)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {suggestedEmail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <Button type="button" onClick={addMemberField} className="w-full">
              + Add Another Member
            </Button>
          </div>
        </div>
        
        <Button
          onClick={handleCreate}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
        >
          Create Chatroom
        </Button>
      </div>
    </motion.div>
  );
}
