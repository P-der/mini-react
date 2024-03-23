enum NodeType {
    TEXT_NODE = 'text-node'
}
function createTextNode(text) {
    return {
        type: NodeType.TEXT_NODE,
        props: {
            nodeValue: text
        }
    }
}
// 提供给外部jsx解析使用
function createElement(type, props,...children) {
    return {
        type, 
        props: {
            ...props,
            children: children.map(child => 
                typeof child === 'string' ? createTextNode(child): child
            )
        }
    }
}
function createRealNode(type) {
    switch(type) {
        case NodeType.TEXT_NODE: {
            return document.createTextNode('')
        }
        default: {
            return document.createElement(type)
        }
    }
}
// 真实创建dom
function render({type, props}, parent) {
    const el = createRealNode(type)

    Object.keys(props).forEach(prop=> {
        if(prop !== 'children') {
            // el?.setAttribute(prop, props[prop])
            el[prop] = props[prop]
        }
    })
    const childrens = props.children || []
    childrens.forEach(children => {
            render(children, el)
    })
    parent.appendChild(el)
    return el
}
export default {
    createElement,
    render
}