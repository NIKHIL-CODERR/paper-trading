import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Could not create account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-panel border border-line rounded-xl p-6">
        <p className="font-display text-xl font-700">Paper Desk</p>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Start with $100,000 in virtual funds
        </p>

        {error && <p className="text-rose text-sm mb-4">{error}</p>}

        <label className="text-xs text-slate-400">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-1 mb-4 bg-ink border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-mint"
        />

        <label className="text-xs text-slate-400">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-1 mb-4 bg-ink border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-mint"
        />

        <label className="text-xs text-slate-400">Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mt-1 mb-6 bg-ink border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-mint"
        />

        <button
          disabled={busy}
          className="w-full bg-mint text-ink font-medium rounded-lg py-2.5 text-sm disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create account"}
        </button>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Already have an account? <Link to="/login" className="text-mint">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
