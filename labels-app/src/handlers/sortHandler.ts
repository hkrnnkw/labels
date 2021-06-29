import { Label, LabelEntry, SortOrder } from "../utils/types";

export const RF = 'Recently followed';
export const ABC = 'Alphabetical';

export const sortHandler = (label: Label, order: SortOrder): LabelEntry[] => {
    const entries: LabelEntry[] = Object.entries(label);
    switch (order) {
        case RF: return sortDate(entries);
        case ABC: return sortLabelName(entries);
    }
};

// フォローした日時で降順ソート
const sortDate = (entries: LabelEntry[]): LabelEntry[] => {
    return entries.sort((a: LabelEntry, b: LabelEntry) => {
        const aDate = a[1].date, bDate = b[1].date;
        return (aDate > bDate ? -1 : aDate < bDate ? 1 : 0);
    });
};

// （大文字・小文字を区別せず）レーベル名で昇順ソート
const sortLabelName = (entries: LabelEntry[]): LabelEntry[] => {
    return entries.sort((a: LabelEntry, b: LabelEntry) => {
        const aKey = a[0], bKey = b[0];
        return (aKey < bKey ? -1 : aKey > bKey ? 1 : 0);
    });
};