import { StringifiedProperties } from '../notion/ConvertProperties';

export type FilterFunction = (data: StringifiedProperties) => boolean;

export type FilterCreator = (options: any) => FilterFunction;

export default function useFilter(data: StringifiedProperties[], ...filters: FilterFunction[]) {
    return data.filter((e) => filters.every((filter) => filter(e)));
}
