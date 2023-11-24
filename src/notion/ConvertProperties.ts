import { UserObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { queryPage, getPageTitle } from './Page';

export type StringifiedProperties = { [key: string]: string | string[] };

export function propToString(prop: string | string[]) {
    return typeof prop === 'string' ? prop : prop.join(', ');
}

export default async function stringifyProperties(page: PageObjectResponse): Promise<StringifiedProperties> {
    const vals: StringifiedProperties = {};

    const props = page.properties;

    await Promise.all(
        Object.entries(props).map(async (prop) => {
            const val = prop[1];
            switch (val.type) {
                case 'number':
                    vals[prop[0]] = `${val.number}`;
                    break;
                case 'url':
                    vals[prop[0]] = val.url ?? '';
                    break;
                case 'select':
                    vals[prop[0]] = val.select?.name ?? '';
                    break;
                case 'multi_select':
                    vals[prop[0]] = val.multi_select.map((e) => e.name);
                    break;
                case 'status':
                    vals[prop[0]] = val.status?.name ?? '';
                    break;
                case 'date':
                    vals[prop[0] + '-start'] = val.date?.start.toString() ?? '';
                    vals[prop[0] + '-end'] = val.date?.end?.toString() ?? '';
                    break;
                case 'email':
                    vals[prop[0]] = val.email ?? '';
                    break;
                case 'phone_number':
                    vals[prop[0]] = val.phone_number ?? '';
                    break;
                case 'checkbox':
                    vals[prop[0]] = `${val.checkbox}`;
                    break;
                case 'files':
                    vals[prop[0]] = val.files.map((e) => e.name);
                    break;
                case 'created_by':
                    vals[prop[0]] = (val.created_by as UserObjectResponse).name ?? '';
                    break;
                case 'created_time':
                    vals[prop[0]] = val.created_time;
                    break;
                case 'last_edited_by':
                    vals[prop[0]] = (val.last_edited_by as UserObjectResponse).name ?? '';
                    break;
                case 'last_edited_time':
                    vals[prop[0]] = val.last_edited_time;
                    break;
                case 'formula':
                    switch (val.formula.type) {
                        case 'string':
                            vals[prop[0]] = val.formula.string ?? '';
                            break;
                        case 'date':
                            vals[prop[0]] = val.formula.date?.start.toString() ?? '';
                            break;
                        case 'number':
                            vals[prop[0]] = `${val.formula.number}`;
                            break;
                        case 'boolean':
                            vals[prop[0]] = `${val.formula.boolean}`;
                            break;
                    }
                    break;
                case 'unique_id':
                    vals[prop[0]] = `${val.unique_id.prefix}_${val.unique_id.number}`;
                    break;
                case 'title':
                    vals[prop[0]] = val.title.map((e) => e.plain_text).join('\n');
                    break;
                case 'rich_text':
                    vals[prop[0]] = val.rich_text.map((e) => e.plain_text).join('\n');
                    break;
                case 'people':
                    vals[prop[0]] = (val.people as UserObjectResponse[]).map((e) => e.name as string);
                    break;
                case 'relation':
                    vals[prop[0]] = await Promise.all(
                        val.relation.map(async (e) => getPageTitle(await queryPage(e.id)))
                    );
                    break;
                case 'verification':
                case 'rollup':
                default:
                    break;
            }
        })
    );

    // add custom properties

    // page url
    vals['page_url'] = page.url;

    return vals;
}
