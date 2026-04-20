"use client";

import {Label, Slider} from "@heroui/react";

export function RangeSlider() {
  return (
    <Slider
      className="w-full max-w-xs flex justify-center items-center"
      defaultValue={[20, 200]}
      formatOptions={{currency: "MAD", style: "currency"}}
      maxValue={1000}
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
  );
}