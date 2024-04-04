import m from 'mithril';
import meiosisTracer from 'meiosis-tracer';
import './styles/debug.css';

export const DebugDeviceSize = () =>
  m(
    `#deviceSize`,
    `${
      parseFloat(document.documentElement.style.getPropertyValue('--vh')) * 100
    } x 
     ${
       parseFloat(document.documentElement.style.getPropertyValue('--vw')) * 100
     }`
  );

export const DebugToggle = ({ state: { debugActive }, update }) =>
  m(
    `#debugNavToggle${debugActive ? '.open' : ''}`,
    {
      onclick: () => {
        update({
          debugActive: !debugActive,
        });
      },
    },
    m('.bar.b1'),
    m('.bar.b2'),
    m('.bar.b3')
  );

export const DebugNav = (cell) =>
  m(
    `#debugNav`,
    DebugDeviceSize(),
    m(
      '#tracerToggle',
      {
        onclick: () => {
          const tracer = document.getElementById('tracer');
          tracer.classList.toggle('hide');
          const button = document.getElementById('tracerStreamHide_0');
          button.click();
        },
      },
      '🀤' //'✒'
    ),
    m(
      '#colorToggle',
      {
        onclick: () => {
          const tracer = document.getElementById('page');
          tracer.classList.toggle('debug');
        },
      },
      '🀦'
    )
  );

// Debug
export const tracer = (cells) =>
  meiosisTracer({
    selector: '#tracer',
    rows: 25,
    width: '100%',
    streams: [{ stream: cells, hide: true, label: 'Leo' }],
  });
