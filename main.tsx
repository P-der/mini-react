// 要解决问题：
// import React from 'react'
// import ReactDom from "react-dom/client"
// import App from './app.jsx'
// ReactDom.createRoot(document.getElementById('root')).render(<App/>)

// v1
// const root  = document.getElementById('root')

// const app = document.createElement('div')
// app.id = 'app'

// const text = document.createTextNode('mini react learn')

// app.appendChild(text)
// root.appendChild(app)

// v2 提取公共创建函数，创建过程配置化

// const root = document.getElementById('root')
// enum NodeType {
//     TEXT_NODE = 'text-node'
// }

// const text = {
//     type: NodeType.TEXT_NODE,
//     props: {
//         nodeValue: 'mini react learn'
//     }
// }
// const app = {
//     type: 'div',
//     props: {
//         id: 'app',
//         children: [
//             text
//         ]
//     }
// }
// function createNode(type) {
//     switch(type) {
//         case NodeType.TEXT_NODE: {
//             return document.createTextNode('')
//         }
//         default: {
//             return document.createElement(type)
//         }
//     }
// }
// function render({type, props}, parent) {
//     const el = createNode(type)

//     Object.keys(props).forEach(prop=> {
//         if(prop !== 'children') {
//             // el?.setAttribute(prop, props[prop])
//             el[prop] = props[prop]
//         }
//     })
//     const childrens = props.children || []
//     childrens.forEach(children => {
//         render(children, el)
//     })
//     parent.appendChild(el)
//     return el
// }

// const ReactDom = {
//     createRoot(root) {
//         return {
//             render(el) {
//                 let test = render(el, root)
//                 console.log(test)
//             }
//         }
//     }
// }

// ReactDom.createRoot(document.getElementById('root')).render(app)