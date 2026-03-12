import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, UserPlus, ChevronRight } from "lucide-react";

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Switzerland",
  "Netherlands",
  "Belgium",
  "Italy",
  "Spain",
  "Portugal",
  "Austria",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Ireland",
  "Poland",
  "Czech Republic",
  "Romania",
  "Bulgaria",
  "Greece",
  "Turkey",
  "Georgia",
  "Ukraine",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Israel",
  "India",
  "Japan",
  "South Korea",
  "Singapore",
  "Hong Kong",
  "Brazil",
  "Mexico",
  "South Africa",
  "New Zealand"
];

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    country: "",
    stateRegion: "",
    city: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      const user = cred.user;

      await set(ref(db, `users/${user.uid}`), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        country: form.country.trim(),
        stateRegion: form.stateRegion.trim(),
        city: form.city.trim(),
        role: "user",
        status: "active",

        btc_balance: 0,
        eth_balance: 0,
        usdt_balance: 0,
        usd_balance: 0,
        balance: "0.00",

        btc_address: "",
        eth_address: "",
        usdt_address: "",

        online: true,
        last_seen: Date.now(),
        created_at: new Date().toISOString()
      });

      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
            <UserPlus size={30} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Create Your Account
          </h1>
          <p className="text-slate-400 mt-2">
            Register to access your private wallet dashboard
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">First Name</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full p-3.5 rounded-2xl bg-black/30 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="First Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Last Name</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full p-3.5 rounded-2xl bg-black/30 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="Last Name"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Country</label>
              <input
                name="country"
                list="country-list"
                value={form.country}
                onChange={handleChange}
                className="w-full p-3.5 rounded-2xl bg-black/30 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="Start typing your country"
                required
              />
              <datalist id="country-list">
                {countries.map((country) => (
                  <option key={country} value={country} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">State / Region</label>
              <input
                name="stateRegion"
                value={form.stateRegion}
                onChange={handleChange}
                className="w-full p-3.5 rounded-2xl bg-black/30 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="State / Region"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full p-3.5 rounded-2xl bg-black/30 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="City"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full p-3.5 rounded-2xl bg-black/30 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="Phone Number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3.5 rounded-2xl bg-black/30 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="Email"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full p-3.5 rounded-2xl bg-black/30 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 pr-12"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Repeat Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3.5 rounded-2xl bg-black/30 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 pr-12"
                  placeholder="Repeat Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 p-3.5 rounded-2xl font-semibold transition inline-flex items-center justify-center gap-2"
          >
            <span>{loading ? "Creating Account..." : "Register"}</span>
            {!loading && <ChevronRight size={18} />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
