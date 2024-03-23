enum NodeType {
    TEXT_NODE = 'text-node'
}
function createNode(type) {
    switch(type) {
        case NodeType.TEXT_NODE: {
            return document.createTextNode('')
        }
        default: {
            return document.createElement(type)
        }
    }
}
function createElement(type, props,...children) {
    return {
        type, 
        props: {
            ...props,
            children
        }
    }
}
function render({type, props}, parent) {
    const el = createNode(type)

    Object.keys(props).forEach(prop=> {
        if(prop !== 'children') {
            // el?.setAttribute(prop, props[prop])
            el[prop] = props[prop]
        }
    })
    const childrens = props.children || []
    childrens.forEach(children => {
        if(typeof children === 'string') {
            render({type: NodeType.TEXT_NODE, props: {nodeValue: children}}, el)
        }else {
            render(children, el)
        }
    })
    parent.appendChild(el)
    return el
}
export default {
    createElement,
    render
}