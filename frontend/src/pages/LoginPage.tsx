import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { Link } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, Loader } from "lucide-react";
import { motion } from "framer-motion";

export const LoginPage = () => {
  interface LoginFormData {
    email: string;
    password: string;
  }
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const login = useUserStore((state) => state.login);
  const isLoading = useUserStore((state) => state.isLoading);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log(formData);
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Invalid email address");
      }
      if(formData.password.length < 6){
        throw new Error("Password must be at least 8 characters long");
      }
      await login(formData.email, formData.password);
    } catch (error) {
      console.log(error);
    }
  };

  // Framer Motion Variants: Shifted directions slightly from Signup for unique flavor
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="relative min-h-[calc(100vh-73px)] flex items-center justify-center px-6 py-12 overflow-hidden">
      {/* Dynamic Mirror Glow Effects */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 left-1/3 w-[450px] h-[450px] bg-cyan-500/80 blur-[140px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute -bottom-20 right-1/4 w-[450px] h-[450px] bg-purple-600/80 blur-[140px] rounded-full pointer-events-none"
      />

      {/* Main Glassmorphic Card Wrapper */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-gray-950/40 border border-gray-800/80 backdrop-blur-xl rounded-2xl p-8 md:p-10 shadow-2xl relative z-10"
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          <motion.div
            variants={itemVariants}
            className="inline-flex p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl mb-4"
          >
            <LogIn className="h-6 w-6" />
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-extrabold tracking-tight text-white"
          >
            Welcome Back
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-sm text-gray-400 mt-2"
          >
            Sign in to manage your orders and view saved builds.
          </motion.p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-cyan-400 transition" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition bg-clip-padding"
              />
            </div>
          </motion.div>

          {/* Password Input */}
          <motion.div variants={itemVariants} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Password
              </label>
              <a
                href="#"
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-cyan-400 transition" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition bg-clip-padding"
              />
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            variants={itemVariants}
            whileHover={!isLoading ? { scale: 1.01 } : {}}
            whileTap={!isLoading ? { scale: 0.99 } : {}}
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:from-purple-800 disabled:to-cyan-800 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin text-cyan-200" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Redirect Link */}
        <motion.p
          variants={itemVariants}
          className="text-center text-sm text-gray-500 mt-6"
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-cyan-400 hover:text-cyan-300 font-medium transition underline-offset-4 hover:underline"
          >
            Sign Up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};
