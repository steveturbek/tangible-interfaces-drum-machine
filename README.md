# Dumb Machine

This demo project combines the inputs potential rotary coders encoder to make a tangible control for a simulated, simplified drum machine, inspired by old machines like the Roland 808.

These machines work by having a repeating 16 step loop timeline, 8 tracks. Each track is one sound or sample placed at different times on the timeline, to make various rhythms. Placing the bass drum on every fourth slot makes the classic "four on the floor" rock rhythm.

# Hardware

- sliding potentiometer "step" selects the step on timeline (pin0)
- sliding potentiometer "track" selects the track (pin1)
- A rotary potentiometer "tempo" sets the overall tempo, in beats per minute, from normal slow to relatively fast, in normal disco range. (pin2)
- Rotary encoder "sample" selects the sample for each track (Rotary encoder 2)
- Rotary encoder "jog" jogs the track forward or backward to create "swing", Or if a hit is selected, jog it alone. (Rotary encoder 3)
- button for play/pause

# Microbit Program

The microbit program collects these inputs and sends to a webpage which animates and plays the music. The samples come from public domain sounds.

<!-- tangible-interfaces-project-drum-machine -->

[microbit.org code link](https://makecode.microbit.org/S05362-83625-16605-93381){:target="\_blank"}

{% capture code %}{% include_relative examples_microbit/project_microbit_drum_machine.ts %}{% endcapture %}
{% assign code = code | remove: "// @ts-nocheck" | lstrip %}
{% highlight typescript %}{{ code }}{% endhighlight %}

# Web page

[drum_machine.html](drum_machine.html)

- The webpage has a grid of squares 16 (steps) wide by 8 tall (tracks)
- the tracks are separated in 4 rows above and below
- there is a horizontal band between the two sets of tracks
- to the left of the tracks is a text field with the name of the sample
- A default loop is loaded, with at least 4 tracks.
- the default drum samples are loaded in /35238**1love**orange-vintage-drum-kit from [https://freesound.org/people/1LOVE/packs/35238/](https://freesound.org/people/1LOVE/packs/35238/)
- There is a clear button on page

## Potential Future Features

- the sequence of default samples is encoded as a query string that could be shared to other people
- the current sequence of samples is encoded as a query string
- web page can work locally and user can specify a file path in microbit code
- or download sample to their computer and drag and drop to the webpage
- Is there a way to save the music as an MP3 in the browser directly without use of a server?
- Future question could hardware interface be used to make MIDI with a digital audio workstation?

<!--
Questions:
Samples will be a selected list from:
- Freesound.org done.
- complex classic hiphop samples https://freesound.org/people/Bronxio/packs/12756/
- Looperman.com — royalty free loops, free account

-->
