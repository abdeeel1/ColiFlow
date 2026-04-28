"use client";

import {Label, Slider} from "@heroui/react";

export function RangeSlider({ minPrice = 0, maxPrice = 1000, onChange }) {
  return (
    <div className="px-4 py-2 w-64">
      <Slider
        className="w-full flex justify-center items-center"
        value={[minPrice, maxPrice]}
        onChange={(values) => {
          if (onChange) {
            onChange({ min: values[0], max: values[1] });
          }
        }}
        formatOptions={{currency: "MAD", style: "currency"}}
        maxValue={5000}
        minValue={0}
        step={50}
      >
        
        <Slider.Output />
        <Slider.Track className={"h-4 w-50"}>
          {({state}) => (
            <>
              <Slider.Fill/>
              {state.values.map((_, i) => (
                <Slider.Thumb  key={i} index={i} />
              ))}
            </>
          )}
        </Slider.Track>
      </Slider>
    </div>
  );
}