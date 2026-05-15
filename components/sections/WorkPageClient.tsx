'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { WorkGrid, type WorkProject } from './WorkGrid';
import { WorkList } from './WorkList';

export type { WorkProject };

type ViewMode = 'grid' | 'list';
type Filter = 'all' | 'web' | 'mobile' | 'saas' | 'design';

const FILTERS: Filter[] = ['all', 'web', 'mobile', 'saas', 'design'];

interface WorkPageClientProps {
  projects: WorkProject[];
}

export function WorkPageClient({ projects }: WorkPageClientProps) {
  const t = useTranslations('work');
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<ViewMode>('grid');

  const filtered =
    filter === 'all' ? projects : projects.filter((p) => p.category === filter);

  return (
    <div>
      {/* Controls */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        {/* Filter pills */}
        <nav aria-label={t('title')} className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                'min-h-[44px] border px-4 py-2 font-mono text-sm uppercase transition-colors duration-200',
                filter === f
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-3)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-2)]',
              )}
            >
              {t(`filters.${f}`)}
            </button>
          ))}
        </nav>

        {/* View toggle */}
        <div
          className="flex items-center gap-0.5 border border-[var(--color-border)] p-0.5"
          role="group"
          aria-label={t('viewMode')}
        >
          <button
            onClick={() => setView('grid')}
            aria-pressed={view === 'grid'}
            aria-label="Grid view"
            className={cn(
              'flex h-11 w-11 items-center justify-center transition-colors duration-200',
              view === 'grid'
                ? 'bg-[var(--color-surface)] text-[var(--color-text-1)]'
                : 'text-[var(--color-text-3)] hover:text-[var(--color-text-2)]',
            )}
          >
            <LayoutGrid size={15} aria-hidden="true" />
          </button>
          <button
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            aria-label="List view"
            className={cn(
              'flex h-11 w-11 items-center justify-center transition-colors duration-200',
              view === 'list'
                ? 'bg-[var(--color-surface)] text-[var(--color-text-1)]'
                : 'text-[var(--color-text-3)] hover:text-[var(--color-text-2)]',
            )}
          >
            <List size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* View transition */}
      <AnimatePresence mode="wait">
        {view === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <WorkGrid projects={filtered} />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <WorkList projects={filtered} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
