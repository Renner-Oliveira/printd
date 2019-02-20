export function createStyle (doc: Document, cssText: string) {
  const style: HTMLStyleElement = doc.createElement('style')

  style.type = 'text/css'
  style.appendChild(window.document.createTextNode(cssText))

  return style
}

export function createStyleByUrl (doc: Document, url: string) {
  const style: HTMLLinkElement = doc.createElement('link')

  style.type = 'text/css'
  style.rel = 'stylesheet'
  style.href = url

  return style
}

export function createScriptByUrl (doc: Document, url: string) {
  const script: HTMLScriptElement = doc.createElement('script')

  script.src = url

  return script
}

export function createIFrame (parent: HTMLElement = window.document.body) {
  const el: HTMLIFrameElement = window.document.createElement('iframe')
  const css = 'visibility:hidden;width:0;height:0;position:absolute;z-index:-9999;bottom:0;'

  el.setAttribute('src', 'about:blank')
  el.setAttribute('style', css)
  el.setAttribute('width', '0')
  el.setAttribute('height', '0')
  el.setAttribute('wmode', 'opaque')

  parent.appendChild(el)

  return el
}

export interface PrintdCallbackArgs {
  /** Iframe reference */
  iframe: HTMLIFrameElement
  /** HTMLElement copy reference */
  element?: HTMLElement
  /** Function to launch the print dialog after content was loaded */
  launchPrint: Function
}

export type PrintdCallback = (args: PrintdCallbackArgs) => void

/** Printd class that prints HTML elements in a blank document */
export default class Printd {
  private readonly iframe: HTMLIFrameElement
  private loading = false
  private callback?: PrintdCallback
  private elCopy?: HTMLElement

  constructor (private readonly parent: HTMLElement = window.document.body) {
    this.iframe = createIFrame(this.parent)
    this.iframe.addEventListener('load', () => this.loadEvent(), false)
  }

  /** Gets current Iframe reference */
  getIFrame () {
    return this.iframe
  }

  /**
   * Print an HTMLElement
   *
   * @param el HTMLElement
   * @param cssText Optional CSS Text that will add to head section of the iframe document
   * @param cssURLs Optional list of CSS files URLs that will add to head section of the iframe document
   * @param scriptURLs Optional list of Script files URLs that will add to iframe document
   * @param callback Optional callback that will be triggered when content is ready to print
   */
  print (el: HTMLElement, cssText?: string, cssURLs?: Array<string>, scriptURLs?: Array<string>, callback?: PrintdCallback) {
    if (this.loading) return

    const { contentDocument, contentWindow } = this.iframe

    if (!contentDocument || !contentWindow) return

    this.iframe.src = 'about:blank'
    this.elCopy = el.cloneNode(true) as HTMLElement

    if (this.elCopy) {
      this.loading = true
      this.callback = callback

      const doc = contentWindow.document

      doc.open()
      doc.write(`
        <!DOCTYPE html><html><head><meta charset="utf-8"></head><body></body></html>
      `)

      if (cssText) {
        doc.head.appendChild(createStyle(doc, cssText))
      }
      if (cssURLs) {
        cssURLs.forEach((url) => {
          doc.head.appendChild(createStyleByUrl(doc, url))
        })
      }
      doc.body.appendChild(this.elCopy)
      if (scriptURLs) {
        scriptURLs.forEach((url) => {
          doc.body.appendChild(createScriptByUrl(doc, url))
        })
      }

      doc.body.appendChild(this.elCopy)
      doc.close()
    }
  }

  /**
   * Print an URL
   *
   * @param url URL to print
   * @param callback Optional callback that will be triggered when content is ready to print
   */
  printURL (url: string, callback?: PrintdCallback) {
    if (this.loading) return

    this.loading = true
    this.callback = callback
    this.iframe.src = url
  }

  private launchPrint (contentWindow: Window) {
    const result = contentWindow.document.execCommand('print', false, null)

    if (!result) {
      contentWindow.print()
    }
  }

  private loadEvent () {
    if (this.iframe) {
      this.loading = false

      const { contentDocument, contentWindow } = this.iframe

      if (!contentDocument || !contentWindow) return

      if (this.callback) {
        this.callback({
          iframe: this.iframe,
          element: this.elCopy,
          launchPrint: () => this.launchPrint(contentWindow)
        })
      } else {
        this.launchPrint(contentWindow)
      }
    }
  }
}

export { Printd }
