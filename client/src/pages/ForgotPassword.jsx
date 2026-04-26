"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useState } from "react";
import axiosClient from "@/services/axios";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().trim().email("Veuillez entrer un email valide"),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      await axiosClient.get("/sanctum/csrf-cookie");

      await axiosClient.post("/forgot-password", {
        email: data.email,
      });

      toast.success("Lien envoyé à votre email 📩");
    } catch (err) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg overflow-hidden grid grid-cols-1 xl:grid-cols-2">
        
        <div className="flex flex-col justify-center px-8 py-14 xl:px-16">
          
          <div className="flex flex-col gap-3 mb-10">
            <h1 className="text-2xl xl:text-3xl font-semibold text-gray-900">
              Mot de passe oublié
            </h1>
            <p className="text-sm xl:text-base text-gray-500">
              Entrez votre adresse e-mail pour recevoir un lien de réinitialisation
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Adresse e-mail
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="exemple@gmail.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0948E3]"
              />
              {errors.email && (
                <p className="text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn bg-[#0984E3] border-[#0984E3] text-white font-bold rounded-2xl w-full disabled:opacity-70"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Envoyer le lien"
              )}
            </button>

          </form>

          <p className="text-sm text-gray-500 mt-8 text-center xl:text-left">
            Vous vous souvenez de votre mot de passe ?{" "}
            <Link to="/login" className="text-[#0948E3] font-medium">
              Se connecter
            </Link>
          </p>
        </div>

        <div className="hidden xl:block h-full">
          <img
            src="/images/Login-Picture.jpg"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

      </div>
    </main>
  );
};

export default ForgotPassword;