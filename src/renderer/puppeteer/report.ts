import { NetworkReportEntry } from '../../';
const report_item = (name: string): NetworkReportEntry => {
    return {
        name: name,
        value: 0,
        formatted: '',
        count: 0,
        cached_count: 0,
        external_count: 0,
        local_count: 0,
        times: {
            end: 0,
            formatted: ''
        }
    }
}

export const report = () => {
    return [
        report_item('Received Total'),
        report_item('Received Stylesheets'),
        report_item('Received Scripts'),
        report_item('Received HTML'),
        report_item('Received JSON'),
        report_item('Received Images'),
        report_item('Received Fonts'),
        report_item('Received Binary')
    ]
}

export const find_report = (where: any[], name: string) => where.find((media) => media.name === name);

export const get_report = (where: any[], type: string) => {
    let record = find_report(where, type);
    if (!record) {
        record = report_item(type);
        where.push(record);
    }
    return record;
}