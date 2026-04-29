import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isAuth: localStorage.getItem("coliflow_auth_hint") === "true",
        loading: localStorage.getItem("coliflow_auth_hint") !== "true",
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
            state.isAuth = true
            state.loading = false
            localStorage.setItem("coliflow_auth_hint", "true")
        },
        logout: (state) => {
            state.user = null
            state.isAuth = false
            state.loading = false
            localStorage.removeItem("coliflow_auth_hint")
        },
    },
})

export const { setUser, logout, setLoading } = authSlice.actions
export default authSlice.reducer
