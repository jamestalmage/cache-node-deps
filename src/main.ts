import * as core from '@actions/core';
import fs from 'fs';
import * as path from 'path';
import {restoreCache} from './restore-cache';
import {isCacheFeatureAvailable} from './cache-utils';
import {isPackageManager, PackageManager, State} from './constants';

export async function run() {
  try {
    const packageManager = core.getInput('package-manager');

    const cacheDependencyPath = core.getInput('cache-dependency-path');

    if (isCacheFeatureAvailable()) {
      if (packageManager) {
        if (!isPackageManager(packageManager)) {
          throw new Error(
            `Invalid package manager specified: ${packageManager}`
          );
        }
        core.saveState(State.CachePackageManager, packageManager);
        await restoreCache(packageManager, cacheDependencyPath);
        return;
      }

      const resolvedPackageManager = getNameFromPackageManagerField();
      if (!resolvedPackageManager) {
        core.warning(
          'Could not determine package manager from package.json. Skipping cache restore.'
        );
        return;
      }

      core.warning(
        `Using package manager "${resolvedPackageManager}" resolved from package.json for cache restore.`
      );

      core.saveState(State.CachePackageManager, resolvedPackageManager);

      await restoreCache(resolvedPackageManager, cacheDependencyPath);
    }
  } catch (err) {
    core.setFailed((err as Error).message);
  }
}

function pmName(pmField: string): PackageManager | undefined {
  const npmRegex = /^(\^)?npm(@.*)?$/; // matches "npm", "npm@...", "^npm@..."
  if (npmRegex.test(pmField)) {
    return 'npm';
  }
  const pnpmRegex = /^(\^)?pnpm(@.*)?$/; // matches "pnpm", "pnpm@...", "^pnpm@..."
  if (pnpmRegex.test(pmField)) {
    return 'pnpm';
  }
  const yarnRegex = /^(\^)?yarn(@.*)?$/; // matches "yarn", "yarn@...", "^yarn@..."
  if (yarnRegex.test(pmField)) {
    return 'yarn';
  }
  return undefined;
}

export function getNameFromPackageManagerField(): PackageManager | undefined {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(
        path.join(process.env.GITHUB_WORKSPACE!, 'package.json'),
        'utf-8'
      )
    );

    // Check devEngines.packageManager first (object or array)
    const devPM = packageJson?.devEngines?.packageManager;
    const devPMArray = devPM ? (Array.isArray(devPM) ? devPM : [devPM]) : [];
    for (const obj of devPMArray) {
      if (typeof obj?.name === 'string' && pmName(obj?.name)) {
        return pmName(obj.name);
      }
    }

    // Check top-level packageManager
    const topLevelPM = packageJson?.packageManager;
    if (typeof topLevelPM === 'string' && pmName(topLevelPM)) {
      return pmName(topLevelPM);
    }

    return undefined;
  } catch {
    return undefined;
  }
}
