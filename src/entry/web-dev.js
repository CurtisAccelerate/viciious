// Host interfaces
import { attach as video } from "../host/video-canvas";
import { attach as audio } from "../host/audio-OscillatorNode";
import { attach as joystick } from "../host/joystick-KeyboardEvent";
import { attach as keyboard } from "../host/keyboard-KeyboardEvent";

// Target devices
import { attach as wires } from "../target/wires";
import { attach as ram } from "../target/ram";
import { attach as vic } from "../target/vic";
import { attach as sid } from "../target/sid";
import { attach as cias } from "../target/cias";
import { attach as cpu } from "../target/cpu";
import { attach as tape } from "../target/tape";

// ROMs
import basic from "../target/rom/basic";
import kernal from "../target/rom/skipRamTest";
import character from "../target/rom/character";

// Bringup
import { bringup } from "../target/bringup";

// Everything else
import { attach as monitor } from "../monitor";
import { attach as webFrontEnd } from "../host/webFrontEnd";
import { attach as dragAndDrop } from "../host/dragAndDrop";

const c64 = bringup({
  host: { audio, video, keyboard, joystick },
  target: { wires, ram, vic, sid, cpu, cias, tape, basic, kernal, character },
  attachments: [monitor, dragAndDrop, webFrontEnd],
});

c64.runloop.run();

// Make the c64 object globally accessible
globalThis.c64 = c64;

// Add event listener for messages
window.addEventListener("message", (event) => {
  // Ensure the message is coming from a trusted source
  const command = event.data;

  // Execute the command
  if (command.type === "startRunloop") {
    c64.runloop.run();
  } else if (command.type === "stopRunloop") {
    c64.runloop.stop();
  } else if (command.type === "typeText") {
    c64.runloop.type(command.text);
  } else if (command.type === "typePetText") {
    c64.runloop.typePet(command.text);
  }
  // Add more commands as needed
});

import { loadPrg } from "../tools/loadPrg"; // Ensure correct import
import { AWAIT_KEYBOARD_PC } from "../tools/romLocations"; // Import AWAIT_KEYBOARD_PC

async function ingest_prg(c64, bytes) {
  c64.runloop.reset();
  await c64.runloop.untilPc(AWAIT_KEYBOARD_PC);

  loadPrg(c64, bytes);

 //c64.runloop.type("RUN\r");
 c64.runloop.type("SYS 32768\r");
  c64.runloop.run();
}

async function loadPrgFromDisk(c64, filePath) {
  try {
    // Use Fetch API to load the PRG file
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Pass the Buffer to the ingest_prg function
    await ingest_prg(c64, bytes);

    console.log("PRG file loaded successfully");
  } catch (error) {
    console.error("Error loading PRG file:", error);
  }
}

// Example usage
const filePath = "/turbo.prg"; // Path to your PRG file (relative to the public directory)
loadPrgFromDisk(c64, filePath);
