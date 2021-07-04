import { Label, LabelEntry, SortOrder } from "../utils/types";

export const RF = 'Recently followed';
export const ABC = 'Alphabetical';
export const NNR = 'Number of new releases';

export const sortHandler = (entries: LabelEntry[], order: SortOrder): LabelEntry[] => {
    switch (order) {
        case RF: return sortRecentlyFollowed(entries);
        case ABC: return sortAlphabetical(entries);
        case NNR: return sortNumOfNewReleases(entries);
    }
};

// フォローした日時で降順ソート
const sortRecentlyFollowed = (entries: LabelEntry[]): LabelEntry[] => {
    return entries.sort((a: LabelEntry, b: LabelEntry) => {
        const aDate = a[1].date, bDate = b[1].date;
        return (aDate > bDate ? -1 : aDate < bDate ? 1 : 0);
    });
};

// （大文字・小文字を区別せず）レーベル名で昇順ソート
const sortAlphabetical = (entries: LabelEntry[]): LabelEntry[] => {
    return entries.sort((a: LabelEntry, b: LabelEntry) => {
        const aKey = a[0], bKey = b[0];
        return (aKey < bKey ? -1 : aKey > bKey ? 1 : 0);
    });
};

const sortNumOfNewReleases = (entries: LabelEntry[]): LabelEntry[] => {
    return entries.sort((a: LabelEntry, b: LabelEntry) => {
        const aNum = a[1].newReleases.length, bNum = b[1].newReleases.length;
        return (aNum > bNum ? -1 : aNum < bNum ? 1 : 0);
    });
};