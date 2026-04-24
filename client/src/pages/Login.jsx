"use client"

import GoogleButton from "@/ui/GoogleButton";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckboxInput } from "@/components/ui/checkbox";
import axiosClient from "@/services/axios";

const Login = () => {

  const navigate = useNavigate()

  const FormSchema = z.object({
    email: z.string().trim().email(),
    remember: z.boolean().optional(),
    password: z.string()
      .min(8, 'au moins 8 caractères')
      .regex(/[A-Z]/, 'doit comporter une lettre majuscule')
      .regex(/[a-z]/, 'doit comporter une lettre minuscule')
      .regex(/[0-9]/, 'must include a number')
      .regex(/[^A-Za-z0-9]/, 'doit contenir un caractère spécial')
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false
    }
  });


   

  const onSubmit = async (data) => {
    const credentials = {
      email : data.email,
      password : data.password
    }


    try {
       
        await axiosClient.get('/sanctum/csrf-cookie')
        const response = await axiosClient.post('/api/login', credentials)  

        if (response.status === 200 || response.status === 204) {
                navigate('/'); 
        }

    } catch (error) {
        console.log(error)
    }
  
  };
  

  return (
    <main className="bg-[#F1F5F9] min-h-screen">

    <div className="flex h-screen">
      {/* LEFT SIDE (FORM) */}
      <div className="w-full min-h-screen 2xl:w-1/2  flex flex-col justify-center py-20 px-10 xl:px-40">

        {/* HEADER */}
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-black text-[1.313rem] xl:text-[1.563rem]">
            Ravi de vous revoir !
          </h2>
          <p className="text-[#000000] text-[0.813rem] xl:text-[1.125rem]">
            Enter your credentials to access your account
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* EMAIL */}
          <div className="flex flex-col gap-2 py-10">
            <label className="text-[0.875rem] xl:text-[0.938rem] font-semibold">
              Adressse e-mail
            </label>
            <input
              {...register("email")}
              type="email"
              className="border w-full rounded-[0.625rem] xl:rounded-[0.75rem] ps-2 py-1 placeholder:text-gray-300 text-sm xl:text-base focus:outline focus:outline-[#0984E3]"
              placeholder="abdessamad@gmail.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[0.875rem] xl:text-[0.938rem] font-semibold">
                Mot de passe
              </label>
              <Link
                to="/forgot-password"
                className="text-[0.75rem] xl:text-[0.938rem] text-[#0C2A92] font-semibold"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <input
              {...register("password")}
              type="password"
              className="border w-full rounded-[0.625rem] ps-2 py-1 placeholder:text-gray-300 text-sm xl:text-base focus:outline focus:outline-[#0984E3]"
              placeholder="********"
            />

            {errors.password && (
              <p className="text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* CHECKBOX */}
          <div className="flex items-center gap-2 py-10">
            <Controller
              name="remember"
              control={control}
              render={({ field }) => (
                <CheckboxInput
                  checked={!!field.value}
                  onCheckedChange={(val) => field.onChange(!!val)}
                />
              )}
            />
            <p className="text-[0.75rem] xl:text-[0.938rem] font-bold">
              Se souvenir de moi
            </p>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="btn bg-[#0984E3] border-[#0984E3] hover:border-[#0984E3] text-white font-bold rounded-2xl w-full"
          >
            Connexion
          </button>

          {/* DIVIDER */}
          <div className="flex justify-center items-center py-5">
            <p className="text-[0.75rem] xl:text-[0.875rem] font-semibold">
              Or
            </p>
          </div>

          {/* GOOGLE */}
          <div className="flex flex-col gap-5 items-center">
            <GoogleButton text={"Sign in with Google"} />

            <p className="text-center text-[0.75rem] xl:text-[0.938rem]">
              Vous n'avez pas de compte ?{" "}
              <span className="text-[#0C2A92] font-bold">
                <Link to="/register">Créer un compte</Link>
              </span>
            </p>
          </div>
        </form>
      </div>

      {/* RIGHT SIDE (IMAGE - DESKTOP ONLY) */}
      <div className="hidden xl:block 2xl:w-1/2 lg:w-full min-h-screen">
        <img
          src="/images/Login-Picture.jpg"
          alt=""
          className="w-400 h-full rounded-l-3xl"
          loading="lazy"
        />
      </div>

    </div>

    </main>
  );
};

export default Login;