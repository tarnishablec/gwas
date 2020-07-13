import {
  render,
  component,
  html,
  ReactiveElement,
  useState,
  repeat,
  useMemo
} from '@gallop/gallop'
import { SwaggerSource, Method, methods } from './swagger'
import { keysOf } from './utils'

component('app-root', function (this: ReactiveElement) {
  const [state] = useState<{
    queryResult?: unknown
    controller?: string
    swagger?: { filename: string; source: SwaggerSource }
  }>({})

  const [controllers] = useMemo(() => state.swagger?.source.queryControllers())

  const [urls] = useMemo(() => {
    console.log(state.controller)
    return state.swagger
      ? keysOf(state.swagger.source.queryPaths(state.controller ?? '') ?? {})
      : []
  }, [state.controller, state.swagger?.source])

  return html`
    <div>
      <input
        type="file"
        accept=".json"
        @change="${async (e: InputEvent) => {
          const input = e.target as HTMLInputElement
          if (!input.files) return
          const swags = []
          for (let i = 0; i < input.files.length; i++) {
            const swag = new SwaggerSource()
            const file = input.files[i]
            const { name: filename } = file
            await swag.init(file)
            swags.push({ filename, source: swag })
          }
          state.swagger = swags[0]
          console.log(state.swagger)
        }}"
      />
    </div>
    <hr />
    <div>
      files:[${state.swagger?.filename}]
    </div>
    <hr />
    <div>
      <select
        id="controller-list"
        name="controller"
        .value="${state.controller}"
        @change="${(e: Event) => {
          state.controller = (e.target as HTMLSelectElement).selectedOptions[0].value
        }}"
      >
        ${repeat(
          controllers ?? [],
          (item) => item!,
          (item) => html` <option .value="${item}">${item}</option>`
        )} </select
      >controller<br />
      <select name="url" id="url-list">
        ${repeat(
          urls,
          (item) => item,
          (item) => html`<option .value="${item}">${item}</option>`
        )} </select
      >url<br />
      <select name="method" id="method-list">
        ${repeat(
          methods,
          (item) => item,
          (item) => html`<option .value="${item}">${item}</option>`
        )}
      </select>
    </div>
    <button
      @click="${() => {
        if (!state.swagger) {
          alert('no data source')
          return
        }
        const controller = state.controller ?? ''
        const url = (this.$root.querySelector('#url-list') as HTMLSelectElement)
          .selectedOptions[0].value
        const method = (this.$root.querySelector(
          '#method-list'
        ) as HTMLSelectElement).selectedOptions[0].value as Method
        const source = state.swagger.source
        const result = source.queryDetail(controller, url, method)
        state.queryResult = result
      }}"
    >
      query
    </button>
    <hr />
    <code>
      ${state.queryResult}
    </code>

    <style>
      input,
      select {
        width: 300px;
      }
    </style>
  `
})

render(html` <app-root></app-root> `)
