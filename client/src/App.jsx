import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './layouts/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
import TravelsList from './pages/TravelsList'
import TravelDetail from './pages/TravelDetail'
import ScrollToTop from './components/ScrollToTop'
import AddPackage from './pages/AddPackage'
import ForgotPassword from './pages/ForgotPassword'
import AddTravel from './pages/AddTravel'
import { Toaster } from './components/ui/sonner'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import axiosClient from './services/axios'
import { logout, setUser } from './store/slices/authSlice'
import CompleteProfile from './pages/CompleteProfile'
import ResetPassword from './pages/ResetPassword'


function App() {
  
  const dispatch = useDispatch();
  const { isAuth, user } = useSelector((state) => state.auth);
  const [checkingServer, setCheckingServer] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await axiosClient.get('/api/user');
        dispatch(setUser(res.data));
      } catch (err) {
        dispatch(logout());
      } finally {
        setCheckingServer(false);
      }
    };

    verifySession();
  }, [dispatch]);

  if (checkingServer) {
  return (
    <div className="min-h-screen gap-2 flex items-center justify-center transition-opacity duration-300">
      <span className="loading loading-spinner loading-lg text-[#0984E3]"></span>
      <p className="text-center text-[1rem] font-bold">Veuillez patienter</p>
    </div>
  );
}

    

  return (
      <div className='font-plusjakarta'>
        <BrowserRouter>
      
        <ScrollToTop />

        <Toaster position='top-right' />
        
        <Routes>
            
            {/* Routes without Layout - Login & Signup */}
            
            <Route path='login' element={<Login />} />

            <Route path='register' element={<Signup />} />

            <Route path='/forgot-password' element={<ForgotPassword />} />

            <Route path='/password-reset/:token' element={<ResetPassword />} />

            <Route path='/packages/create' element={<AddPackage />} />

            <Route path='/travels/create' element={<AddTravel />} />

            <Route path='/complete-profile' element={<CompleteProfile />} />
            
            {/* Routes Layout */}

            <Route path='/' element={<Layout />}>

                <Route index element={<Home />} />
                
                <Route path='/travels' element={<TravelsList />} />

                <Route path='/travel/:id' element={<TravelDetail />} />

            </Route>

            {/* Not Found Page */}

            <Route path='*' element={<NotFound />} />

        </Routes>
        
        
        </BrowserRouter>
      </div>
  )
}

export default App
