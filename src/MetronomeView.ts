import m from 'mithril'
import { metronomeService } from './MetronomeService'
import './styles/metronome.css'

interface MetronomeViewProps {
  onStateChange?: (isPlaying: boolean) => void
}

// View-only component that displays and controls the persistent metronome service
const MetronomeView: m.Component<MetronomeViewProps> = {
  oninit(vnode) {
    // Set up the state change callback
    if (vnode.attrs.onStateChange) {
      metronomeService.setStateChangeCallback(vnode.attrs.onStateChange)
    }
  },

  view(vnode) {
    const state = {
      isPlaying: metronomeService.getIsPlaying(),
      tempo: metronomeService.getTempo(),
      beatType: metronomeService.getBeatType(),
      volume: metronomeService.getVolume(),
      muteChance: metronomeService.getMuteChance(),
      rhythmPattern: metronomeService.getPattern(),
      emphasizeFirstBeat: metronomeService.getEmphasizeFirstBeat(),
      savedPatterns: metronomeService.getSavedPatterns(),
      currentStep: metronomeService.getCurrentNote(),
    }

    const updateState = () => {
      m.redraw()
    }

    const toggleMetronome = () => {
      metronomeService.toggle()
      updateState()
    }

    const setTempo = (newTempo: number) => {
      metronomeService.setTempo(newTempo)
      updateState()
    }

    const setBeatType = (newBeatType: number) => {
      metronomeService.setBeatType(newBeatType)
      updateState()
    }

    const setVolume = (newVolume: number) => {
      metronomeService.setVolume(newVolume)
      updateState()
    }

    const setMuteChance = (newMuteChance: number) => {
      metronomeService.setMuteChance(newMuteChance)
      updateState()
    }

    const addNoteToPattern = (noteValue: number) => {
      metronomeService.addNoteToPattern(noteValue)
      updateState()
    }

    const removeNoteFromPattern = (index: number) => {
      metronomeService.removeNoteFromPattern(index)
      updateState()
    }

    const clearPattern = () => {
      metronomeService.clearPattern()
      updateState()
    }

    const toggleEmphasize = () => {
      metronomeService.setEmphasizeFirstBeat(
        !metronomeService.getEmphasizeFirstBeat()
      )
      updateState()
    }

    const savePattern = (name: string) => {
      metronomeService.savePattern(name)
      updateState()
    }

    const loadPattern = (index: number) => {
      metronomeService.loadPattern(index)
      updateState()
    }

    const deletePattern = (index: number) => {
      metronomeService.deletePattern(index)
      updateState()
    }

    // Note symbols
    const noteSymbols: { [key: number]: string } = {
      0.125: '𝅘𝅥𝅯𝅭', // 32nd note
      0.25: '𝅘𝅥𝅯', // 16th note
      0.375: '𝅘𝅥𝅯.', // Dotted 16th note
      0.5: '♪', // 8th note
      0.75: '♪.', // Dotted 8th note
      1: '♩', // Quarter note
      1.5: '♩.', // Dotted quarter note
      2: '𝅗𝅥', // Half note
      3: '𝅗𝅥.', // Dotted half note
      4: '𝅝', // Whole note
      6: '𝅝.', // Dotted whole note
    }

    // Rest symbols - using strings to avoid negative key issues
    const restSymbols: { [key: string]: string } = {
      '-0.125': '𝄿', // 32nd rest
      '-0.25': '𝄿.', // 16th rest
      '-0.375': '𝄾.', // Dotted 16th rest
      '-0.5': '𝄾', // 8th rest
      '-0.75': '𝄾.', // Dotted 8th rest
      '-1': '𝄽', // Quarter rest
      '-1.5': '𝄽.', // Dotted quarter rest
      '-2': '𝄼', // Half rest
      '-3': '𝄼.', // Dotted half rest
      '-4': '𝄻', // Whole rest
      '-6': '𝄻.', // Dotted whole rest
    }

    const getSymbol = (value: number) => {
      if (value < 0) {
        return restSymbols[value.toString()] || '𝄼'
      } else {
        return noteSymbols[value] || '♩'
      }
    }

    return m('div.metronome', [
      // Tempo Control
      m('div.tempo-section', [
        m('div.tempo-controls', [
          m('label', 'Tempo'),
          m('div.tempo-display', [
            m('input', {
              type: 'range',
              min: 20,
              max: 300,
              value: state.tempo,
              oninput: (e: any) => setTempo(parseInt(e.target.value) || 120),
            }),
            m('input', {
              type: 'number',
              min: 20,
              max: 300,
              value: state.tempo,
              oninput: (e: any) => setTempo(parseInt(e.target.value) || 120),
            }),
            m('span', 'BPM'),
          ]),
        ]),

        // Beat Type Selectors
        m('div.beat-type-controls', [
          m('label', 'Beat Type'),
          m('div.beat-type-buttons', [
            m(
              'button.beat-type-btn',
              {
                class: state.beatType === 1 ? 'active' : '',
                onclick: () => setBeatType(1),
                title: 'Whole note = BPM',
              },
              [m('div', '𝅝'), m('div.status', '')]
            ),
            m(
              'button.beat-type-btn',
              {
                class: state.beatType === 2 ? 'active' : '',
                onclick: () => setBeatType(2),
                title: 'Half note = BPM',
              },
              [m('div', '𝅗𝅥'), m('div.status', '')]
            ),
            m(
              'button.beat-type-btn',
              {
                class: state.beatType === 4 ? 'active' : '',
                onclick: () => setBeatType(4),
                title: 'Quarter note = BPM',
              },
              [m('div', '♩'), m('div.status', '')]
            ),
            m(
              'button.beat-type-btn',
              {
                class: state.beatType === 8 ? 'active' : '',
                onclick: () => setBeatType(8),
                title: 'Eighth note = BPM',
              },
              [m('div', '♪'), m('div.status', '')]
            ),
            m(
              'button.beat-type-btn',
              {
                class: state.beatType === 16 ? 'active' : '',
                onclick: () => setBeatType(16),
                title: 'Sixteenth note = BPM',
              },
              [m('div', '𝅘𝅥𝅯'), m('div.status', '')]
            ),
          ]),
        ]),
      ]),

      // Volume Control
      m('div.volume-section', [
        m('label', 'Volume'),
        m('input', {
          type: 'range',
          min: 0,
          max: 100,
          value: state.volume,
          oninput: (e: any) => setVolume(parseInt(e.target.value)),
        }),
        m('span.volume-display', `${state.volume}%`),
      ]),

      // Random Mute Control
      m('div.mute-section', [
        m('label', 'Random Mute'),
        m('input', {
          type: 'range',
          min: 0,
          max: 100,
          value: state.muteChance,
          oninput: (e: any) => setMuteChance(parseInt(e.target.value)),
        }),
        m('span.mute-display', `${state.muteChance}%`),
      ]),

      // Play/Stop Button
      m('div.play-controls', [
        m(
          'button.play-btn',
          {
            class: state.isPlaying ? 'playing' : '',
            onclick: toggleMetronome,
          },
          state.isPlaying ? '⏸ Stop' : '▶ Play'
        ),
      ]),

      // Rhythm Pattern Section
      m('div.rhythm-section', [
        m('div.section-header', [m('h3', 'Rhythm Pattern')]),

        m('div.rhythm-display', [
          m('div.pattern-actions', [
            m(
              'button.action-icon',
              {
                onclick: toggleEmphasize,
                class: state.emphasizeFirstBeat ? 'active' : '',
                title: state.emphasizeFirstBeat
                  ? 'Disable emphasis'
                  : 'Emphasize first beat',
              },
              '💥'
            ),
            m(
              'button.action-icon',
              {
                onclick: clearPattern,
                title: 'Clear pattern',
              },
              '🗑'
            ),
          ]),

          m('div.pattern-notes', [
            state.rhythmPattern.map((note, index) =>
              m(
                'span.note',
                {
                  key: index,
                  class: index === state.currentStep ? 'active' : '',
                  onclick: () => removeNoteFromPattern(index),
                  title: `Click to remove ${note < 0 ? 'rest' : 'note'}`,
                },
                m('span.note-symbol', getSymbol(note))
              )
            ),
          ]),
        ]),

        // Note Input Section - Unified Grid
        m('div.note-input', [
          m('label', 'Add Notes & Rests'),
          m('div.note-grid', [
            // Regular Notes Row
            m(
              'button.note-btn',
              { onclick: () => addNoteToPattern(4), title: 'Whole Note' },
              '𝅝'
            ),
            m(
              'button.note-btn',
              { onclick: () => addNoteToPattern(2), title: 'Half Note' },
              '𝅗𝅥'
            ),
            m(
              'button.note-btn',
              { onclick: () => addNoteToPattern(1), title: 'Quarter Note' },
              '♩'
            ),
            m(
              'button.note-btn',
              { onclick: () => addNoteToPattern(0.5), title: 'Eighth Note' },
              '♪'
            ),
            m(
              'button.note-btn',
              {
                onclick: () => addNoteToPattern(0.25),
                title: 'Sixteenth Note',
              },
              '𝅘𝅥𝅯'
            ),

            // Dotted Notes Row
            m(
              'button.note-btn',
              {
                onclick: () => addNoteToPattern(6),
                title: 'Dotted Whole Note',
              },
              '𝅝.'
            ),
            m(
              'button.note-btn',
              { onclick: () => addNoteToPattern(3), title: 'Dotted Half Note' },
              '𝅗𝅥.'
            ),
            m(
              'button.note-btn',
              {
                onclick: () => addNoteToPattern(1.5),
                title: 'Dotted Quarter Note',
              },
              '♩.'
            ),
            m(
              'button.note-btn',
              {
                onclick: () => addNoteToPattern(0.75),
                title: 'Dotted Eighth Note',
              },
              '♪.'
            ),
            m(
              'button.note-btn',
              {
                onclick: () => addNoteToPattern(0.375),
                title: 'Dotted Sixteenth Note',
              },
              '𝅘𝅥𝅯.'
            ),

            // Regular Rests Row
            m(
              'button.rest-btn',
              { onclick: () => addNoteToPattern(-4), title: 'Whole Rest' },
              '𝄺'
            ),
            m(
              'button.rest-btn',
              { onclick: () => addNoteToPattern(-2), title: 'Half Rest' },
              '𝄼'
            ),
            m(
              'button.rest-btn',
              { onclick: () => addNoteToPattern(-1), title: 'Quarter Rest' },
              '𝄽'
            ),
            m(
              'button.rest-btn',
              { onclick: () => addNoteToPattern(-0.5), title: 'Eighth Rest' },
              '𝄾'
            ),
            m(
              'button.rest-btn',
              {
                onclick: () => addNoteToPattern(-0.25),
                title: 'Sixteenth Rest',
              },
              '𝅘𝅥𝅯'
            ),

            // Dotted Rests Row
            m(
              'button.rest-btn',
              {
                onclick: () => addNoteToPattern(-6),
                title: 'Dotted Whole Rest',
              },
              '𝄻.'
            ),
            m(
              'button.rest-btn',
              {
                onclick: () => addNoteToPattern(-3),
                title: 'Dotted Half Rest',
              },
              '𝄼.'
            ),
            m(
              'button.rest-btn',
              {
                onclick: () => addNoteToPattern(-1.5),
                title: 'Dotted Quarter Rest',
              },
              '𝄽.'
            ),
            m(
              'button.rest-btn',
              {
                onclick: () => addNoteToPattern(-0.75),
                title: 'Dotted Eighth Rest',
              },
              '𝄾.'
            ),
            m(
              'button.rest-btn',
              {
                onclick: () => addNoteToPattern(-0.375),
                title: 'Dotted Sixteenth Rest',
              },
              '𝅘𝅥𝅯.'
            ),
          ]),
        ]),
      ]),

      // Saved Patterns Section
      m('div.saved-patterns-section', [
        m('h3', 'Saved Patterns'),
        m('div.pattern-input', [
          m('input', {
            type: 'text',
            placeholder: 'Pattern name',
            id: 'pattern-name-input',
          }),
          m(
            'button',
            {
              onclick: () => {
                const input = document.getElementById(
                  'pattern-name-input'
                ) as HTMLInputElement
                if (input && input.value.trim()) {
                  savePattern(input.value.trim())
                  input.value = ''
                }
              },
            },
            'Save Current Pattern'
          ),
        ]),

        m(
          'div.saved-patterns-list',
          state.savedPatterns.length === 0
            ? m('p.no-patterns', 'No saved patterns')
            : state.savedPatterns.map((savedPattern, index) =>
                m(
                  'div.saved-pattern',
                  {
                    key: index,
                  },
                  [
                    m('span.pattern-name', savedPattern.name),
                    m(
                      'span.pattern-preview',
                      savedPattern.pattern
                        .map(note => getSymbol(note))
                        .join(' ')
                    ),
                    m('div.saved-pattern-actions', [
                      m(
                        'button.load-btn',
                        {
                          onclick: () => loadPattern(index),
                        },
                        'Load'
                      ),
                      m(
                        'button.delete-btn',
                        {
                          onclick: () => deletePattern(index),
                        },
                        'Delete'
                      ),
                    ]),
                  ]
                )
              )
        ),
      ]),
    ])
  },
}

export default MetronomeView
