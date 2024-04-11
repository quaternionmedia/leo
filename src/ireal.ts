import m from "mithril";
import "ireal-renderer/css/ireal-renderer.css";
import "ireal-renderer/src/ireal-renderer.js";
import "./styles/ireal.css";

const reverseComposerName = (composer) => {
  composer = composer.split(" ");
  let lastName = composer.shift();
  composer.push(lastName);
  return composer.join(" ");
};

export const Title = ({ state }) => m(".page__title", state.song.title);

export const Style = ({ state }) => m(".page__style", state.song.style);

export const Composer = ({ state }) =>
  m(".page__composer", reverseComposerName(state.song.composer));

export const Key = ({ state }) => m(".page__key", state.key);

export const Bpm = ({ state }) =>
  state.song.bpm != 0 ? m("h5.bpm.bpm", "q=" + state.song.bpm) : null;

export const Subtitle = ({ state }) =>
  m(".page__subtitle", [
    Style({ state }),
    Bpm({ state }),
    Key({ state }),
    Composer({ state }),
  ]);

export const IReal = ({ state, update }) => ({
  oncreate: (vnode) => {
    console.log("IReal oncreate");

    let song = state.song;
    state.renderer.parse(song);
    state.renderer.transpose(song, { transpose: state.transpose });
    state.renderer.render(song, vnode.dom);
    // console.log('rendered', song, vnode.dom, state.renderer)
  },
  view: () => m(".page__sheet"),
});

export const iRealPage = (cell) =>
  m(`.page ${cell.state.darkMode ? `.page--dark` : ""}`, [
    Title(cell),
    Subtitle(cell),
    m(IReal(cell)),
  ]);
