
import { Package } from 'lucide-react';
import { TruckElectric } from 'lucide-react';

const ToggleButton = ({isTraveler, setIsTraveler}) => {
 

  const handleToggle = () => {
    setIsTraveler(!isTraveler)
    
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div onClick={handleToggle} 
      className="relative lg:w-48 lg:h-8 w-24 h-6 bg-gray-200 rounded-full p-1 cursor-pointer 
      flex items-center shadow-inner transition-all duration-300">
        
        <div className={`absolute w-1/2  lg:h-8 h-6 bg-[#0984E3] rounded-full shadow-md transition-transform duration-300 ease-in-out ${
            isTraveler ? 'translate-x-[91%]' : 'translate-x-0'
          }`}
        />

        
        <div className="relative flex w-full text-center text-sm font-semibold z-10 select-none">
          <span className={`w-1/2 flex justify-center items-center transition-colors duration-300 ${!isTraveler ? 'text-white' : 'text-gray-500'}`}>
            <Package className='w-3.5 lg:w-5' /> 
          </span>
          <span className={`w-1/2 flex justify-center items-center transition-colors duration-300 ${isTraveler ? 'text-white' : 'text-gray-500'}`}>
            <TruckElectric className='w-3.5 lg:w-5' />
          </span>
        </div>
      </div>
    </div>
  );
};

export default ToggleButton;