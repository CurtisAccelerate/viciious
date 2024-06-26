/*
   This web front end maintains a whole UI through direct DOM manipulation.
   That's a bad idea. One initial goal of the emulator was to have no external
   dependencies, but then the front end grew, and now it's long past the point
   that it should just be rewritten in React or other framework. So... expect
   this folder to look very different in future.
*/

import { initDialogs, showErrorDialog } from "./dialogs";
import { initTrays, toggleTrays } from "./trays";
import { initScopes } from "./scopes";

import { initJoystickDialog } from "./joystickDialog";
import { initKeyMapDialog }   from "./keyMapDialog";
import { initLoaderDialog }   from "./loaderDialog";
import { initDiskDialog }     from "./diskDialog";
import { setSpeed } from "../../target/runloop"; // Import the setSpeed function


// A development aid. Don't commit with this turned on.
const pauseOnMenus = false;


let speedOptions = [20, 1];
let currentSpeedIndex = 0;

function cycleSpeed() {
  currentSpeedIndex = (currentSpeedIndex + 1) % speedOptions.length;
  setSpeed(speedOptions[currentSpeedIndex]);
  console.log(`Speed set to ${speedOptions[currentSpeedIndex]}x`);
}


// Add event listener for key press to cycle speed
document.addEventListener('keydown', (event) => {
  if (event.key === 'F1') { // Use F1 key to avoid conflicts with common C64 keys
    cycleSpeed();
  }
});

export function attach(nascentC64) {
  const c64 = nascentC64;

  // Attach click handlers for backgroup elements to open the upper tray
  for (let el of document.getElementsByClassName("_isBackground")) {
    el.addEventListener(
      "click",
      (event) => {
        if (event.target !== el) {
          // This paradigm feels wrong
          return;
        }

        const showing = toggleTrays();

        if (pauseOnMenus) {
          // This is a hack, and will conflict with settings you
          // make to the runloop and mute within the menu.
          if (showing) {
            c64.runloop.stop();
            c64.audio.setUiGain(0);
          }
          else {
            c64.runloop.run();
            c64.audio.setUiGain(1);
          }
        }
      }
    );
  }

  // Wire-up all the other UI elements (existing HTML) to code
  initDialogs();
  initTrays(c64);
  initJoystickDialog(c64);
  initKeyMapDialog(c64);
  initLoaderDialog(c64);
  initDiskDialog(c64);
  initScopes(c64);

  c64.hooks.reportError = showErrorDialog;
  c64.hooks.setTitle = setTitle;
}

const initialTitle = document.title;

function setTitle(str) {
  // TODO: we should do this for ANSI mode too,
  // And get it into the snapshot name; at least so that clicking on the
  // snapshot will restore the window title.
  document.title = str.length ? `${str} (${initialTitle})` : initialTitle;
}
