// 要解决问题：
// import React from 'react'
// import ReactDom from "react-dom/client"
// import App from './app.jsx'
// ReactDom.createRoot(document.getElementById('root')).render(<App/>)

import ReactDom from "./core/react-dom"
import App from './app.jsx'
ReactDom.createRoot(document.getElementById('root')).render(App)