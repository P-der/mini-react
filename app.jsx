// 要解决问题
// import React from 'react';
// const App =  () => <div>mini react learn</div>
// export default App
import React from './core/react.ts'
const Test1 = () => {
    return (
        <div>
            test1
        </div>
    )
}
const Test = () => {
    return (
        <div className="abc">
            Test
            <Test1/>
        </div>
    )
}
const App = () =>( 
    <div id='app'>
        mini-react-learn
        <Test></Test>
        {/* <div>1
            <div>1-1
                <div>1-1-1</div>
                <div>1-1-2</div>
                <div>1-1-3</div>
            </div>
        </div>
        <div>2</div> */}
    </div>
)
export default App 