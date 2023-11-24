import { PageObjectResponse, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { PageCache, notion } from './Notion';

export default async function queryDatabase(id: string) {
    let results = [];
    let hasNext = false;
    let start_cursor = undefined;
    do {
        const db = (await notion.databases.query({
            database_id: id,
            start_cursor: start_cursor,
            page_size: 100,
        })) as QueryDatabaseResponse;
        results.push(...(db.results as PageObjectResponse[]));
        hasNext = db.has_more;
        start_cursor = db.next_cursor ?? undefined;
    } while (hasNext);

    for (const result of results) {
        PageCache.set(result.id, result);
    }
    return results;
}
