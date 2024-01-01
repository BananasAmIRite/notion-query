import { StringifiedProperties, propToString } from '../notion/ConvertProperties';
import { FilterOptions } from './useFilter';

export interface FilterAbsoluteOptions extends FilterOptions {
    field: string;
    allowedValues: string[];
}

const filterAbsolute = (options: FilterAbsoluteOptions) => (data: StringifiedProperties) => {
    const ret = options.allowedValues.includes(propToString(data[options.field]));
    return options.invert ? !ret : ret;
};

export default filterAbsolute;
