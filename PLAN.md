# SAFI.md — portfolio plan

## 1. What human-md.ai does

It is a short film you drive with the scroll wheel, not a scrolling page.

- **One stage, pinned.** The screen stays still. Scrolling moves a timeline (GSAP ScrollTrigger, scrubbed).
- **Smooth scroll.** Lenis smooths the wheel so scrubbing feels like a camera move.
- **Rooms, not sections.** Each chapter is a painted set that gets struck as the next comes in.
- **Words are actors.** Lines arrive word by word. A dot strikes words and becomes their period.
- **Three type voices.** Heavy grotesque, italic serif, mono markdown markers.
- **Index pill, film grain, and a plain-text file underneath** for screen readers and reduced motion.

## 2. Our version: a puppet theater

You build the harness around the model. A marionette is the literal picture of that: the puppet is the model, the strings and the control bar are the harness, and a person's hand holds the bar.

- **Curtains** are closed on the title, open on the first scroll, and close again for the curtain call.
- **The red dot** from SAFI.md is the star. It drops into the title on load, then follows you through every room: it hops, bounces, squashes on landing, rolls, and ends lines as their period.
- **Paper marionettes** tell the story. They sway on their strings, blink, wave and react.

### Rooms

| # | Room | What happens on scroll |
|---|------|------------------------|
| 0 | **SAFI.md** | Title on the closed curtain. The dot drops in as the period. Scroll opens the curtains. |
| 1 | **the job** | "A model on its own is a puppet on the floor." A puppet lies flat. A hand lowers the bar, strings drop (tools, memory, middleware, sandboxes, evals, people), the puppet stands. The dot bonks its head, it waves. "That's the harness●" |
| 2 | **how I build a run** | His pattern for long-running agents, not one product. Lead puppet in a top hat gets a task, hands slips to research, draft and verify. Research gets stuck, holds up a "?", the stage dims, someone in the front row stands up and answers. The show resumes and a run report comes down on strings. |
| 3 | **the crew behind the show** | "The puppets get the applause. The crew makes the show work." Five crew puppets, one AI engineering job each: prop master (tools and permissions), librarian (retrieval), script supervisor (memory and context), stage manager (sandboxes and shipping), critic (evals and traces). The dot hops head to head, a spotlight follows, each one jumps and holds up its prop, and a card explains the job with a real example. |
| 4 | **found, missed, invented** | Cards drop into three cardboard boxes. The dot lands on the made-up one and strikes it out. |
| 5 | **on the side** | Project posters pinned to the backstage wall. The dot rolls along the floor as you pass. |
| 6 | **the trail** | Work history as a git log. The dot lands on "you are here". Millos is named only here, as "millos.ai team" (NDA). |
| 7 | **the kit** | Tools hang as tags on prop rails. The dot hops rail to rail and the tags swing. |
| 8 | **curtain call** | Curtains close, a card comes down with contact links, the dot lands and bows. |

## 3. Palette

| Token | Hex | Use |
|-------|-----|-----|
| stage | `#191714` | dark rooms, text on paper |
| paper | `#f1e9da` | puppets' faces, cards, text on dark |
| curtain | `#8e2a24` | curtains and valance |
| spot | `#f6d36b` | spotlight, highlights, the "?" |
| cobalt | `#2f4fb5` | the run room backdrop |
| pink / mint | `#e9a3b5` / `#8fc3a8` | worker puppets |
| box | `#c9a676` | cardboard boxes, prop labels |
| red | `#ec4a2c` | the dot, and markdown markers |

## 4. Type

Archivo (wide, heavy) for statements, Newsreader italic for asides, Spline Sans Mono for markers and logs.

## 5. No AI slop checklist

- No gradients-as-decoration, glass cards, glows, emoji, or robot/brain art.
- No "Hi, I'm X, a passionate ..." hero. No services grid.
- Every number comes from the resume. No em dashes in copy.
- All art is flat SVG drawn in code. No generated images.

## 6. How it's built

- Vite, plain JS, GSAP + ScrollTrigger, Lenis.
- **One scroll timeline** drives every room, the curtains and the dot.
- **Dot physics** is choreographed: each hop measures its landing spot on the real element, arcs to it (rise with ease-out, fall with ease-in), then squashes and bounces. It re-measures on resize.
- **Puppets** are built from one SVG template. Each joint has its own small rig that rotates around a fixed pivot, so limbs never drift. Idle sway and blinking run on their own; story moves are tied to the scroll.
- Reduced motion shows the plain article instead.

## 7. Next

1. Swap any copy that does not sound like you.
2. Real screenshots on the project posters.
3. Deploy (Netlify or Vercel) and add a link-preview image of the "job" room.
4. Optional: let the dot react to the mouse when you stop scrolling.
