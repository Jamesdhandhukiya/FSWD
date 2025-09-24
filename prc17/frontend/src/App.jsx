import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/students";

export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", course: "" });
  const [editing, setEditing] = useState(null);

  // Fetch students
  useEffect(() => {
    axios.get(API).then((res) => setStudents(res.data));
  }, []);

  // Handle input
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      const res = await axios.put(`${API}/${editing}`, form);
      setStudents(students.map((s) => (s._id === editing ? res.data : s)));
      setEditing(null);
    } else {
      const res = await axios.post(API, form);
      setStudents([...students, res.data]);
    }
    setForm({ name: "", email: "", phone: "", course: "" });
  };

  // Delete
  const handleDelete = async (id) => {
    await axios.delete(`${API}/${id}`);
    setStudents(students.filter((s) => s._id !== id));
  };

  // Edit
  const handleEdit = (student) => {
    setForm(student);
    setEditing(student._id);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          🎓 Tuition Admin Panel
        </h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <input
            name="course"
            value={form.course}
            onChange={handleChange}
            placeholder="Course"
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
          <button
            type="submit"
            className="col-span-1 md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
          >
            {editing ? "Update Student" : "Add Student"}
          </button>
        </form>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-blue-100 text-blue-700">
              <tr>
                <th className="p-3 border border-gray-200 text-left">Name</th>
                <th className="p-3 border border-gray-200 text-left">Email</th>
                <th className="p-3 border border-gray-200 text-left">Phone</th>
                <th className="p-3 border border-gray-200 text-left">Course</th>
                <th className="p-3 border border-gray-200 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="p-3 border border-gray-200">{s.name}</td>
                  <td className="p-3 border border-gray-200">{s.email}</td>
                  <td className="p-3 border border-gray-200">{s.phone}</td>
                  <td className="p-3 border border-gray-200">{s.course}</td>
                  <td className="p-3 border border-gray-200 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center p-4 text-gray-500 italic"
                  >
                    No students found. Add a new one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
