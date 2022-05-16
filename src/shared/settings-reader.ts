import * as fs from 'fs';
import { Settings } from "./settings";

export class SettingsReader {
    async read(settingsFile: string): Promise<Settings> {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(settingsFile)) {
                reject(new Error('File does not exist: ' + settingsFile));
            }

            try {
                const data = fs.readFileSync(settingsFile).toString();

                const result = Object.assign(new Settings(), JSON.parse(data));

                resolve(result);
            }
            catch (error) {
                reject(error);
            }
        })
    }
}