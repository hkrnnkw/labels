import { Label, LabelEntry, SortOrder } from "../utils/types";

export const sortHandler = (label: Label, order: SortOrder): LabelEntry[] => {
    const entries: LabelEntry[] = Object.entries(label);
    switch (order) {
        case 'DateAsc': return sortDate(entries);
        case 'DateDesc': return sortDate(entries, true);
        case 'NameAsc': return sortLabelName(entries);
        case 'NameDesc': return sortLabelName(entries, true);
        default: return entries;
    }
};

// フォローした日時でソート
const sortDate = (entries: LabelEntry[], desc: boolean = false): LabelEntry[] => {
    return entries.sort((a: LabelEntry, b: LabelEntry) => {
        const aDate = a[1].date, bDate = b[1].date;
        return desc ?
            (aDate > bDate ? -1 : aDate < bDate ? 1 : 0)    // 降順
            :
            (aDate < bDate ? -1 : aDate > bDate ? 1 : 0);   // 昇順
    });
};

// （大文字・小文字を区別せず）レーベル名でソート
const sortLabelName = (entries: LabelEntry[], desc: boolean = false): LabelEntry[] => {
    return entries.sort((a: LabelEntry, b: LabelEntry) => {
        const aKey = a[0], bKey = b[0];
        return desc ?
            (aKey > bKey ? -1 : aKey < bKey ? 1 : 0)    // 降順
            :
            (aKey < bKey ? -1 : aKey > bKey ? 1 : 0);   // 昇順
    })
};