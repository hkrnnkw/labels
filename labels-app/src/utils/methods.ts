import { FavLabel, SortOrder } from "./types";

export const sortHandler = (array: FavLabel[], order: SortOrder): FavLabel[] => {
    switch (order) {
        case 'DateAsc': return sortDate(array);
        case 'DateDesc': return sortDate(array, true);
        case 'NameAsc': return sortLabelName(array);
        case 'NameDesc': return sortLabelName(array, true);
        default: return [];
    }
};

// フォローした日時でソート
const sortDate = (array: FavLabel[], desc: boolean = false): FavLabel[] => {
    return array.sort((a: FavLabel, b: FavLabel) => {
        const aa = a.date, bb = b.date;
        return desc ?
            (aa > bb ? -1 : aa < bb ? 1 : 0)    // 降順
            :
            (aa < bb ? -1 : aa > bb ? 1 : 0);   // 昇順
    });
};

// （大文字・小文字を区別せず）レーベル名でソート
const sortLabelName = (array: FavLabel[], desc: boolean = false): FavLabel[] => {
    return array.sort((a: FavLabel, b: FavLabel) => {
        const aa = a.labelName.toLowerCase(), bb = b.labelName.toLowerCase();
        return desc ?
            (aa > bb ? -1 : aa < bb ? 1 : 0)    // 降順
            :
            (aa < bb ? -1 : aa > bb ? 1 : 0);   // 昇順
    })
};