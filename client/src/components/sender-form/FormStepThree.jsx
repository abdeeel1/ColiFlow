import { FileUploadDemo } from "@/ui/FileUploadDemo";
import { ChevronDown } from "lucide-react";

const FormStepThree = () => {
    
    

    
    
    
    
    
    return ( 
        <div className="bg-white shadow p-6 rounded-2xl">
        
        

        <form action="" onSubmit={(e)=>{e.preventDefault()}}>
            <div className="flex flex-col 2xl:flex-row  gap-4">
                
                  <FileUploadDemo />

                  <div className="flex flex-col gap-4">
                    <label htmlFor="" className="text-sm text-gray-600 font-semibold">Description</label>
                    <textarea name="" id="" className="border border-neutral-400 rounded ps-2 py-1 placeholder:text-gray-300  focus:outline focus:outline-[#0984E3] resize-none overflow-y-scroll no-scrollbar " placeholder="Décrivez votre colis.." rows={5} cols={110}></textarea>
                  </div>
                
               
            </div>
        </form>
        
        </div>
    );
}
 
export default FormStepThree;