import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './layouts/Layout'

function App() {
  

  return (
      <div className='font-plusjakarta'>
        <BrowserRouter>
      
        <Routes>
            <Route path='/' element={<Layout />}>

            </Route>



        </Routes>
        
        
        </BrowserRouter>
      </div>
  )
}

export default App
