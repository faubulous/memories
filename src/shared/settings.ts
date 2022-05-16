export class Settings {
    indexer: IndexerSettings = new IndexerSettings();
}

export class IndexerSettings {
    includedPaths: string[] = [];
}