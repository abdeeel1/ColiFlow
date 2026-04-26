"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import axiosClient from "@/services/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/store/slices/authSlice";

const schema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^(\+212|0)[5-7]\d{8}$/, "Numéro marocain invalide"),
});

const CompleteProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }

    if (user?.phone) {
      navigate("/");
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      await axiosClient.get("/sanctum/csrf-cookie");

      await axiosClient.post("/complete-profile", {
        phone: data.phone,
      });

      const res = await axiosClient.get("/api/user");

      dispatch(setUser(res.data));

      toast.success("Profil complété avec succès");

      setTimeout(() => {
        navigate("/");
      }, 800);

    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-black">
            Compléter votre profil
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Ajoutez votre numéro de téléphone pour continuer
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Numéro de téléphone
            </label>

            <input
              {...register("phone")}
              type="tel"
              placeholder="+212600000000"
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0948E3] focus:border-[#0948E3]"
            />

            {errors.phone && (
              <p className="text-sm text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn bg-[#0984E3] border-[#0984E3] hover:border-[#0984E3] text-white font-bold w-full rounded-xl flex items-center justify-center"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Continuer"
            )}
          </button>
        </form>
      </div>
    </main>
  );
};

export default CompleteProfile;