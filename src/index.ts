import filterAbsolute from './filters/FilterAbsolute';
import buildConfig from './buildConfig';
import filterDate from './filters/FilterDate';
import { getTasksForUser } from './getTasks';

const CONFIG = buildConfig('./config.json', {
    absolute: filterAbsolute,
    date: filterDate,
});

(async () => {
    console.log(CONFIG);
    console.log(await getTasksForUser(CONFIG, '8530756@philasd.org'));
})();
