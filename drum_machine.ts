// @ts-nocheck
/*
Drum Machine Controller for BBC micro:bit

Hardware:
  Pin 0 (analog): sliding potentiometer — step selector (0–15)
  Pin 1 (analog): sliding potentiometer — track selector (0–7)
  Pin 2 (analog): rotary potentiometer  — tempo (60–180 BPM)
  Encoder 2 (P8 CLK / P9 DT / P13 SW): sample selector
  Encoder 3 (P14 CLK / P15 DT / P16 SW): jog
  Pin 5 / Button A: play/pause

Requires the Rotary Encoder Plus extension by Steve Turbek:
  https://github.com/steveturbek/pxt-rotary-encoder-KY-040-plus

Serial protocol — lines ending with \n, sent to Chrome/Edge via USB:

  Delta events (sent immediately on change):
    step:N        current step 0–15
    track:N       current track 0–7
    tempo:N       BPM 60–180
    sample:N      sample index 0–61 (absolute, encoder turn)
    mute:1        encoder 2 button pressed — toggle mute on current track
    jog:1         jog forward one unit
    jog:-1        jog back one unit
    toggle:1      encoder 3 button pressed — toggle hit at current step/track
    play:N        0 = paused, 1 = playing

  Full state heartbeat (every 1 second, # prefix):
    #step:N,track:N,tempo:N,sample:N,play:N
*/

basic.pause(1000); // --- Setup ---
basic.showIcon(IconNames.Chessboard);
rotaryEncoderPlus.connectEncoder2(); //Uses CLK=P8 DT=P9 SW=P13
rotaryEncoderPlus.connectEncoder3(); //Uses CLK=P14 DT=P15 SW=P16
basic.clearScreen();

serial.redirectToUSB();
serial.writeLine("START DrumMachine");

// State
let step = 0;
let track = 0;
let tempo = 120;
let sampleIndex = 0; // 0–61, JS maps to grouped samples
let isPlaying = 0;

// Previous values for delta detection
let prevStep = -1;
let prevTrack = -1;
let prevTempo = -1;

// Smoothed analog reading for tempo pot (exponential moving average)
let smoothTempo = pins.analogReadPin(AnalogPin.P2);

let lastHeartbeatTime = input.runningTime();

basic.forever(function () {
  let now = input.runningTime();

  // ── Main loop: read the three analog pots ────────────────────────────────────
  step = Math.max(0, Math.min(15, Math.round(((pins.analogReadPin(AnalogPin.P0) - 100) * 15) / 823))); // subtract more than 100 to push step 0 lower, or reduce 823 if step 15 is unreachable at the top.
  track = Math.max(0, Math.min(7, Math.round(((pins.analogReadPin(AnalogPin.P1) - 100) * 7) / 823))); //  subtract more than 100 to push step 0 lower, or reduce 823 if step 15 is unreachable at the top.
  smoothTempo = Math.round(smoothTempo * 0.8 + pins.analogReadPin(AnalogPin.P2) * 0.2);
  tempo = 60 + Math.round((smoothTempo / 1023) * 120);

  if (step !== prevStep) {
    serial.writeLine("step:" + step);
    prevStep = step;
  }
  if (track !== prevTrack) {
    serial.writeLine("track:" + track);
    prevTrack = track;
  }
  if (Math.abs(tempo - prevTempo) > 2) {
    serial.writeLine("tempo:" + tempo);
    prevTempo = tempo;
  }

  // Full state heartbeat every 1 second
  if (now - lastHeartbeatTime >= 1000) {
    lastHeartbeatTime = now;
    serial.writeLine("#step:" + step + ",track:" + track + ",tempo:" + tempo + ",sample:" + sampleIndex + ",play:" + isPlaying);
  }

  basic.pause(50);
});

// ── Encoder 2: sample selector ───────────────────────────────────────────────
rotaryEncoderPlus.onEvent(rotaryEncoderPlus.EncoderID.E2, rotaryEncoderPlus.EncoderEvent.Clockwise, function () {
  sampleIndex = Math.min(61, sampleIndex + 1);
  serial.writeLine("sample:" + sampleIndex);
});

rotaryEncoderPlus.onEvent(rotaryEncoderPlus.EncoderID.E2, rotaryEncoderPlus.EncoderEvent.CounterClockwise, function () {
  sampleIndex = Math.max(0, sampleIndex - 1);
  serial.writeLine("sample:" + sampleIndex);
});

rotaryEncoderPlus.onEvent(rotaryEncoderPlus.EncoderID.E2, rotaryEncoderPlus.EncoderEvent.ButtonPress, function () {
  serial.writeLine("mute:1"); // toggle mute on current track
});

// ── Encoder 3: jog ───────────────────────────────────────────────────────────
rotaryEncoderPlus.onEvent(rotaryEncoderPlus.EncoderID.E3, rotaryEncoderPlus.EncoderEvent.Clockwise, function () {
  serial.writeLine("jog:1");
});

rotaryEncoderPlus.onEvent(rotaryEncoderPlus.EncoderID.E3, rotaryEncoderPlus.EncoderEvent.CounterClockwise, function () {
  serial.writeLine("jog:-1");
});

rotaryEncoderPlus.onEvent(rotaryEncoderPlus.EncoderID.E3, rotaryEncoderPlus.EncoderEvent.ButtonPress, function () {
  serial.writeLine("toggle:1");
});

// ── Play/pause button (Pin 5 = Button A) ─────────────────────────────────────
input.onButtonPressed(Button.A, function () {
  isPlaying = 1 - isPlaying;
  serial.writeLine("play:" + isPlaying);
  if (isPlaying) {
    basic.showIcon(IconNames.EighthNote); // ▶ play
  } else {
    basic.showIcon(IconNames.No);
  }
});
