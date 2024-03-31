// 要解决问题
// import React from 'react';
// const App =  () => <div>mini react learn</div>
// export default App
import React from './core/react.ts'

const Bar = () => {
    console.log('bar')
    const [num, setNum] = React.useState(10)
    const [num1, setNum1] = React.useState(10)
    function handleClick() {
        setNum((num) => num + 10)
        setNum1((num) => num + 10)
    }
    React.useEffect(()=> {
        console.log('bar effect')
    }, [num1])
    return (
        <div id='bar'>
            bar
            count: {num}
            <button onClick={handleClick}>click</button>
        </div>
    )
}
// let num = 0
const App = () => {
    const [activeType, setActiveType] = React.useState('all')
    const [inputText, setInputText] = React.useState('')
    const [list, setList] = React.useState([])
    const typeList = [
        {
            text: '全部',
            id: 'all'
        },
        {
            text: '未完成',
            id: 'pending'
        },
        {
            text: '完成',
            id: 'done'
        }
    ]
    // const [showList, setShowList] = React.useState([])
    console.log(list)
    const showList = list.filter(item=> {
        if(activeType === 'all') return true
        return activeType === item.type
    })

    
    function handleClick() {
        setNum((num) => num + 10)
        setClickNum((num) => num + 1)
    }
    function handleInput(e) {
        setInputText(e.target.value)
        console.log(inputText, e.target.value)
    }
    function handleAddList() {
        const useInput = inputText;
        console.log(useInput)
        setList((list)=> {
            return list.concat([{
                text: 'xxx',
                type: 'pending',
                id: list.length
            }])
        })
        setInputText('')
    }
    function handleChangeType(type) {
        setActiveType(type.id)
    }
    function handleItemType(item) {
        setList((list)=> {
            list[item.id].type = 'done'
            return list
        })
    }
    return (
        <div id='app'>
            mini-react-learn
            <input value={inputText} onInput={handleInput}></input>
            <button onClick={handleAddList}>添加</button>
            <div class='tab'>
                {
                    ...typeList.map((type)=> {
                        return (
                            <div class='type' onClick={()=>handleChangeType(type)}>
                                <input type="radio" id={type.id} name='type' value={type.id} checked={type.id === activeType} />
                                <label for={type.id}>{type.text}</label>
                            </div>
                        )
                    })
                }
               
            </div>
            <ul class='list'>
                {
                    ...showList.map((item, index) => {
                        return <li>
                            {item.text}
                            {item.type === 'pending' &&<button onClick={()=> handleItemType(item, index)}>done</button>}
                            </li>
                    })
                }
            </ul>
        </div>
    )
}
export default App 