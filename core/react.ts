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
let root: null | FiberNode = null

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
            children: children.map(child => {
                const isSimpleType = ['string', 'number'].includes(typeof child)
                return isSimpleType ? createTextNode(child): child
            })
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
function initChildren(fiber) {
    const {props} = fiber
    let preChild:FiberNode
    props?.children?.forEach((child, index) => {
        const childFiber:FiberNode = {
            type: child.type,
            props: child.props,
            dom: null,
            parent: fiber,
            sibling: null,
            child: null
        }
        if(index === 0) {
            fiber.child = childFiber   
        }else {
            preChild.sibling = childFiber
        }
        preChild = childFiber
    })
}
// 真实创建dom
function render(el:VDom, parent) {
    nextWorkOfUnit = {
        dom: parent,
        props: {
            children: [el]
        }
    }
    root = nextWorkOfUnit;
    // 开启执行
    requestIdleCallback(workloop)
}


function workloop(deadline) {
    let shouldYield = false
    while(!shouldYield && nextWorkOfUnit) {
        nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
        shouldYield = deadline.timeRemaining() < 1
    }
    if(!nextWorkOfUnit) {
        commitRoot()
    }
    requestIdleCallback(workloop)
}
function commitRoot()  {
    commitWork(root?.child)
    root = null
}
function commitWork(fiber) {
    if(!fiber) return 
    let nextChild = fiber
    while(!nextChild.dom) {
        nextChild = nextChild.child
    }
    fiber.parent.dom?.appendChild(nextChild.dom)
    commitWork(nextChild.child)
    commitWork(nextChild.sibling)
}
function updateFunctionComponent(fiber) {
    fiber.props.children = [fiber.type(fiber.props)]
    console.log(fiber.props.children)
} 
function updateHostComponent(fiber) {
    const {type, props = []} = fiber
    // 1 创建dom
    if(!fiber.dom) {
        fiber.dom = createRealNode(type)
        // 2 更新prop
        updateDomProps(fiber.dom, props)
    }
}
// task具体执行 1 2 原操作；3 4 生成下一个task
function performWorkOfUnit(fiber) {
    const {type, props, parent} = fiber
    const isFunctionComponent =  typeof type === 'function'
    if(isFunctionComponent) {
        updateFunctionComponent(fiber)
    }else {
        updateHostComponent(fiber)
    }

    // 3 遍历children
    initChildren(fiber)
    // 4 返回下一个fiber
    fiber.next = (deep = false) => {
        if(!deep && fiber.child) {
            return fiber.child
        }
        if(fiber.sibling) {
            return fiber.sibling
        }
        return fiber?.parent?.sibling || fiber?.parent?.next?.(true)
    }
    return fiber.next()
}


export default {
    createElement,
    render
}