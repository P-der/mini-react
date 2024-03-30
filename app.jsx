// 要解决问题
// import React from 'react';
// const App =  () => <div>mini react learn</div>
// export default App
import React from './core/react.ts'
// let fooNum = 0
// const Foo = () => {
//     console.log('foo')
//     const update = React.update()
//     function handleClick() {
//         fooNum ++
//         update()
//     }
//     return (
//         <div id='foo'>
//             foo
//             count: {fooNum}
//             <button onClick={handleClick}>click</button>
//         </div>
//     )
// }
// let barNum = 0
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
    const [num, setNum] = React.useState(10)
    const [clickNum, setClickNum] = React.useState(1)
    console.log('app')
    function handleClick() {
        setNum((num) => num + 10)
        setClickNum((num) => num + 1)
    }
    React.useEffect(()=> {
        console.log('use effect, app')
        return () =>  {
            console.log('clean')
        }
    }, [num])
    return (
        <div id='app'>
            mini-react-learn
            <div>
                count: {num}
            </div>
            <div>
                click: {clickNum}
            </div>
            <button onClick={handleClick}>click</button>
            {/* <Foo/> */}
            <Bar/>
        </div>
    )
}
export default App 