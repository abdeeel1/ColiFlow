"use client"

import { CheckboxInput } from "@/components/ui/checkbox";
import GoogleButton from "@/ui/GoogleButton";
import { zodResolver } from "@hookform/resolvers/zod";

import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import z from "zod";

const Signup = () => {
  
    
    const FormSchema = z.object({
        phone: z.string()
            .trim()
            .regex(/^(\+212|0)[5-7]\d{8}$/, "Numéro marocain invalide"),

        name: z.string()
            .trim()
            .min(3, "le nom doit comporter au moins 3 caractères"),

        email: z.string().trim().email(),

        password: z.string()
            .min(8, 'au moins 8 caractères')
            .regex(/[A-Z]/, 'doit comporter une lettre majuscule')
            .regex(/[a-z]/, 'doit comporter une lettre minuscule')
            .regex(/[0-9]/, 'must include a number')
            .regex(/[^A-Za-z0-9]/, 'doit contenir un caractère spécial'),

        confirmPassword: z.string(),

        accept: z.literal(true, "désolé, vous devez accepter nos conditions pour continuer")
        })
        .refine((data) => data.password === data.confirmPassword, {
        message: "le mots de passe ne correspondent pas",
        path: ["confirmPassword"],
        });

    const {register, handleSubmit, control, formState: {errors}} = useForm({
        resolver : zodResolver(FormSchema),
        defaultValues : {
            phone : "",
            name : "",
            email : "",
            password : "",
            confirmPassword : "",
            accept : false
        }
    })

    const onSubmitData = (data) => {
        
        console.log(data)

    }   
    
  
  
    return (
    <main className="bg-[#F1F5F9] min-h-screen">


    <div className="flex flex-row-reverse h-full xl:h-screen">
      {/* FORM SIDE */}
      <div className="w-full min-h-screen overflow-y-auto 2xl:w-1/2 flex flex-col 2xl:justify-center  py-10  px-10 xl:px-40">

        {/* HEADER */}
        <div>
          <h2 className="font-bold text-black text-[1.313rem] xl:text-[1.563rem]">
            Créer un compte
          </h2>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmitData)}>
            <div className="flex flex-col gap-4">
                {/* TELEPHONE */}
                <div className="flex flex-col gap-2 pt-3">
                    <label className="text-[0.875rem] font-semibold">Telephone</label>
                    <input
                    {...register('phone')}
                    type="tel"
                    className={`border w-full rounded-[0.625rem] ps-2 py-1 placeholder:text-gray-300 text-sm xl:text-base focus:outline focus:outline-[#0984E3]`}
                    placeholder="+212600000000"
                    />
                    {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
                </div>

                {/* NOM */}
                <div className="flex flex-col gap-2">
                    <label className="text-[0.875rem] font-semibold">Nom</label>
                    <input
                        {...register('name')}
                        type="text"
                        className="border w-full rounded-[0.625rem] ps-2 py-1 placeholder:text-gray-300 text-sm xl:text-base focus:outline focus:outline-[#0984E3]"
                        placeholder="Najib Abdessamad"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                {/* EMAIL */}
                <div className="flex flex-col gap-2">
                    <label className="text-[0.875rem] xl:text-[0.938rem] font-semibold">
                    Adresse e-mail
                    </label>
                    <input
                        {...register('email')}
                        type="email"
                        className="border w-full rounded-[0.625rem] xl:rounded-[0.75rem] ps-2 py-1 placeholder:text-gray-300 text-sm xl:text-base focus:outline focus:outline-[#0984E3]"
                        placeholder="abdessamad@gmail.com"
                    />
                    {errors.email && <p className="text-sm text-red-600 my-1">{errors.email.message}</p>}
                </div>

                {/* PASSWORD */}
                <div className="flex flex-col gap-2">
                    <label className="text-[0.875rem] xl:text-[0.938rem] font-semibold">
                    Mot de passe
                    </label>
                    <input
                        {...register('password')}
                        type="password"
                        className="border w-full rounded-[0.625rem] ps-2 py-1 placeholder:text-gray-300 text-sm xl:text-base focus:outline focus:outline-[#0984E3]"
                        placeholder="********"
                    />
                    {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                </div>
                
                {/* PASSWORD CONFIRMATION */}
                <div className="flex flex-col gap-2">
                    <label className="text-[0.875rem] xl:text-[0.938rem] font-semibold">
                    Confirmation
                    </label>
                    <input
                        {...register('confirmPassword')}
                        type="password"
                        className="border w-full rounded-[0.625rem] ps-2 py-1 placeholder:text-gray-300 text-sm xl:text-base focus:outline focus:outline-[#0984E3]"
                        placeholder="********"
                    />
                    {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
                </div>

                {/* CHECKBOX */}
                <div className="flex items-center gap-2 pb-6">
                    <Controller
                    name="accept"
                    control={control}
                    render={({ field }) => (
                        <CheckboxInput
                        checked={!!field.value}
                        onCheckedChange={(val) => field.onChange(!!val)}
                        />
                    )}
                    />
                    <div>
                        <p className="text-[0.75rem] xl:text-[0.938rem] font-bold">
                            J'accepte les conditions et la politique de confidentialité
                        </p>
                        {errors.accept && <p className="text-sm text-red-600">{errors.accept.message}</p>}
                
                    </div>
            </div>
                       
            
        </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="btn border-[#0984E3] bg-[#0984E3] text-white font-bold rounded-2xl w-full"
          >
            S'inscrire
          </button>

          {/* DIVIDER */}
          <div className="flex justify-center items-center py-5">
            <p className="text-[0.75rem] xl:text-[0.875rem] font-semibold">
              Or
            </p>
          </div>

          {/* GOOGLE */}
          <div className="flex flex-col gap-3 items-center">
            <GoogleButton text={"Sign up with Google"} />

            <p className="text-center text-[0.75rem] xl:text-[0.938rem]">
              Déjà un compte ?{" "}
              <span className="text-[#0C2A92] font-bold">
                <Link to={"/login"}>Connectez-vous</Link>
              </span>
            </p>
          </div>

        </form>
      </div>

      {/* IMAGE SIDE (desktop only) */}
      <div className="hidden xl:block 2xl:w-1/2 lg:w-full min-h-screen">
        <img
          src="/images/Login-Picture.jpg"
          alt=""
          className="w-400 h-full  rounded-r-3xl"
          loading="lazy"
        />
      </div>

    </div>

    </main>
  );
};

export default Signup;