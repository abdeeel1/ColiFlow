import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './layouts/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'

function App() {
  

  return (
      <div className='font-plusjakarta'>
        <BrowserRouter>
      
        
        
        
        <Routes>
            
            {/* Routes without Layout - Login & Signup */}
            
            <Route path='login' element={<Login />} />

            <Route path='signup' element={<Signup />} />
            
            {/* Routes Layout */}

            <Route path='/' element={<Layout />}>

                <Route index element={<Home />} />

            </Route>

            {/* Not Found Page */}

            <Route path='*' element={<NotFound />} />

        </Routes>
        
        
        </BrowserRouter>
      </div>
  )
}

export default App
