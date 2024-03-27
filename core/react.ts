enum NodeType {
    TEXT_NODE = 'text-node'
}
const SimpleTypeMap = ['string', 'number', 'undefined']
interface VDom {
    type: string,
    props: {
        children: VDom[],
        [prop: string]: any
    }
}
enum EffectTag {
    UP_DATE = 'update',
    PLACEMENT= 'placement'
}
interface FiberNode {
    type?: string;
    props?: Record<string, any>;
    child?: FiberNode | null;
    sibling?: FiberNode | null;
    dom: Element | null;
    parent?: FiberNode;
    alternate?: FiberNode; // 老的fiber节点
    effectTag?: EffectTag; // 更新类型
}
let nextWorkOfUnit:null | FiberNode = null
let root: null | FiberNode = null
let currentRoot: null | FiberNode = null // 当前需要更新的root


// 创建vdom使用
function createTextNode(text) {
    return {
        type: NodeType.TEXT_NODE,
        props: {
            nodeValue: text || ''
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
                const isSimpleType = SimpleTypeMap.includes(typeof child)
                return isSimpleType ? createTextNode(child): child
            })
        }
    }
}

// 创建fiber使用
// 创建fiber子节点
function initChildren(fiber) {
    let oldFiber = fiber?.alternate?.child || {}
    const {props} = fiber
    let preChild:FiberNode
    props?.children?.forEach((child, index) => {
        let childFiber:FiberNode
        const isSame = oldFiber?.type === child.type
        if(isSame) {
            childFiber = {
                type: child.type,
                props: child.props,
                dom: oldFiber.dom,
                parent: fiber,
                sibling: null,
                child: null,
                alternate: oldFiber,
                effectTag: EffectTag.UP_DATE
            }
        }else {
            // 创建
            childFiber = {
                type: child.type,
                props: child.props,
                dom: null,
                parent: fiber,
                sibling: null,
                child: null,
                effectTag: EffectTag.PLACEMENT
            }
           
        }
        if(oldFiber) {
            oldFiber = oldFiber.sibling
        }
        if(index === 0) {
            fiber.child = childFiber   
        }else {
            preChild.sibling = childFiber
        }
        preChild = childFiber
    })
}
// 创建dom节点
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
// 设置dom属性
function updateDomProps(dom, props) {
    Object.keys(props).forEach(prop=> {
        if(prop !== 'children') {
            if(prop.startsWith('on')) {
                const eventType = prop.slice(2).toLowerCase()
                dom.addEventListener(eventType, props[prop])
            }else {
                dom[prop] = props[prop]
            }
        }
    })
}
// 根据不同类型处理组件
function updateFunctionComponent(fiber) {
    fiber.props.children = [fiber.type(fiber.props)]
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
// 空闲执行 & 结束时挂载
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

// 更新dom
function updateProps(fiber) {
    const oldProps = fiber.alternate.props || [];
    const newProps = fiber.props;
    Object.keys(oldProps).forEach(prop => {
        if(prop !== 'children') {
            fiber.dom?.removeAttribute?.(prop)
        }
    })
    Object.keys(newProps).forEach(prop => {
        if(prop !== 'children') {
            fiber.dom[prop] =  newProps[prop]
        }
    })
} 
// 挂载dom
function commitRoot()  {
    if(!root) return 
    commitWork(root?.child)
    currentRoot = root
    root = null
}
function commitWork(fiber) {
    if(!fiber) return 
    // 获取有dom的parent
    let fiberParent = fiber.parent
    while(!fiberParent.dom) {
        fiberParent = fiberParent.parent
    }
    if(fiber?.effectTag === EffectTag.UP_DATE) { 
        updateProps(fiber)
    }else {
        if(fiber.dom) {
            fiberParent.dom?.appendChild(fiber.dom)
        }
    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}



// render 首次渲染
function render(el:VDom, parent) {
    nextWorkOfUnit = {
        dom: parent,
        props: {
            children: [el]
        },
    }
    root = nextWorkOfUnit;
    // 开启执行
    requestIdleCallback(workloop)
}
// 更新渲染
function update() {
    const nextFiber:FiberNode = {
        dom: (currentRoot as FiberNode).dom,
        props: (currentRoot as FiberNode).props,
        alternate: currentRoot as FiberNode
    }
    nextWorkOfUnit = nextFiber
    root = nextWorkOfUnit;
}

export default {
    createElement,
    render,
    update,
}