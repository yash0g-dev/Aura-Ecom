import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

interface SignupFormData {
  name: string;
  email: string;
  password: string;
}

export const SignupPage = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
  });

  const signup = useUserStore((state) => state.signup);
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
      await signup(formData.name, formData.email, formData.password);
    } catch (error) {
      console.log(error);
    }
  };

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="relative min-h-[calc(100vh-73px)] flex items-center justify-center px-6 py-12 overflow-hidden">
      {/* Dynamic Animated Background Glows */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-10 -right-10 w-[400px] h-[400px] bg-purple-600 blur-[130px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute -bottom-10 -left-10 w-[400px] h-[400px] bg-cyan-500 blur-[130px] rounded-full pointer-events-none"
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
            className="inline-flex p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl mb-4"
          >
            <UserPlus className="h-6 w-6" />
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-extrabold tracking-tight text-white"
          >
            Create your account
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-sm text-gray-400 mt-2"
          >
            Get access to next-gen setups and exclusive gear drops.
          </motion.p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name Input */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Full Name
            </label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition" />
              <input
                type="text"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition bg-clip-padding"
              />
            </div>
          </motion.div>

          {/* Email Input */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition bg-clip-padding"
              />
            </div>
          </motion.div>

          {/* Password Input */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition bg-clip-padding"
              />
            </div>
          </motion.div>

          {/* Dynamic Submit Button */}
          <motion.button
            variants={itemVariants}
            whileHover={!isLoading ? { scale: 1.01 } : {}}
            whileTap={!isLoading ? { scale: 0.99 } : {}}
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin text-purple-200" />
            ) : (
              <>
                <span>Get Started</span>
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
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-400 hover:text-purple-300 font-medium transition underline-offset-4 hover:underline"
          >
            Log In
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};
