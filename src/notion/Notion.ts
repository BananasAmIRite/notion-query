import { Client } from '@notionhq/client';
import { queryPage, getUserEmails } from './Page';
import { PageObjectResponse, UserObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import queryDatabase from './Database';
import convertProperties, { StringifiedProperties } from './ConvertProperties';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';

dotenv.config();

export const PageCache = new NodeCache({ stdTTL: 600 });

export interface NotionOptions {
    name: string;
    databases: string[];
    usersField?: string[] | undefined;
    groupsDatabase?: string | undefined;
    groupsField?: string | undefined;
    groupsUserField?: string | undefined;
    keyMap?: { [key: string]: string };
}

export interface Ping {
    recipients: string[];
    result: PageObjectResponse;
}

export const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

export default async function getNotionTasks(
    opts: NotionOptions,
    userEmail: string
): Promise<{ result: PageObjectResponse; converted: StringifiedProperties }[]> {
    const databasesResults = opts.databases.map(async (e) => (await queryDatabase(e)) as PageObjectResponse[]);
    const groups: PageObjectResponse[] = opts.groupsDatabase ? await queryDatabase(opts.groupsDatabase) : [];

    const tasks = [];

    for (const results of databasesResults) {
        for (const result of await results) {
            const users = opts.usersField
                ? opts.usersField.flatMap((field) =>
                      getUserEmails(
                          (
                              result.properties[field] as {
                                  type: 'people';
                                  people: Array<UserObjectResponse>;
                                  id: string;
                              }
                          ).people
                      )
                  )
                : [];
            let groupUsers: (string | undefined)[] = [];
            if (opts.groupsField && opts.groupsUserField) {
                const relation = result.properties[opts.groupsField];
                if (relation.type !== 'relation') throw new Error('Group field type must be a relation');
                const pages = relation.relation.map(async (a) => await queryPage(a.id));

                for (const userPage of pages) {
                    const userPageUsers = (await userPage).properties[opts.groupsUserField];
                    if (userPageUsers.type !== 'people') throw new Error('Group Users field type must be People');
                    groupUsers.push(...getUserEmails(userPageUsers.people as UserObjectResponse[]));
                }
            }

            const recipients: string[] = [...new Set([...users, ...groupUsers])].filter(
                (e) => e !== undefined
            ) as string[];

            if (!recipients.includes(userEmail)) continue;

            const converted = await convertProperties(result);

            tasks.push({ result, converted });
        }
    }

    // add source db key
    for (const task of tasks) {
        task.converted.SourceDatabase = opts.name;
    }

    if (opts.keyMap) {
        // oldName: newName
        for (const task of tasks) {
            for (const [old, newVal] of Object.entries(opts.keyMap)) {
                const taskVal = task.converted[old];
                if (taskVal === undefined || taskVal === null) continue;
                delete task.converted[old];
                task.converted[newVal] = taskVal;
            }
        }
    }

    return tasks;
}

export function formatReminderMessage(props: { [key: string]: string | Array<string> }, message: string): string {
    let newMsg = message;
    return newMsg.replace(/\${(?<MATCH>.[^${}]*)}/g, (substr, key) => {
        const val = props[key];
        return (typeof val === 'string' ? val : val?.join(', ')) ?? '[No value found]';
    });
}
