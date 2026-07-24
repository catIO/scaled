import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-border bg-card material-shadow-xl">
        <main className="p-8 space-y-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">About Scaled</h1>
            <p className="text-muted-foreground max-w-2xl">
              Scaled helps you practice scales consistently with simple repetition tracking and a daily target built from your weekly plan.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">How To Use This App</h2>
            <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground">
              <li>Open Settings and review your scale list in the Scales tab.</li>
              <li>In Goals, set Repetitions Per Scale and choose your week start day.</li>
              <li>In Finger Patterns, pick the right-hand patterns you want to cycle through while practicing.</li>
              <li>Your weekly goal is inferred automatically from scales x repetitions.</li>
              <li>Practice the current scale and mark each successful run with the check button.</li>
              <li>Track your daily progress at the top and in the progress panel.</li>
              <li>When you reach today's target, confetti confirms you are on pace.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">More Practice Apps</h2>
            <p className="text-sm text-muted-foreground">
              Explore your full collection of music practice apps on Practice Mate.
            </p>
            <a
              href="https://practice-mate.app/"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary underline hover:text-primary/90"
            >
              Visit practice-mate.app
            </a>
          </section>
        </main>

        <footer className="border-t border-border px-8 py-4 text-sm text-muted-foreground flex items-center justify-between">
          <span>Scaled</span>
          <Link to="/" className="text-primary underline hover:text-primary/90">
            Back to Practice
          </Link>
        </footer>
      </div>
    </div>
  );
}
