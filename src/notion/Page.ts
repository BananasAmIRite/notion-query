import {
    PageObjectResponse,
    PersonUserObjectResponse,
    RichTextItemResponse,
    UserObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { PageCache, notion } from './Notion';

export async function queryPage(id: string): Promise<PageObjectResponse> {
    const cached = PageCache.get<PageObjectResponse>(id);

    if (cached) return cached;

    const page = (await notion.pages.retrieve({
        page_id: id,
    })) as PageObjectResponse;

    PageCache.set(page.id, page);
    return page;
}

export function getPageTitle(page: PageObjectResponse) {
    const pageTitle = Object.values(page.properties).find((e) => e.type === 'title') as {
        type: 'title';
        title: Array<RichTextItemResponse>;
        id: string;
    };
    const condensedTitle = pageTitle.title.map((e) => e.plain_text).join(' ');
    return condensedTitle;
}

export function getUserEmails(objs: Array<UserObjectResponse>) {
    return objs.map((e) => (e as PersonUserObjectResponse).person?.email);
}
