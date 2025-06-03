import * as core from '@actions/core';
import * as fs from 'fs';

function isSHA(ref: string): boolean {
  return /^[0-9a-f]{40}$/i.test(ref);
}

function extractModuleRefs(content: string): string[] {
  const regex = /source\s*=\s*["']git@[^?]+ref=([^"']+)["']/g;
  const refs: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (!match[0].trim().startsWith('#')) {
      refs.push(match[1]);
    }
  }

  return refs;
}

function fileContainsSHAReference(filePath: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');
  const refs = extractModuleRefs(content);
  return refs.some(ref => isSHA(ref));
}

async function run() {
  try{
    const changedFilesInput = core.getInput('changedFiles');
    const changedFiles = changedFilesInput
    .split(' ')
    .map((line) => (line.trim()))
    .filter((line) => line.endsWith('.tf'))

    console.log(`These are the changed files: ${changedFiles}`)
  } catch (error: any){
    core.setFailed(`Action failed: ${error.message}`)
  }
}

// async function run(): Promise<void> {
//   try {
//     const input = core.getInput('changed_files');
//     const files: string[] = JSON.parse(input);
//     const badFiles: string[] = [];

//     for (const file of files) {
//       if (
//         (file.endsWith('.tf') || file.endsWith('.tfvars')) &&
//         fs.existsSync(file)
//       ) {
//         if (fileContainsSHAReference(file)) {
//           badFiles.push(file);
//         }
//       }
//     }

//     if (badFiles.length > 0) {
//       const message = [
//         '🚫 Terraform modules referencing SHAs were found in the following files:',
//         ...badFiles.map(f => `- ${f}`),
//         '',
//         'Please use version tags like `?ref=v1.2.3` instead of commit SHAs.',
//       ].join('\n');

//       core.setFailed(message);
//     } else {
//       core.info('✅ All Terraform module references use version tags.');
//     }
//   } catch (error: any) {
//     core.setFailed(`Unhandled error: ${error.message}`);
//   }
// }

run();
