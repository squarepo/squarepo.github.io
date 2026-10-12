import { join, dirname } from 'pathe';
import LightningFS from "@isomorphic-git/lightning-fs";
import { DEFAULT_SETTINGS } from '~/defaults/settings';
import { mergeSettings } from '~/utils/mergeSettings';

export class SettingsService {

  constructor(private filesystem: LightningFS.PromisifiedFS) {}

  async getSettings(directoryPath: string) {
    const directories: string[] = [];
    let current = directoryPath;

    // Monta a hierarquia do diretório até a raiz.
    while (true) {
      directories.push(current);

      if (current === '/') break;

      const parent = dirname(current);

      if (parent === current) break;

      current = parent;
    }

    // Aplica da raiz até o diretório mais específico.
    directories.reverse();

    let settings = DEFAULT_SETTINGS;

    for (const directory of directories) {
      const settingsPath = join(
        directory,
        'settings.json',
      );

      let content: string;

      try {
        content = await this.filesystem.readFile(
          settingsPath,
          'utf8',
        );
      } catch (error: any) {
        if (error?.code === 'ENOENT') {
          continue;
        }

        throw error;
      }

      const localSettings = JSON.parse(content);

      settings = mergeSettings(
        settings,
        localSettings,
      );
    }

    return settings;
  }
}