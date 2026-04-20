"use client";

import {Checkbox, CheckboxGroup, Label} from "@heroui/react";
import CheckedInput from "./CheckedInput";


export default function CheckboxGroupSelect() {
  

  return (
    
    <div className="flex gap-10 items-center py-5">
        <div className="flex gap-4 justify-center">
          <div className="flex items-center gap-2">
              <CheckedInput value={"petite"} />
              <p>Petite</p>
          </div>
          <div className="flex items-center gap-2">
              <CheckedInput value={"moyen"} />
              <p>Moyen</p>
          </div>
          <div className="flex items-center gap-2">
              <CheckedInput value={"grand"} />
              <p>Grand</p>
          </div>
          <div className="flex items-center gap-2">
              <CheckedInput value={"volumineux "} />
              <p>Volumineux</p>
          </div>

        </div>
        
      
      
    </div>
      
    
  );
}