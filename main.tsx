// 要解决问题：
// import React from 'react'
// import ReactDom from "react-dom/client"
// import App from './app.jsx'
// ReactDom.createRoot(document.getElementById('root')).render(<App/>)

import ReactDom from "./core/react-dom"
import App from './app.jsx'
ReactDom.createRoot(document.getElementById('root')).render(App)
let task =1
function workflow(deadline) {
    let showBreak = false
    while(!showBreak) {
        task ++
        showBreak = deadline.timeRemaining() < 1
        console.log('task', 1)
    }
    console.log(2222)
    requestIdleCallback(workflow)
}
requestIdleCallback(workflow)
