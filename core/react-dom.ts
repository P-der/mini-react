import react from "./react"
const ReactDom = {
    createRoot(root) {
        return {
            render(el) {
                react.render(el, root)
            }
        }
    }
}
export default ReactDom