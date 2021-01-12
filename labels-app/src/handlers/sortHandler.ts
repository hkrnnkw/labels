import { Favorite, Label, SortOrder } from "../utils/types";

export const sortHandler = (entries: [string, Favorite][], order: SortOrder): Label => {
    switch (order) {
        case 'DateAsc': return sortDate(entries);
        case 'DateDesc': return sortDate(entries, true);
        case 'NameAsc': return sortLabelName(entries);
        case 'NameDesc': return sortLabelName(entries, true);
        default: return {};
    }
};

// フォローした日時でソート
const sortDate = (entries: [string, Favorite][], desc: boolean = false): Label => {
    entries.sort((a: [string, Favorite], b: [string, Favorite]) => {
        const aDate = a[1].date, bDate = b[1].date;
        return desc ?
            (aDate > bDate ? -1 : aDate < bDate ? 1 : 0)    // 降順
            :
            (aDate < bDate ? -1 : aDate > bDate ? 1 : 0);   // 昇順
    });
    return Object.fromEntries(entries);
};

// （大文字・小文字を区別せず）レーベル名でソート
const sortLabelName = (entries: [string, Favorite][], desc: boolean = false): Label => {
    entries.sort((a: [string, Favorite], b: [string, Favorite]) => {
        const aKey = a[0], bKey = b[0];
        return desc ?
            (aKey > bKey ? -1 : aKey < bKey ? 1 : 0)    // 降順
            :
            (aKey < bKey ? -1 : aKey > bKey ? 1 : 0);   // 昇順
    })
    return Object.fromEntries(entries);
};