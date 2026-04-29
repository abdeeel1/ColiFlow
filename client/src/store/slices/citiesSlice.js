import { createSlice } from "@reduxjs/toolkit"

const citiesSLice = createSlice({
    name: "cities",
    initialState: {
        cities: [],
    },
    reducers: {
        setCities: (state, action) => {
            state.cities = action.payload
        },
    },
})

export const { setCities } = citiesSLice.actions
export default citiesSLice.reducer
