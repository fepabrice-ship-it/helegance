import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { addToast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      addToast("Connexion réussie !", "success");
      navigate("/admin");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de connexion";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setResetSent(true);
      addToast("Email de réinitialisation envoyé !", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'envoi";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 glass-panel animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            {resetMode ? (
              <Mail size={32} className="text-primary" />
            ) : (
              <LogIn size={32} className="text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
            {resetMode ? "Réinitialisation" : "Administration"}
          </h1>
          <p className="text-gray-400 text-sm">
            {resetMode
              ? "Entrez votre email pour recevoir un lien"
              : "Veuillez vous connecter pour continuer"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {resetSent ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm">
              Consultez votre boîte mail pour réinitialiser votre mot de passe.
            </div>
            <button
              onClick={() => {
                setResetMode(false);
                setResetSent(false);
              }}
              className="text-primary text-sm font-bold uppercase tracking-wider hover:underline"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form
            onSubmit={resetMode ? handleResetPassword : handleLogin}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase px-1">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary outline-none transition-all"
                  placeholder="admin@tatoopinterest.com"
                />
              </div>
            </div>

            {!resetMode && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-[10px] font-bold text-primary uppercase hover:underline"
                  >
                    Oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white focus:border-primary outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
              >
                {loading
                  ? resetMode
                    ? "Envoi..."
                    : "Connexion..."
                  : resetMode
                  ? "Envoyer le lien"
                  : "Se connecter"}
              </button>
            </div>

            {resetMode && (
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="w-full flex items-center justify-center gap-2 text-gray-500 text-xs font-bold uppercase hover:text-white transition-colors"
              >
                <ArrowLeft size={14} />
                Retour
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
