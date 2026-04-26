"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useNavigate, Link, useParams } from "react-router-dom";
import { useState } from "react";
import axiosClient from "@/services/axios";
import { toast } from "sonner";

const schema = z.object({
  password: z.string()
    .min(8, "au moins 8 caractères")
    .regex(/[A-Z]/, "doit contenir une majuscule")
    .regex(/[a-z]/, "doit contenir une minuscule")
    .regex(/[0-9]/, "doit contenir un chiffre")
    .regex(/[^A-Za-z0-9]/, "doit contenir un caractère spécial"),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

const ResetPassword = () => {
  const {token} = useParams();
  const [params] = useSearchParams()
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const email = params.get("email");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      await axiosClient.get("/sanctum/csrf-cookie");

      await axiosClient.post("/reset-password", {
        token,
        email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      toast.success("Mot de passe modifié avec succès");

      setTimeout(() => {
        navigate("/login");
      }, 800);

    } catch (err) {
        if(err.response?.status === 422 ) {
            toast.error("Lien invalide ou expiré")
        }else{
            toast.error("Erreur lors de la réinitialisation");
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg overflow-hidden grid grid-cols-1 xl:grid-cols-2">
        
        {/* LEFT */}
        <div className="flex flex-col justify-center px-8 py-14 xl:px-16">
          
          <div className="flex flex-col gap-3 mb-10">
            <h1 className="text-2xl xl:text-3xl font-semibold text-gray-900">
              Réinitialiser le mot de passe
            </h1>
            <p className="text-sm xl:text-base text-gray-500">
              Entrez votre nouveau mot de passe
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                value={email || ""}
                readOnly
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-gray-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="********"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0948E3]"
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Confirmation
              </label>
              <input
                {...register("password_confirmation")}
                type="password"
                placeholder="********"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0948E3]"
              />
              {errors.password_confirmation && (
                <p className="text-sm text-red-600">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn bg-[#0984E3] border-[#0984E3] hover:border-[#0984E3] text-white font-bold w-full rounded-xl disabled:opacity-70"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Réinitialiser"
              )}
            </button>

          </form>

          <p className="text-sm text-gray-500 mt-8 text-center xl:text-left">
            Retour à{" "}
            <Link to="/login" className="text-[#0948E3] font-medium">
              la connexion
            </Link>
          </p>
        </div>

        {/* RIGHT IMAGE */}
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

export default ResetPassword;