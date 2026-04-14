import { Package, TruckElectric } from 'lucide-react';

const ToggleButton = ({ isTraveler, setIsTraveler }) => {

  return (
    <div
      onClick={() => setIsTraveler(!isTraveler)}
      className="relative lg:w-48 lg:h-8 w-24 h-6 bg-gray-200 rounded-full cursor-pointer flex items-center shadow-inner transition-all duration-300"
    >
     
      <div
        className={`absolute w-1/2 h-full bg-[#0984E3] rounded-full shadow-md transition-transform duration-300 ease-in-out ${
          isTraveler ? 'translate-x-full' : 'translate-x-0'
        }`}
      />

      
      <div className="relative flex w-full z-10 select-none">
        <span className={`w-1/2 flex justify-center items-center transition-colors duration-300 ${!isTraveler ? 'text-white' : 'text-gray-400'}`}>
          <Package className="w-3.5 lg:w-5" />
        </span>
        <span className={`w-1/2 flex justify-center items-center transition-colors duration-300 ${isTraveler ? 'text-white' : 'text-gray-400'}`}>
          <TruckElectric className="w-3.5 lg:w-5" />
        </span>
      </div>
    </div>
  );
};

export default ToggleButton;