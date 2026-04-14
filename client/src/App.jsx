import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './layouts/Layout'
import Home from './pages/Home'

function App() {
  

  return (
      <div className='font-plusjakarta'>
        <BrowserRouter>
      
        <Routes>
            <Route path='/' element={<Layout />}>

                <Route index element={<Home />} />

            </Route>



        </Routes>
        
        
        </BrowserRouter>
      </div>
  )
}

export default App
