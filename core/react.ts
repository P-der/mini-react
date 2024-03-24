enum NodeType {
    TEXT_NODE = 'text-node'
}
interface VDom {
    type: string,
    props: {
        children: VDom[],
        [prop: string]: any
    }
}
interface FiberNode {
    type?: string;
    props?: Record<string, any>;
    child?: FiberNode | null;
    sibling?: FiberNode | null;
    dom: Element | null;
    parent?: FiberNode;
}
let nextWorkOfUnit:null | FiberNode = null

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
function updateDomProps(dom, props) {
    Object.keys(props).forEach(prop=> {
        if(prop !== 'children') {
            dom[prop] = props[prop]
        }
    })
}
// 真实创建dom
function render(el:VDom, parent) {
    nextWorkOfUnit = {
        dom: null,
        type: el.type,
        props: el.props,
        parent: {
            dom: parent
        },
        child: null,
        sibling: null
    }
    // 开启执行
    requestIdleCallback(workloop)
}


function workloop(deadline) {
    let shouldYield = false
    while(!shouldYield && nextWorkOfUnit) {
        nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
        shouldYield = deadline.timeRemaining() < 1
    }
    requestIdleCallback(workloop)
}
// task具体执行 1 2 原操作；3 4 生成下一个task
function performWorkOfUnit(work) {
    const {type, props, parent} = work
    // 1 创建dom
    if(!work.dom) {
       work.dom = createRealNode(type)
    }
    work.parent.dom.appendChild(work.dom)
    // 2 更新prop
    updateDomProps(work.dom, props)
    // 3 遍历children
    let preChild:FiberNode
    props.children?.forEach((child, index) => {
        const newChild:FiberNode = {
            type: child.type,
            props: child.props,
            dom: null,
            parent,
            sibling: null,
            child: null
        }
        if(index === 0) {
            work.child = newChild   
        }else {
            preChild.sibling = newChild
        }
        preChild = child
    })
    // 4 返回下一个work
    if(work.child) {
        return work.child
    }
    if(work.sibling) {
        return work.sibling
    }
    return work?.parent?.sibling
}


export default {
    createElement,
    render
}