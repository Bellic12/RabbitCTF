import { useMemo, useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Insane';
type ChallengeCategory = 'Web' | 'Binary' | 'Crypto' | 'Forensics' | 'Reverse' | 'Pwn' | 'Misc' | 'OSINT' | 'Steganography';
type ChallengeStatus = 'solved' | 'open';

interface ChallengeFile {
  name: string;
  size: string;
  url: string;
}

interface ChallengeSolve {
  team: string;
  submittedAt: string;
  points: number;
}

interface Challenge {
  id: string;
  title: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  points: number;
  solves: number;
  status: ChallengeStatus;
  description: string;
  tags: string[];
  connectionInfo?: string;
  files?: ChallengeFile[];
  solveHistory?: ChallengeSolve[];
}

export default function ChallengesPage() {
  const { token } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/challenges/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          // Map backend data to frontend interface
          const mappedChallenges: Challenge[] = data.map((c: any) => ({
            id: String(c.id),
            title: c.title,
            category: c.category_name || 'Web', // Fallback
            difficulty: c.difficulty_name || 'Easy', // Fallback
            points: c.base_score,
            solves: c.solve_count || 0,
            status: c.is_solved ? 'solved' : 'open',
            description: c.description,
            tags: [], // Backend doesn't return tags yet
            connectionInfo: c.operational_data,
            files: [], // Backend doesn't return files yet
            solveHistory: [], // Backend doesn't return history yet
          }));
          setChallenges(mappedChallenges);
        }
      } catch (error) {
        console.error('Failed to fetch challenges', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, [token]);
  const [categoryFilter, setCategoryFilter] = useState<'All' | ChallengeCategory>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | ChallengeDifficulty>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ChallengeStatus>('All');
  const [selected, setSelected] = useState<Challenge | null>(null);

  const filteredChallenges = useMemo(() => {
    return challenges.filter((challenge) => {
      const matchTerm = challenge.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === 'All' || challenge.category === categoryFilter;
      const matchDifficulty = difficultyFilter === 'All' || challenge.difficulty === difficultyFilter;
      const matchStatus = statusFilter === 'All' || challenge.status === statusFilter;
      return matchTerm && matchCategory && matchDifficulty && matchStatus;
    });
  }, [challenges, searchTerm, categoryFilter, difficultyFilter, statusFilter]);

  return (
    <div className="flex min-h-screen flex-col bg-[#04090f] text-white">
      <Navigation />

      <main className="flex-1 bg-[#04090f]">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14">
          <header className="space-y-3">
            <h1 className="text-4xl font-bold">Challenges</h1>
            <p className="text-sm text-white/60">
              Browse and solve challenges to earn points for your team
            </p>
          </header>

          <section className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[#061120] p-6 shadow-[0_25px_65px_-50px_rgba(0,0,0,0.9)] md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-center gap-3 md:max-w-xl">
              <SearchIcon className="hidden h-5 w-5 text-white/30 md:block" />
              <input
                className="h-12 w-full rounded-2xl border border-white/15 bg-[#040d1a] px-4 text-sm text-white transition focus:border-[#0edbc5] focus:outline-none"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search challenges..."
                value={searchTerm}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 md:flex-nowrap md:gap-4">
              <select
                className="select select-bordered h-12 min-w-[7.5rem] rounded-2xl border-white/15 bg-[#040d1a] text-sm text-white focus:border-[#0edbc5]"
                onChange={(event) => setCategoryFilter(event.target.value as typeof categoryFilter)}
                value={categoryFilter}
              >
                <option value="All">All</option>
                <option value="Web">Web</option>
                <option value="Binary">Binary</option>
                <option value="Crypto">Crypto</option>
                <option value="Forensics">Forensics</option>
                <option value="Reverse">Reverse</option>
                <option value="Pwn">Pwn</option>
                <option value="Misc">Misc</option>
                <option value="OSINT">OSINT</option>
                <option value="Steganography">Steganography</option>
              </select>

              <select
                className="select select-bordered h-12 min-w-[7.5rem] rounded-2xl border-white/15 bg-[#040d1a] text-sm text-white focus:border-[#0edbc5]"
                onChange={(event) => setDifficultyFilter(event.target.value as typeof difficultyFilter)}
                value={difficultyFilter}
              >
                <option value="All">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Insane">Insane</option>
              </select>

              <select
                className="select select-bordered h-12 min-w-[7.5rem] rounded-2xl border-white/15 bg-[#040d1a] text-sm text-white focus:border-[#0edbc5]"
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                value={statusFilter}
              >
                <option value="All">All</option>
                <option value="solved">Solved</option>
                <option value="open">Open</option>
              </select>
            </div>
          </section>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-white/60">
              <span className="loading loading-spinner loading-lg text-[#0edbc5]"></span>
            </div>
          ) : (
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredChallenges.map((challenge) => (
              <button
                className="flex h-full flex-col rounded-[28px] border border-white/10 bg-[#061120] p-6 text-left transition hover:border-[#0edbc5]/40 hover:shadow-[0_25px_65px_-45px_rgba(0,0,0,0.9)]"
                key={challenge.id}
                onClick={() => setSelected(challenge)}
                type="button"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white/70">
                      {challenge.status === 'solved' ? <SolvedIcon /> : <UnsolvedIcon />}
                      {challenge.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/70">
                        {challenge.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          challenge.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : challenge.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {challenge.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-2xl font-bold text-[#0edbc5]">
                    {challenge.points}
                    <p className="mt-1 text-xs font-medium text-white/40">
                      {challenge.solves} solves
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {challenge.tags.map((tag) => (
                    <span
                      className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}

            {filteredChallenges.length === 0 && (
              <div className="col-span-full rounded-[28px] border border-white/10 bg-[#061120] p-10 text-center text-white/60">
                No challenges match the selected filters.
              </div>
            )}
          </section>
          )}
        </div>
      </main>

      <Footer />

      {selected && (
        <ChallengeModal challenge={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

interface ChallengeModalProps {
  challenge: Challenge;
  onClose: () => void;
}

function ChallengeModal({ challenge, onClose }: ChallengeModalProps) {
  const [tab, setTab] = useState<'details' | 'history'>('details');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="relative w-full max-w-2xl rounded-[32px] border border-white/10 bg-[#061120] p-8 text-white shadow-[0_35px_80px_-35px_rgba(0,0,0,0.85)]">
        <button
          aria-label="Close"
          className="btn btn-sm btn-circle absolute right-6 top-6 border border-white/10 bg-[#040d1a] text-white hover:border-[#0edbc5] hover:text-[#0edbc5]"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm font-semibold text-white/70">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                challenge.difficulty === 'Easy'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : challenge.difficulty === 'Medium'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {challenge.difficulty}
            </span>
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs uppercase tracking-wide text-white/60">
              {challenge.category}
            </span>
            <span className="text-[#0edbc5]">{challenge.points} points</span>
            <span className="text-white/40">{challenge.solves} solves</span>
          </div>

          <h2 className="text-2xl font-bold">{challenge.title}</h2>
        </div>

        <div className="mt-6 flex gap-6 border-b border-white/10 text-sm font-medium text-white/60">
          <button
            className={`pb-3 transition ${tab === 'details' ? 'border-b-2 border-[#0edbc5] text-white' : 'hover:text-white'}`}
            onClick={() => setTab('details')}
            type="button"
          >
            Challenge Details
          </button>
          <button
            className={`pb-3 transition ${tab === 'history' ? 'border-b-2 border-[#0edbc5] text-white' : 'hover:text-white'}`}
            onClick={() => setTab('history')}
            type="button"
          >
            Solve History ({challenge.solveHistory?.length ?? 0})
          </button>
        </div>

        {tab === 'details' ? (
          <div className="mt-6 space-y-6 text-sm text-white/70">
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                Description
              </h3>
              <p className="mt-2 text-white/70">{challenge.description}</p>
            </section>

            {challenge.tags.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">Tags</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {challenge.tags.map((tag) => (
                    <span
                      className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {challenge.files && challenge.files.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">Files</h3>
                <div className="rounded-2xl border border-white/10 bg-black/20">
                  {challenge.files.map((file) => (
                    <div
                      className="flex items-center justify-between gap-4 px-4 py-3 text-white/70"
                      key={file.name}
                    >
                      <div className="space-y-1">
                        <p className="text-sm text-white">{file.name}</p>
                        <p className="text-xs text-white/40">{file.size}</p>
                      </div>
                      <a
                        className="btn btn-sm rounded-full border-none bg-[#0edbc5] text-black hover:bg-[#10f0d6]"
                        href={file.url}
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {challenge.connectionInfo && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">Connection Info</h3>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <code className="flex-1 text-sm text-white/80">{challenge.connectionInfo}</code>
                  <button
                    className="btn btn-sm rounded-full border-none bg-white/10 text-white hover:bg-white/20"
                    onClick={() => navigator.clipboard.writeText(challenge.connectionInfo ?? '')}
                    type="button"
                  >
                    Copy
                  </button>
                </div>
              </section>
            )}

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">Submit Flag</h3>
              <form className="flex flex-col gap-3 md:flex-row">
                <input
                  className="h-12 flex-1 rounded-2xl border border-white/15 bg-[#040d1a] px-4 text-sm text-white focus:border-[#0edbc5] focus:outline-none"
                  placeholder="flag{...}"
                  type="text"
                />
                <button className="btn h-12 rounded-full border-none bg-[#0edbc5] px-6 text-sm font-semibold text-black hover:bg-[#10f0d6]" type="submit">
                  Submit
                </button>
              </form>
            </section>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {challenge.solveHistory && challenge.solveHistory.length > 0 ? (
              <div className="space-y-3">
                {challenge.solveHistory.map((entry, index) => (
                  <div
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70"
                    key={`${entry.team}-${index}`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{entry.team}</p>
                      <p className="text-xs text-white/40">{entry.submittedAt}</p>
                    </div>
                    <span className="text-[#0edbc5]">{entry.points} pts</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-white/50">
                No solves have been recorded yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface IconProps {
  className?: string;
}

function FlagIcon({ className }: IconProps = {}) {
  return (
    <svg aria-hidden="true" className={`h-5 w-5 text-[#0edbc5] ${className ?? ''}`} fill="none" viewBox="0 0 24 24">
      <path
        className="stroke-current"
        d="M6 4v16M6 4h11.2a1 1 0 01.8 1.6L16 9l2 2.4a1 1 0 01-.8 1.6H6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
      />
    </svg>
  );
}

function SolvedIcon() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path
          className="stroke-current"
          d="M9 12l2 2 4-4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
        />
      </svg>
    </span>
  );
}

function UnsolvedIcon() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-white/40">
      <svg aria-hidden="true" className="h-3 w-3" fill="none" viewBox="0 0 24 24">
        <circle className="stroke-current" cx="12" cy="12" r="8" strokeWidth={1.6} />
      </svg>
    </span>
  );
}

function SearchIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        className="stroke-current"
        d="M11 5a6 6 0 014.472 9.992l3.27 3.27a1 1 0 01-1.414 1.414l-3.27-3.27A6 6 0 1111 5z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.4}
      />
    </svg>
  );
}
