import { FilterCreator, FilterFunction } from './filters/useFilter';
import { NotionOptions } from './notion/Notion';
import { readFileSync } from 'fs';

export type QueryConfig = { dbQueryParams: NotionOptions[]; filters: FilterFunction[] };

export default function buildConfig(file: string, filterMap: { [key: string]: FilterCreator }): QueryConfig {
    const json = JSON.parse(readFileSync(file, 'utf-8'));

    const groups = json.groups;

    const notionOptions = json.databases.map((e: any) => {
        const group = groups.find((a: any) => a.groupsDbId === e.groupsId);
        return {
            name: e.name,
            databases: [e.id],
            usersField: e.usersField,
            groupsDatabase: e.groupsId,
            groupsField: e.groupsField,
            groupsUserField: group?.groupsUsersField,
            keyMap: e.keyMap,
        };
    });

    const filters = json.filters.map((e: any) => filterMap[e.type](e.options));

    return { dbQueryParams: notionOptions, filters };
}
