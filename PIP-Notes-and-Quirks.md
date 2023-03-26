> 🔗 [Back to main README](./README.md)

## Important Links
- Specs
	- [W3C Picture-in-Picture Working Draft](https://www.w3.org/TR/picture-in-picture/) (Jan 2020)
	- [W3C PiP - Editor Draft](https://w3c.github.io/picture-in-picture/) (Oct 2020)
- [W3C PiP Repo](https://github.com/w3c/picture-in-picture)
- [Chrome Platform Status - Feature](https://www.chromestatus.com/feature/5729206566649856)
- [Chrome Feature Sample](https://googlechrome.github.io/samples/picture-in-picture/)
- [Extremely comprehensive overview of the state of PiP](https://ottball.com/whats-popping-picture-in-picture/)

## Notes
- How to detect PiP close
	- You can attach to the VIDEO element (not the pip window) a `leavepictureinpicture` listener.
	- Obviously, if you call `document.exitPictureInPicture()`, you know yourself of the close event
- What video formats are compatible with MediaSource? How do I append segments?
	- See [my blog post](https://joshuatz.com/posts/2020/appending-videos-in-javascript-with-mediasource-buffers/)

## Oddities
 - For some reason, if your canvas is only black text on a white background, the video and canvas both render correctly, but the PiP will only render a black box. Switching to white text on a black background fixes it.
 - In Chrome, there seems to be an issue with super short PiP displays (long width, short height)
	 - It seemed to max at around between 5.5:1 and 6.5:1 - going any shorter would cause a black bar to be added at the bottom of the PiP
		- For example, with width of 440, the min height seems to be 80, which would actually be `5.5:1`. Going any shorter (for example, 70), will cause black bars to be added at top and bottom of PiP window to pad actual content
		- Edge has same issue as Chrome
	 - Although you can use the minimum aspect ratio to avoid black bars, Chrome has an additional issue where it oddly restricts the *minimum* overall *dimensions* of the PiP window itself. It acts kind of strange with short inputs. See [table below](#reference-chrome-pip-window-resizing-restrictions)
	 - Based on spec, I think aspect ratio should be based on `<video>` element, but also subject to min/max based on host display, so maybe it has more to do with *my* aspect ratio (of my physical screen)

### Reference: Chrome PiP Window Resizing Restrictions
> These tests were all done on a 1920x1080 display

PiP Source Resolution | Minimum PiP Resolution
--- | ---
`440x300` | `260x177`
`440x220` | `292x146`
`440x200` | `321x146`
`440x180` | `356x146`
`440x160` | `401x146`
`440x146` | `440x146`
`440x120` | `535x146`
`440x100` | `642x146`
`440x80` | `803x146`

> Firefox had much more reasonable restrictions, as well as preserving aspect ratio. With a `440x80` input, it let me shrink all the way down to half, at `220x40`

## Individual Platform Support
For tracking the overall state of PiP browser support across different platforms, two great resources I have found are:

- W3C Repo: [/implementation-status.md](https://github.com/w3c/picture-in-picture/blob/master/implementation-status.md)
- ottball / Lowette: [What's popping, Picture-in-Picture?](https://ottball.com/whats-popping-picture-in-picture/)

### Firefox / Gecko (Desktop)
- There are a bunch of things to note / quirks with PiP in Firefox
	- Shipped in v71+ [ref](https://support.mozilla.org/en-US/kb/about-picture-picture-firefox)
	- [Default preferences](https://github.com/mozilla/gecko-dev/blob/5a1a34953a26117f3be1a00db20c8bbdc03273d6/modules/libpref/init/all.js#L419-L425) have it as off, and even if you turn it on, the launch button only shows up if video length > 45 seconds
		- Even with all preferences adjusted, the JS API is not exposed; the user has to manually initiate by clicking Firefox's injected button
- Some relevant links:
	- ["How we Built Picture-in-Picture in Firefox"](https://hacks.mozilla.org/2020/01/how-we-built-picture-in-picture-in-firefox-desktop/) - Great insight into design process, prior art, etc.
	- Their [standards position on W3C PiP Web API - #72](https://github.com/mozilla/standards-positions/issues/72)
	- [`videcontrols.js`](https://github.com/mozilla/gecko-dev/blob/2efcda6dc74c63863fd8f04a6d9d7ac6b09c7eca/toolkit/content/widgets/videocontrols.js)

### Android
Android has support a "flavor" of Picture-in-Picture [since Android 8.0](https://developer.android.com/guide/topics/ui/picture-in-picture) (aka *Oreo*). However, this is really a separate native API, of which browsers (and apps) can utilize.

***Within*** an actual web browser on Android, the ability to use this API depends on the browser:

- With Chrome, the `.requestPictureInPicture()` API seems to work fine
- In Android Firefox, similar caveats to those with Desktop Firefox apply:
	- The JS API is not exposed, and triggering PiP requires that *the user* makes the video full-screen, and then presses the home button.
	- Furthermore, there appears to be some sort of limitations on what *type* of videos can trigger PiP behavior, and I can't find it documented anywhere. It might be that there is a minimum duration, resolution, and/or aspect ratio requirements. Whatever it is, I have had trouble getting my canvas streams to trigger it.