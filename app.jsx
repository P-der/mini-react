// 要解决问题
// import React from 'react';
// const App =  () => <div>mini react learn</div>
// export default App
import React from './core/react.ts'
let num = 10
const {update} = React
const Count = () => {
    function handleClick() {
        num ++
        update()
    }
    return (
        <div>
            count {num}
            <button onClick={handleClick}>click</button>
        </div>
    )
}
const App = () => (
    <div id='app'>
        mini-react-learn
        <Count></Count>
    </div>
)
export default App 