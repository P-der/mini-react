enum NodeType {
    TEXT_NODE = 'text-node'
}
const SimpleTypeMap = ['string', 'number']
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
interface StateHook {
    value: any;
    queue: any[];
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
    stateHooks?: StateHook[]
}
let nextWorkOfUnit:null | FiberNode = null
let currentRoot: null | FiberNode = null // 当前需要更新的root
let deleteFiberList:FiberNode[] = []
let wipCurrentFiber: FiberNode // wipFiber
let currentStateList: StateHook[] = []
let currentStateIndex = 0
let effectList = []
// 创建vdom使用
function createTextNode(text) {
    text = SimpleTypeMap.includes(typeof text) ? text: text || ''
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
                const isSimpleType = typeof child !== 'object'
                return isSimpleType ? createTextNode(child): child
                //  typeof child === 'array' ? : child
            })
        }
    }
}

// 创建fiber使用
// 创建fiber子节点
function initChildren(fiber, children) {
    let oldFiber = fiber?.alternate?.child || null
    let preChild:FiberNode
    if(fiber?.type === 'ul') {
        console.log(deleteFiberList)
        debugger;
    }
    children?.forEach((child, index) => {
        let childFiber:FiberNode
        const isSame = oldFiber && oldFiber.type === child.type
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
            if(child) {
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
            
            oldFiber && deleteFiberList.push(oldFiber)
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
    while(oldFiber) {
        deleteFiberList.push(oldFiber)
        oldFiber = oldFiber.sibling
    }
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
    currentStateList = []
    effectList = []
    currentStateIndex = 0
    wipCurrentFiber = fiber
    const children = [fiber.type(fiber.props)]
     // 3 遍历children
    initChildren(fiber, children)
} 
function updateHostComponent(fiber) {
    const {type, props = []} = fiber
    // 1 创建dom
    if(!fiber.dom) {
        fiber.dom = createRealNode(type)
        // 2 更新prop
        updateDomProps(fiber.dom, props)
    }
     // 3 遍历children
     const children = fiber.props.children;
     initChildren(fiber, children)
}
// task具体执行 1 2 原操作；3 4 生成下一个task
function performWorkOfUnit(fiber) {
    const {type} = fiber
    const isFunctionComponent =  typeof type === 'function'
    if(isFunctionComponent) {
        updateFunctionComponent(fiber)
    }else {
        updateHostComponent(fiber)
    }

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
        if(currentRoot?.sibling?.type === nextWorkOfUnit?.type) {
            nextWorkOfUnit = null
        }
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
    if(!currentRoot) return 
    commitRemoveWork()
    console.log(currentRoot)
    commitWork(currentRoot?.child)
    commitEffect()
    deleteFiberList = []
    currentRoot = null
}
function removeChild(fiber) {
    if(!fiber?.dom) {
        removeChild(fiber.child)
        return;
    }
    // 获取有dom的parent
    let fiberParent = fiber.parent
    while(!fiberParent.dom) {
        fiberParent = fiberParent.parent
    }
    fiberParent?.dom?.removeChild(fiber?.dom)
}
function commitRemoveWork() {
    deleteFiberList.forEach(deleteFiber => {
        removeChild(deleteFiber)
    })
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
function commitEffect() {
    function run (fiber) {
        if(!fiber) return
        if(fiber.alternate) {
            // update
            const oldEffectList = fiber.alternate?.effectHooks || []
            if(oldEffectList) {
                oldEffectList.forEach((old)=> {
                    old?.clean?.()
                })
            }
            fiber.effectHooks?.forEach((effect, index)=> {
                const oldEffect = oldEffectList[index]
                const needUpdate = effect.deps.some((dep, i)=> {
                    return dep !== oldEffect.deps[i]
                })
                needUpdate && (effect.clean = effect.callback())
            })
        }else {
            fiber.effectHooks?.forEach((effect)=>  {
                effect.clean = effect.callback()
            })
        }
        run(fiber.child)
        run(fiber.sibling)
    }
    run(currentRoot)
}



// render 首次渲染
function render(el:VDom, parent) {
    nextWorkOfUnit = {
        dom: parent,
        props: {
            children: [el]
        },
    }
    currentRoot = nextWorkOfUnit;
    // 开启执行
    requestIdleCallback(workloop)
}
// 更新渲染
function update() {
    let currentFiber = wipCurrentFiber
    return function update() {
        currentRoot = currentFiber = {
           ...currentFiber,
            alternate: currentFiber as FiberNode
        }
        nextWorkOfUnit = currentRoot
    }
}

function useState(initValue) {
    let currentFiber = wipCurrentFiber // 保存当前fiber
    let currentIndex = currentStateIndex // 保存当前index
    let oldStateHook = currentFiber.alternate?.stateHooks?.[currentIndex] // 获取老节点
    currentStateIndex++ // 重新计数
    const stateHook: StateHook = {
        value: oldStateHook ? oldStateHook.value : initValue,
        queue: []
    }
    oldStateHook?.queue.forEach(action=> {
        stateHook.value = typeof action === 'function' ? action(stateHook.value) : action
    })
    currentStateList.push(stateHook)
    currentFiber.stateHooks = currentStateList
    function setState(action) {
        const newValue = typeof action === 'function' ? action(stateHook.value) : action
        if(newValue === stateHook.value) return
        stateHook.queue.push(typeof action === 'function'? action: () => action)
        currentRoot = {
            ...currentFiber,
            alternate: currentFiber
        }
        nextWorkOfUnit = currentRoot
    }
    return [stateHook.value, setState]
}

function useEffect(callback, deps) {
    let effect = {
        callback, 
        deps
    }
    effectList.push(effect)
    wipCurrentFiber.effectHooks = effectList
    console.log(2, '最新的')
}
export default {
    createElement,
    render,
    update,
    useState,
    useEffect
}