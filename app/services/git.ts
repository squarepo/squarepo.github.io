import LightningFS from "@isomorphic-git/lightning-fs";
import git from "isomorphic-git";
import http from "isomorphic-git/http/web";

export class GitService {
  
  constructor(private filesystem: LightningFS.PromisifiedFS) {}

  async listBranches(path: string) {
    return await git.listBranches({
      fs: this.filesystem,
      dir: path
    });
  }

  async getGitLog(path: string) {
    return await git.log({
      fs: this.filesystem,
      dir: path
    });
  }

  async initializeRepository(path: string) {
    await git.init({
      fs: this.filesystem,
      dir: path
    });
  }

  async cloneRepository(path: string, url: string) {
    await git.clone({
      fs: this.filesystem,
      http,
      dir: path,
      url,
      corsProxy: "https://cors.isomorphic-git.org" // just for testing
    });
  }

}