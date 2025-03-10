import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import routes from './routes/routes.tsx'
import { ConfigProvider } from './context/ConfigContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider>
    <React.StrictMode>
      <RouterProvider router={routes} />
    </React.StrictMode>,
  </ConfigProvider>
)