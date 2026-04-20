---
name: No image cropping ever
description: Images must always display in full without any cropping — object-fit cover is forbidden
type: feedback
---

Never crop images anywhere on the site. Always display the full image regardless of context (hero, cards, lightbox, portraits, thumbnails).

**Why:** The works are art — cropping them misrepresents the piece. This is a hard rule with no exceptions.

**How to apply:** Use `object-fit: contain` instead of `object-fit: cover`. Remove fixed aspect-ratios on image containers that would force cropping. Let the image's natural aspect ratio dictate the container shape.
