import { Printd } from '../src/index'

const d = new Printd()

const content = document.getElementById('myContent')
const btn = document.getElementById('myButton')

const cssText = `
  button {
    background-color: #fff;
    border: solid 2px peru;
    border-radius: 5px;
    color: peru;
    font-size: 16pt;
    font-weight: bold;
    padding: 10px;
    width: 200px;
  }
`

btn.addEventListener('click', printElement)

function printElement () {
  d.print(content, cssText, ({ launchPrint }) => {
    console.log('Content loaded!')

    // fire printing!
    launchPrint()
  })
}
