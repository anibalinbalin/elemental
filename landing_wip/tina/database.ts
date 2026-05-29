import { createDatabase, createLocalDatabase } from '@tinacms/datalayer';
import { MongodbLevel } from 'mongodb-level';
import { GitHubProvider } from 'tinacms-gitprovider-github';

// Toggled by the package.json scripts. MUST be false/unset in production.
const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';

const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN as string;
const owner = (process.env.GITHUB_OWNER ||
  process.env.VERCEL_GIT_REPO_OWNER) as string;
const repo = (process.env.GITHUB_REPO ||
  process.env.VERCEL_GIT_REPO_SLUG) as string;
const branch = (process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  'main') as string;

// Shared "tina-cms" Atlas cluster hosts every project — keep this dbName
// unique per project so their indexes never collide.
const dbName = 'elemental';

export default isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: new GitHubProvider({
        branch,
        owner,
        repo,
        token,
        // The Next app lives in the landing_wip/ subdir of this repo, so Tina
        // must commit content there (not at the repo root) — otherwise Vercel,
        // which builds from landing_wip, never sees the edits.
        rootPath: 'landing_wip',
      }),
      databaseAdapter: new MongodbLevel<string, Record<string, any>>({
        collectionName: `tinacms-${branch}`,
        dbName,
        mongoUri: process.env.MONGODB_URI as string,
      }),
      namespace: branch,
    });
