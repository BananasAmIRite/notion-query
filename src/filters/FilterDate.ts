import { StringifiedProperties } from '../notion/ConvertProperties';

export interface FilterDateOptions {
    DateField: string;
}

const filterDate =
    (options: FilterDateOptions) =>
    (data: StringifiedProperties): boolean => {
        const startField = options.DateField + '-start';
        const endField = options.DateField + '-end';
        return true;
    };

export default filterDate;
