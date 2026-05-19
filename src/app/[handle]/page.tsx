import { StudioHero } from '@/components/studio/StudioHero';
import { CurrentlyBuilding } from '@/components/studio/CurrentlyBuilding';
import { StudioLinks } from '@/components/studio/StudioLinks';
import { ProjectGrid } from '@/components/studio/ProjectGrid';

// Mock Data
const MOCK_USER = {
  handle: "aashaan",
  name: "Aashaan Gaigole",
  tagline: "Building the identity layer for Gen Z creators",
  disciplines: ["Product", "Strategy", "Design"],
  availability: "open-to-collab" as const,
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aashaan",
  coverMedia: null,
  links: [
    { label: "Portfolio", url: "#" },
    { label: "GitHub", url: "#" }
  ],
  currentlyBuilding: "Nova — the creator identity layer",
  projects: [
    {
      id: "1",
      title: "Nova Design System",
      description: "Cyber-minimalist UI tokens for the creator generation. Built with Tailwind and Framer Motion.",
      cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
      tags: ["Design", "Systems"],
      views: 1240,
      saves: 89,
      collaborators: [{}]
    },
    {
      id: "2",
      title: "AI Creator Tools",
      description: "Experimental LLM-powered interfaces for creative brainstorming.",
      cover: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop",
      tags: ["AI", "React"],
      views: 890,
      saves: 45,
      collaborators: []
    },
    {
      id: "3",
      title: "Haptic Interactions",
      description: "A study on web-based micro-interactions and haptic feedback.",
      cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop",
      tags: ["UX", "Research"],
      views: 2100,
      saves: 156,
      collaborators: [{}, {}]
    }
  ]
};

export default function StudioProfilePage({ params }: { params: { handle: string } }) {
  // Strip the '@' if present
  const handle = params.handle.startsWith('%40') || params.handle.startsWith('@') 
    ? params.handle.replace(/^(%40|@)/, '') 
    : params.handle;

  // In a real app, we would fetch the user based on the handle.
  // For now, we just use MOCK_USER.

  return (
    <main className="min-h-screen bg-[#02020a] text-white pt-20 px-4 pb-24">
      <div className="max-w-6xl mx-auto">
        <StudioHero 
          handle={MOCK_USER.handle}
          name={MOCK_USER.name}
          tagline={MOCK_USER.tagline}
          availability={MOCK_USER.availability}
          avatar={MOCK_USER.avatar}
        />
        
        <CurrentlyBuilding text={MOCK_USER.currentlyBuilding} />
        
        <StudioLinks links={MOCK_USER.links} />
        
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <span className="w-2 h-6 bg-white/20 rounded-full inline-block"></span>
            Featured Projects
          </h2>
          <ProjectGrid projects={MOCK_USER.projects} />
        </div>
      </div>
    </main>
  );
}
