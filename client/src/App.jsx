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


function App() {
  
  

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

            <Route path='/packages/create' element={<AddPackage />} />

            <Route path='/travels/create' element={<AddTravel />} />
            
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
