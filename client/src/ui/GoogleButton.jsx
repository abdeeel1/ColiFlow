import { SocialButton } from "@/components/base/buttons/social-button";
 
export default function GoogleButton ({text}) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-8">
                <SocialButton social="google" theme="brand" className="bg-[#F1F5F9] text-black w-50 h-8 text-[12px] lg:text-[15px]">
                    {text}
                </SocialButton>
            </div>
        </div>
    );
};

