'use client';

import { motion } from 'framer-motion';

export interface Project {
  id: string;
  title: string;
  description: string;
  cover: string;
  tags: string[];
  views: number;
  saves: number;
  collaborators: any[];
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="group flex flex-col rounded-2xl overflow-hidden glass-card border border-[var(--glass-border)] transition-all cursor-pointer"
      data-editable="true"
    >
      <div className="aspect-video w-full bg-[var(--bg-deep)] relative overflow-hidden">
        {project.cover ? (
          <img src={project.cover} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">No Cover</div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">{project.title}</h3>
        <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2 flex-1">{project.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag, i) => (
            <span key={i} className="skill-badge !text-xs !py-0.5 !px-2.5">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium border-t border-[var(--border-subtle)] pt-4 mt-auto">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {project.views}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              {project.saves}
            </span>
          </div>
          {project.collaborators.length > 0 && (
            <div className="flex -space-x-2">
              {project.collaborators.map((c, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--bg-void)]" />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
