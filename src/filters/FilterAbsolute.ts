import { StringifiedProperties, propToString } from '../notion/ConvertProperties';

export interface FilterAbsoluteOptions {
    field: string;
    allowedValues: string[];
}

const filterAbsolute = (options: FilterAbsoluteOptions) => (data: StringifiedProperties) => {
    return options.allowedValues.includes(propToString(data[options.field]));
};

export default filterAbsolute;
