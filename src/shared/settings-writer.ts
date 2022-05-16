import { getSettingsFilePath } from "../env";
import { Settings } from "./settings";
import * as fs from "fs";

export class SettingsWriter {
    async write(settings: Settings): Promise<number> {
        return new Promise((resolve, reject) => {
            const path = getSettingsFilePath();

            const data = JSON.stringify(settings);

            fs.writeFile(path, data, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data.length);
                }
            });
        });
    }
}