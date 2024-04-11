import m from 'mithril' 
import './nav.css';

// Defines the base nav class
const baseClass = 'nav';

// Nav component
export const Nav = (cell, attrName, side, content) => {
  // Constructs class names dynamically based on the 'side' argument
  const navClass = `${baseClass} .${baseClass}_${side}`;
  const navContentClass = `${baseClass}__content .${baseClass}_${side}__content`;

  // Combines the NavToggle and content into a single component
  return m(`.${navClass}`, [
    NavToggle(cell, attrName, side),
    m(`.${navContentClass}`, content),
  ]);
};

// NavToggle component
export const NavToggle = ({ state, update }, attrName, side) => {
  // Toggles the state attribute and the open class for the nav
  const toggleNav = () => {
    const newValue = !state[attrName];
    update({ [attrName]: newValue });
  };

  // Constructs class names dynamically
  const toggleClass = `${baseClass}__toggle`;
  const toggleSideClass = `.${baseClass}_${side}__toggle`;
  const isOpen = state[attrName] ? `.${toggleClass}--open .${toggleSideClass}--open` : '';

  // Creates the toggle button with bars
  return m(`button.${toggleClass} ${toggleSideClass} ${isOpen}`, 
    { onclick: toggleNav }, [
    m(`.${toggleClass}__bar ${toggleSideClass}__bar__1`),
    m(`.${toggleClass}__bar ${toggleSideClass}__bar__2`),
    m(`.${toggleClass}__bar ${toggleSideClass}__bar__3`),
  ]);
};