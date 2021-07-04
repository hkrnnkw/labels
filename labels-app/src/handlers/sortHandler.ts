import { Label, SortOrder } from "../utils/types";

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
    return labelList.sort((a: Label, b: Label) => {
        const aDate = a.date, bDate = b.date;
        return (aDate > bDate ? -1 : aDate < bDate ? 1 : 0);
    });
};

// （大文字・小文字を区別せず）レーベル名で昇順ソート
const sortAlphabetical = (labelList: Label[]): Label[] => {
    return labelList.sort((a: Label, b: Label) => {
        const aKey = a.name, bKey = b.name;
        return (aKey < bKey ? -1 : aKey > bKey ? 1 : 0);
    });
};

const sortNumOfNewReleases = (labelList: Label[]): Label[] => {
    return labelList.sort((a: Label, b: Label) => {
        const aNum = a.newReleases.length, bNum = b.newReleases.length;
        return (aNum > bNum ? -1 : aNum < bNum ? 1 : 0);
    });
};