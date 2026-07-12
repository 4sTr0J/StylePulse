import { useState } from "react";

const API_BASE_URL = "http://localhost:5001/auth";

export default function AuthApp() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({ loading: false, message: "", isError: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", isError: false });

    const endpoint = isLogin ? "/login" : "/register";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      setStatus({
        loading: false,
        message: isLogin ? "Login successful!" : "Account created successfully!",
        isError: false,
      });

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
    } catch (err) {
      setStatus({
        loading: false,
        message: err.message,
        isError: true,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.14),_transparent_30%),linear-gradient(135deg,_#fffbeb_0%,_#fef3c7_45%,_#fff7ed_100%)] text-slate-800 p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-[0_18px_60px_rgba(120,53,15,0.14)] border border-amber-200/80">
        <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
          {isLogin ? "StylePulse" : "Create Account"}
        </h2>
        <p className="text-slate-500 text-center text-sm mb-6">
          {isLogin
            ? "Enter your credentials to access your account"
            : "Fill in the details below to register"}
        </p>

        {status.message && (
          <div
            className={`p-3 rounded-lg mb-4 text-sm font-medium text-center ${
              status.isError ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className="w-full px-4 py-2.5 bg-white border border-amber-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all text-slate-700 placeholder-slate-400 shadow-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-white border border-amber-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all text-slate-700 placeholder-slate-400 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-white border border-amber-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all text-slate-700 placeholder-slate-400 shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:via-yellow-400 hover:to-orange-400 text-white font-semibold rounded-xl shadow-lg shadow-amber-200 transition-all disabled:opacity-50 mt-2"
          >
            {status.loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setStatus({ loading: false, message: "", isError: false });
            }}
            className="text-amber-600 hover:text-amber-500 hover:underline font-medium"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}