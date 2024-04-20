import m from 'mithril'
import meiosisTracer from 'meiosis-tracer'
import './tracer.css'
import './debug.css'

// debug
// debug--open

// debug__toggle
// debug__toggle--open
// debug__toggle__bar
// debug__toggle__bar__1
// debug__toggle__bar__2
// debug__toggle__bar__3

// debug__navigation
// debug__deviceSize
// debug__showTracer
// debug__showColor

export const DebugNavContent = cell =>
  m(
    `div.debug`,
    DeviceSize(cell),
    TracerToggle(cell),
    BackgroundColorToggle(cell),
    ColorToggle(cell)
  )

export const DeviceSize = cell =>
  m(
    `p.debug__deviceSize`,
    `${Math.round(
      parseFloat(document.documentElement.style.getPropertyValue('--vh')) * 100
    )} x 
    ${Math.round(
      parseFloat(document.documentElement.style.getPropertyValue('--vw')) * 100
    )}`
  )

export const TracerToggle = cell =>
  m(
    `button.hide.debug__showTracer${cell.state.debug.tracer ? '.active' : ''}`,
    {
      title: 'Toggle the Meiosis Tracer',
      onclick: () => {
        cell.update({ debug: { tracer: !cell.state.debug.tracer } })
        const tracer = document.querySelector('#tracer')
        tracer.classList.toggle('hide')
      },
    },
    '🀀'
  )

export const BackgroundColorToggle = cell =>
  m(
    `button.debug__showBackgroundColor`,
    {
      class: cell.state.debug.darkMode ? 'active' : '',
      title: 'Toggle the background color scheme',
      onclick: () => {
        cell.update({ debug: { darkMode: !cell.state.debug.darkMode } })
      },
    },
    '🀦'
  )

export const ColorToggle = cell =>
  m(
    'button.debug__showColor',
    {
      class: cell.state.debug.color ? 'active' : '',
      title: 'Toggle the color scheme',
      onclick: () => {
        cell.update({ debug: { color: !cell.state.debug.color } })
      },
    },
    '🀤'
  )

// Debug
export const Tracer = cells => {
  meiosisTracer({
    selector: '#tracer',
    rows: 25,
    streams: [{ label: 'Leo Stream', stream: cells }],
  })
  const tracer = document.querySelector('#tracer')
  tracer.classList.toggle('hide')
}
