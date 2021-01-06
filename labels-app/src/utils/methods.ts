import { FavLabel } from "./types";

// （大文字・小文字を区別せず）レーベル名でソート
export const sortLabelName = (array: FavLabel[], desc: boolean = false): FavLabel[] => {
    return array.sort((a: FavLabel, b: FavLabel) => {
        const aa = a.labelName.toLowerCase(), bb = b.labelName.toLowerCase();
        return desc ?
            (aa > bb ? -1 : aa < bb ? 1 : 0)    // 降順
            :
            (aa < bb ? -1 : aa > bb ? 1 : 0);   // 昇順
    })
};