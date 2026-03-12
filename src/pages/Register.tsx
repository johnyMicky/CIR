import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    country: "",
    phone: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;

      await set(ref(db, "users/" + user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        fullName: form.firstName + " " + form.lastName,
        email: form.email,
        phone: form.phone,
        country: form.country,
        role: "user",

        btc_balance: 0,
        eth_balance: 0,
        usdt_balance: 0,
        usd_balance: 0,

        btc_address: "",
        eth_address: "",
        usdt_address: "",

        created_at: new Date().toISOString()
      });

      navigate("/dashboard");

    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white">

      <div className="w-full max-w-lg p-8 rounded-2xl bg-[#0b1220] border border-white/10 shadow-xl">

        <h2 className="text-3xl font-bold mb-6 text-center">
          Create Account
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">

            <input
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
              className="p-3 rounded-lg bg-black/30 border border-white/10"
              required
            />

            <input
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
              className="p-3 rounded-lg bg-black/30 border border-white/10"
              required
            />

          </div>

          <select
            name="country"
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-black/30 border border-white/10"
            required
          >
            <option value="">Select Country</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Canada</option>
            <option>Australia</option>
            <option>Germany</option>
            <option>France</option>
            <option>Switzerland</option>
          </select>

          <input
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-black/30 border border-white/10"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-black/30 border border-white/10"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-black/30 border border-white/10"
            required
          />

          {error && (
            <div className="text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-semibold transition"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default Register;
