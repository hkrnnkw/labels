import { Album } from "../utils/interfaces";
import { Label, SortOrder, Year } from "../utils/types";

export const RF = 'Recently followed';
export const ABC = 'Alphabetical';
export const NNR = 'Number of new releases';

export const sortHandler = (labelList: Label[], order: SortOrder): Label[] => {
    switch (order) {
        case RF: return sortRecentlyFollowed(labelList);
        case ABC: return sortAlphabetical(labelList);
        case NNR: return sortNumOfNewReleases(labelList);
    }
};

// フォローした日時で降順ソート
const sortRecentlyFollowed = (labelList: Label[]): Label[] => {
    const arrayForSort: Label[] = [...labelList];
    return arrayForSort.sort((a: Label, b: Label) => {
        const aDate = a.date, bDate = b.date;
        return (aDate > bDate ? -1 : aDate < bDate ? 1 : 0);
    });
};

// （大文字・小文字を区別せず）レーベル名で昇順ソート
const sortAlphabetical = (labelList: Label[]): Label[] => {
    const arrayForSort: Label[] = [...labelList];
    return arrayForSort.sort((a: Label, b: Label) => {
        const aKey = a.name, bKey = b.name;
        return (aKey < bKey ? -1 : aKey > bKey ? 1 : 0);
    });
};

// 新リリースの多い順にソート
const sortNumOfNewReleases = (labelList: Label[]): Label[] => {
    const arrayForSort: Label[] = [...labelList];
    return arrayForSort.sort((a: Label, b: Label) => {
        const aNum = a.newReleases.length, bNum = b.newReleases.length;
        return (aNum > bNum ? -1 : aNum < bNum ? 1 : 0);
    });
};

// 年順（降順）ソート
export const sortYears = (years: Year): [string, Album[]][] => {
    const entries: [string, Album[]][] = Object.entries(years);
    return entries.sort((a, b) => a[0] > b[0] ? -1 : a[0] < b[0] ? 1 : 0);
};