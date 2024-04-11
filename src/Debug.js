import m from 'mithril';
import meiosisTracer from 'meiosis-tracer';
import "./styles/tracer.css";
import './styles/debug.css';

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

// export const DebugToggle = ({ state: { debugActive }, update }) =>
//   m(
//     `button.debug__toggle.${debugActive ? '.debug__toggle--open' : ''}`,
//     {
//       onclick: () => {
//         document.querySelector('.debug').classList.toggle('debug--open');
//         update({
//           debugActive: !debugActive,
//         });
//       },
//     },
//     m('.debug__toggle__bar .debug__toggle__bar__1'),
//     m('.debug__toggle__bar .debug__toggle__bar__2'),
//     m('.debug__toggle__bar .debug__toggle__bar__3')
//   );

export const DebugNavContent = (cell) =>
  m(
    `div.debug`,
    DeviceSize(cell),
    TracerToggle(cell),
    ColorToggle(cell)
  );

export const DeviceSize = (cell) =>
  m(
    `p.debug__deviceSize`,
    `${
      Math.round(parseFloat(
        document.documentElement.style.getPropertyValue('--vh')
      ) * 100)
    } x 
    ${
      Math.round(parseFloat(
        document.documentElement.style.getPropertyValue('--vw')
      ) * 100)
    }`
  );

export const TracerToggle = (cell) =>
  m(
    'button.debug__showTracer',
    {
      title: 'Toggle the Meiosis Tracer',
      onclick: () => { 
        const tracer = document.querySelector('#tracer');
        tracer.classList.toggle('hide');
      },
    },
    '🀤'
  )

export const ColorToggle = (cell) =>
  m(
    'button.debug__showColor',
    {
      title: 'Toggle the color scheme',
      onclick: () => {
        const page = document.querySelector('.page');
        page.classList.toggle('debug');
      },
    },
    '🀦'
  )

// Debug
export const Tracer = (cells) =>
  meiosisTracer({
    selector: '#tracer',
    rows: 25,
    streams: [{ label: 'Leo Stream', stream: cells }],
  });
