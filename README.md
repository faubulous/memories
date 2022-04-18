# Memories

A modern photo and video management app.

## Database
Rebuild the database:

<code>
npx prisma migrate dev --name initialize
</code>

### SQL Queries
<code>
SELECT DISTINCT strftime('%Y', dateModified) year, count(id) n FROM File GROUP BY year ORDER BY year
</code>

## Electron IPC
Source code for https://blog.logrocket.com/electron-ipc-response-request-architecture-with-typescript/

## Index

### Change Detection
The indexer compares the modification timestamps of the folders in the database. If the modification
timestamp is newer than the one in the database, the folder needs to be scanned. Nothing needs to be
done if the timestamps match. We execute the following change detection routines in this specific order: 

#### 1. Created Files
To detect files that were added to the folder, we execute the following steps:

1. List the files in the folder sorted by creation date in descending order
2. Check if the file exists in the database:
 - No: We need to index the file.
 - Yes: We are done.

#### 2. Modified Files
To detect modified files, we execute the following steps:

1. List the files in the folder sorted by modification date in descending order
2. We compare the modification timestamp with the files in the database
 - Different: We need to re-index the file.
 - Match: We are done.

#### 3. Deleted Files
To detect files that were deleted from the folder, we execute the following steps:


## Rendering

### Virtualized Timeline
I have implemented a virtual timeline component based on HTML canvas after my inital attempts to use the virtual scroll feature provided by the Angular CDK turned out to be unsuitable for the following reasons:

- Template bindings were not updated quickly enough to provide a smooth and flicker-free scrolling experience over a large dataset.

- The HTML canvas based solution provides high frame rates even when the browser hardware acceleration is turned off which is the case with Electron.

### Rendering Data Pipeline
The data structures for the timeline renderer need to be optimized for the folling functions:

1. **Get the rendered items**
   - Called in every render cycle
   - Requires to calculate the index of the first visible item from the given scroll offset
   - <code>getFirstVisibleItemIndex(offset: number)</code>
1. **Calculate the translation of the rendered items given the scroll offset**
   - Called in every render cycle
   - Requires to calculate the pixel height of all previous items
   - <code>getVerticalRenderPosition(offset: number = -1)</code>
1. **Calculate the virtual viewport scroll height**
   - Called once when the component is initialized
   - Called everytime the data source changes
   - Requires to calculate the pixel height of all items before the last one
   - <code>getVerticalRenderPosition(offset: number = -1)</code>

Upon initialization, the data source provides a flat list of all items with an initialized date of modification like this:

```
{
    id: 1,
    dateModified: '2022-01-01T00:00:00'
    data: null,
    type: null
}
```

It then emits all these times to the rendering component which then can calculate the total number of items and the required pixel dimensions for the virtual scrolling.

<blockquote>
Please note that the data is initialized with the day portion of the modification date only. This will be overwritten with the exact modification date once the thumbnail data is being loaded. Therefore, the rendering methods need to be able to handle both: partially and fully initialized date strucures.
</blockquote>

Problem:

- Need a projection of the scroll offset to the rendered viewport that can efficiently be computed.
