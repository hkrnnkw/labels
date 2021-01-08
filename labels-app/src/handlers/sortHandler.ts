import { Home, SortOrder } from "../utils/types";

export const sortHandler = (array: Home[], order: SortOrder): Home[] => {
    switch (order) {
        case 'DateAsc': return sortDate(array);
        case 'DateDesc': return sortDate(array, true);
        case 'NameAsc': return sortLabelName(array);
        case 'NameDesc': return sortLabelName(array, true);
        default: return [];
    }
};

// フォローした日時でソート
const sortDate = (array: Home[], desc: boolean = false): Home[] => {
    return array.slice().sort((a: Home, b: Home) => {
        const aa = a.dateOfFollow, bb = b.dateOfFollow;
        return desc ?
            (aa > bb ? -1 : aa < bb ? 1 : 0)    // 降順
            :
            (aa < bb ? -1 : aa > bb ? 1 : 0);   // 昇順
    });
};

// （大文字・小文字を区別せず）レーベル名でソート
const sortLabelName = (array: Home[], desc: boolean = false): Home[] => {
    return array.slice().sort((a: Home, b: Home) => {
        const aa = a.name.toLowerCase(), bb = b.name.toLowerCase();
        return desc ?
            (aa > bb ? -1 : aa < bb ? 1 : 0)    // 降順
            :
            (aa < bb ? -1 : aa > bb ? 1 : 0);   // 昇順
    })
};