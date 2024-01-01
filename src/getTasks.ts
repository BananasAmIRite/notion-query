import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { QueryConfig } from './buildConfig';
import getNotionTasks from './notion/Notion';
import useFilter, { FilterFunction } from './filters/useFilter';
import { StringifiedProperties } from './notion/ConvertProperties';

export const getTasksForUser = async (
    config: QueryConfig,
    email: string,
    filterPreset: string,
    ...addedFilters: FilterFunction[]
) => {
    const data: {
        result: PageObjectResponse;
        converted: StringifiedProperties;
    }[] = [];
    await Promise.all(
        config.dbQueryParams.map(async (e) => {
            const datum = await getNotionTasks(e, email);
            data.push(...datum);
        })
    );

    return useFilter(
        data.map((e) => e.converted),
        ...(config.presets.find((e) => e.name === filterPreset)?.filters ?? []),
        ...addedFilters
    );
};
