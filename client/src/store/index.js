import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import citiesReducer from "./slices/citiesSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cities: citiesReducer,
        //
    },
})
