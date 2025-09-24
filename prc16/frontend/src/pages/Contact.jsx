import { useState } from "react";
import axios from "axios";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/contact", formData);
      setStatus({ success: res.data.success, msg: res.data.msg });
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus({ success: false, msg: err.response?.data?.msg || "Something went wrong" });
    }
  };

  return (
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📬 Contact Me
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          required
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-lg h-32 resize-none focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          required
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:opacity-90 transition"
        >
          Send Message 🚀
        </button>
      </form>
      {status && (
        <p
          className={`mt-4 text-center font-medium ${
            status.success ? "text-green-600" : "text-red-600"
          }`}
        >
          {status.msg}
        </p>
      )}
    </div>
  );
}
