import { StringifiedProperties } from '../notion/ConvertProperties';
import { FilterOptions } from './useFilter';

export interface FilterDateOptions extends FilterOptions {
    DateField: string;
    Type: 'BETWEEN' | 'BEFORE' | 'AFTER';
}

const filterDate =
    (options: FilterDateOptions) =>
    (data: StringifiedProperties): boolean => {
        const type = options.Type;
        const startField = options.DateField + '-start';
        const endField = options.DateField + '-end';
        let ret;
        if (startField === null || endField === null) ret = false;

        let dateStart = new Date(data[startField] as string).getTime();
        let dateEnd = new Date(data[endField] as string).getTime();

        if (isNaN(dateStart)) dateStart = 0;
        if (isNaN(dateEnd)) dateEnd = dateStart + 24 * 60 * 60 * 1000;

        const nowDate = new Date().getTime();

        ret =
            type === 'BETWEEN'
                ? dateStart <= nowDate && nowDate <= dateEnd
                : type === 'BEFORE'
                ? nowDate <= dateStart
                : nowDate >= dateEnd;
        return options.invert ? !ret : ret;
    };

export default filterDate;
