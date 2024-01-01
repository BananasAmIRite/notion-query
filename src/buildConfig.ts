import { FilterCreator, FilterFunction } from './filters/useFilter';
import { NotionOptions } from './notion/Notion';
import { readFileSync } from 'fs';

export type QueryConfig = {
    dbQueryParams: NotionOptions[];
    presets: { name: string; filters: FilterFunction[] }[];
    messageTemplate: string;
};

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

    const presets = json.presets.map((e: any) => ({
        ...e,
        filters: e.filters.map((i) => filterMap[i.type](i.options)),
    }));

    return { dbQueryParams: notionOptions, presets, messageTemplate: json.messageTemplate };
}
