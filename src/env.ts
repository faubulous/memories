import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Ensure that the application data directory exists and try to create it if not.
 * @returns The existing application data directory path.
 */
export function initializeApplicationDataDirectory() {
    const path = getApplictionDataDirectory();

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }

    return path;
}

/**
 * Get the path to the application data directory which is usually located in the user home folder.
 * @returns The path to the application data directory.
 */
export function getApplictionDataDirectory() {
    return path.join(os.homedir(), '.memories');
}

/**
 * Get the path to the application settings file.
 * @returns The path of the settings file.
 */
export function getSettingsFilePath() {
    return path.join(getApplictionDataDirectory(), 'settings.json');
}