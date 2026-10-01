# One to One — Blender companions

Open `companions.blend` in Blender. The scene contains four editable, static 3D characters:

- **Mimo** — green, tall rounded silhouette
- **Luma** — lilac, tapered silhouette
- **Pip** — yellow, short and rounded
- **Nori** — blue, two-lobed cloud head

Each character has its own named collection, a continuous sculptable body, two separate glossy eyes, a parent empty for moving the whole character, and procedural felt with short hair fibers. Character collections are marked as Blender assets.

The **Studio** collection holds the floor, camera, and lights. Press Numpad 0 for the camera view and F12 to render. The supplied preview is rendered from this scene.

To reposition a character, select its `move character` empty. To change its color or texture, edit the body's felt material. Adjust the named hair particle settings to change fiber length or density.

Saved with Blender 4.5.10 LTS. All materials are procedural; no external textures are required. The static source file has no animation actions or keyframes.

Geometry verified: all four bodies are single connected, closed manifold meshes; two eyes per character. See `geometry-check.json` for details.

The previous image-transform animations were removed. The current animation deliverables below use the Blender skeletons and meshes.

## Reference-matching revision

The bodies have been rebuilt from the original transparent character outlines. Eye positions and sizes are measured from those images. Broad feet flow into the torso, arms hang lower, and shoulder bulges are removed. The felt includes fine tangential fibers as well as a short fuzzy nap. Colors are sampled from the references and rendered with revised studio lighting.

The front contour is constrained by the reference; body depth and rear surfaces are inferred because only front views are available. These are full closed 3D meshes, not image planes or projected image textures. See `reference-comparison.html` for the original images beside the Blender front renders.

## Animated companions

Open `companions-animated.blend` for the rigged version. Each pet has a six-bone skeleton (body, head, two arms, two feet), named vertex groups, and its own editable action. The reference-matched mesh and felt fibers deform with the rig.

`animations/manifest.json` maps every onboarding screen to its pet, unique gesture, and Blender frame range. The 24 clips each contain 24 frames at 12 fps (a two-second looping GIF), with a matching rest key at frame 25. Timeline markers identify the clips; set the playback range to the listed start/end to preview one in Blender.

The animated GIF files and original RGBA frames are in `animations/`. `animations/index.html` previews all 24 loops. In Figma, the corresponding screen uses a named animated component. GIF playback occurs in prototype Present mode; the design canvas displays the first frame.

To edit a gesture, select the pet’s `animation rig`, enter Pose Mode, and edit the keyframes in its named action. Keep the first and closing rest poses identical for seamless looping.
