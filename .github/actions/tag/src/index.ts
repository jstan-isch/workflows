import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'node:fs';

function isCommitSHA(ref: string): boolean {
  return /^[0-9a-f]{7,40}$/i.test(ref);
}

function extractRefFromGitSource(source: string): string | null {
  const queryStart = source.indexOf('?');
  if (queryStart === -1) return null;
  const queryString = source.substring(queryStart + 1).replace(/["']$/, '');
  const params = new URLSearchParams(queryString);
  return params.get('ref');
}

function isCommented(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('#') || trimmed.startsWith('//');
}

async function run(): Promise<void> {
  const changedFilesInput = core.getInput('changed_files');
  console.log(changedFilesInput)
  const githubToken = core.getInput('github_token');
  const octokit = github.getOctokit(githubToken);
  const pr = github.context.payload.pull_request;

  const invalidRefs: string[] = [];

  const changedFiles = changedFilesInput
    .split(/\s+/)
    .map(f => f.trim())
    .filter(f => f.endsWith('.tf') && fs.existsSync(f));

  for (const file of changedFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      if (
        isCommented(line) ||
        !line.includes('source') ||
        !line.includes('git@github.com:one-code') ||
        !line.includes('?ref=')
      ) {
        continue;
      }

      const ref = extractRefFromGitSource(line);
      if (ref && isCommitSHA(ref)) {
        invalidRefs.push(`${file}: \`${ref}\``);
      }
    }
  }

  if (invalidRefs.length > 0) {
    const body = [
      '🚨 **Invalid Module Refs Detected**',
      '',
      'The following Terraform files use a commit SHA instead of a tag in their Git module source:',
      '',
      ...invalidRefs.map(item => `- ${item}`),
      '',
      'Please update these references to use version tags (e.g. `?ref=v1.0.0`).'
    ].join('\n');

    if (pr) {
      await octokit.rest.issues.createComment({
        ...github.context.repo,
        issue_number: pr.number,
        body
      });
      core.setFailed('Found invalid module refs.');
    } else {
      core.warning('No PR context. Skipping comment.');
      core.setFailed('Found invalid module refs.');
    }
  } else {
    core.info('✅ All module refs are valid.');
  }
}

run();
