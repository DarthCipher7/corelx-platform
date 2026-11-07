export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[]; // array of paragraphs or sections
  author: {
    name: string;
    role: string;
    handle: string;
  };
  date: string;
  category: "Vision" | "Reputation" | "Community" | "Engineering";
  readTime: string;
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "why-we-built-corelx",
    title: "Why we built CORELX",
    excerpt:
      "Creators deserve more than disconnected fragments across five corporate networks. A note on building the first true identity layer for builders.",
    category: "Vision",
    date: "Nov 3, 2026",
    readTime: "4 min read",
    tags: ["Manifesto", "Identity", "Founders"],
    author: {
      name: "The CORELX Team",
      role: "Core Builders",
      handle: "@corelx",
    },
    content: [
      "If you are a student or young creator today, your creative existence is shattered across a dozen disconnected tabs.",
      "You post polished graduation headshots on LinkedIn to appease corporate recruiters who glance at your resume for six seconds. You post aesthetic weekend stories on Instagram to keep up with your social circle. You push side project commits to GitHub that nobody outside engineering understands. You upload UI mockups to Dribbble where they drown under agency case studies. And when you actually want to build something real with peers on your campus, you are stuck scrambling through chaotic WhatsApp group chats with 400 unread messages.",
      "None of these platforms talk to each other. More critically: none of them understand what a builder actually is.",
      "Traditional networks were architected for an obsolete generation. They measure value in corporate pedigree, vanity follower numbers, and algorithm-fueled rage bait. If you study at a tier-3 college in Indore or an arts academy in Kochi, LinkedIn’s search algorithms bury your profile beneath thousands of Ivy League and IIT credentials before anyone ever evaluates the craft in your portfolio.",
      "We built CORELX because we refused to accept that reality.",
      "CORELX is the unified identity layer designed from the ground up for the next generation of designers, engineers, filmmakers, writers, and digital polymaths. It brings together short-form video in Flares, ephemeral creative sparks in Traces, living portfolio archives in Showcase, and persistent squad workspaces in Pods.",
      "Crucially, it replaces arbitrary follower counts with Aura — a verifiable reputation score earned solely through shipping work, mentoring peers, and collaborating on real projects. A self-taught motion designer with exceptional output commands the exact same prominence and respect as anyone with an elite institutional stamp.",
      "We are a small, focused team building the platform we desperately wished existed when we were in university. We believe creative talent is universally distributed, but genuine discovery has remained painfully centralized.",
      "CORELX is here to change that balance permanently.",
    ],
  },
  {
    slug: "aura-explained",
    title: "Aura explained: how reputation works on CORELX",
    excerpt:
      "Reputation should reflect what you ship and how you support your squad — not vanity metrics. Here is how Aura works under the hood.",
    category: "Reputation",
    date: "Oct 24, 2026",
    readTime: "3 min read",
    tags: ["Aura", "Reputation", "Trust"],
    author: {
      name: "Product & Engineering",
      role: "Platform Architecture",
      handle: "@corelx",
    },
    content: [
      "On traditional social platforms, influence is a byproduct of sensationalism, algorithmic gaming, and pay-to-play verification checks. You can purchase a blue checkmark for eight dollars, buy ten thousand bot followers, and appear authoritative without ever building a single line of code or designing a single interface.",
      "On CORELX, your standing is quantified by Aura. Aura cannot be bought, transferred, or faked.",
      "Aura is a cryptographic trust and contribution score that grows dynamically based on four verifiable vectors: the quality and resonance of what you publish in Flares and Showcase, your track record on Collab Board projects, your active contribution inside Pods, and community peer recognition through earned Badges.",
      "The Aura hierarchy spans five progressive tiers:",
      "1. New — The foundational tier. Every builder starts here. You gain access to browse feeds, join open Pods, and submit collaboration applications.",
      "2. Rising — Earned after publishing your initial Showcase artifacts and contributing constructive feedback in community discussions.",
      "3. Trusted — Unlocked by completing verified collabs, hosting campus events, and maintaining sustained positive interactions without moderation infractions.",
      "4. Core — Awarded to established community anchors who consistently ship work, mentor other creators, and moderate active Pod rooms.",
      "5. Pillar — The pinnacle of CORELX reputation. Pillars represent cultural and technical leaders whose influence anchors entire campus ecosystems.",
      "As your Aura elevates, you unlock enhanced reach across the discovery feed, the ability to initiate high-trust guarded collaboration rooms, and direct Reach Inbox priority with verified partner companies.",
      "In a world flooded with AI-generated noise, Aura is your proof of human craft and peer respect.",
    ],
  },
  {
    slug: "pods-the-community-layer",
    title: "Pods: the community layer for student builders",
    excerpt:
      "Say goodbye to drowned WhatsApp groups and fragmented Discord servers. Pods bring structured, persistent workspaces to creative squads.",
    category: "Community",
    date: "Oct 12, 2026",
    readTime: "4 min read",
    tags: ["Pods", "Collaboration", "Campuses"],
    author: {
      name: "Community Guild",
      role: "Ecosystem Design",
      handle: "@corelx",
    },
    content: [
      "Ask any university builder where their side project actually lives, and they will point to a chaotic WhatsApp or Telegram group. Links get lost. Design files get buried under casual chatter. People join, stay silent, or leave without trace. When the hackathon weekend ends, the room turns into a ghost town.",
      "Discord tried to solve this, but its sprawling channels and gamer-centric interfaces create overwhelming noise rather than focused collaboration.",
      "We designed Pods to be the persistent, purpose-built community engine for creators.",
      "A Pod is a modular squad room that unifies discussion, live events, member role registries, and asset sharing into a clean cyber-minimal workspace. Whether you are leading a campus robotics lab, orchestrating an indie film production, or organizing a 48-hour design sprint, your Pod adapts to your operational rhythm.",
      "Pods support two visibility modes tailored to your operational needs: Open Pods welcome any community member to discover, join, and learn; Invite-Only Pods allow tight-knit teams to build in high-trust privacy behind verified member admission.",
      "Every Pod automatically integrates with the Collab Board, letting organizers publish specialized role requirements directly to the broader campus network when they need a sound engineer, 3D rigger, or rust developer.",
      "No more lost drive links. No more dead chat groups. Just your crew, your craft, and your collective momentum.",
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
