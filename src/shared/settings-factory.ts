import { getSettingsFilePath, initializeApplicationDataDirectory } from "../env";
import { Settings } from "./settings";
import { SettingsReader } from "./settings-reader";
import * as fs from "fs";
import { SettingsWriter } from "./settings-writer";

export class SettingsFactory {
    async getApplicationSettings(): Promise<Settings> {
        initializeApplicationDataDirectory();

        const settingsFile = getSettingsFilePath();

        if(!fs.existsSync(settingsFile)) {
            const defaultSettings = new Settings();

            await new SettingsWriter().write(defaultSettings);
        }

        return new SettingsReader().read(settingsFile);
    }
}