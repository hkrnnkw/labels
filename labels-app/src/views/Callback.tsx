import React, { FC, useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { StrKeyObj } from '../utils/types';


const Callback: FC = () => {
    const [params, setParams] = useState<StrKeyObj>();

    useEffect(() => {
        const queryStr: string = window.location.search;
        const results: StrKeyObj = getParameters(queryStr);
        setParams(results);
    }, []);

    // クエリ文字列からパラメータを取得
    const getParameters = (queryStr: string): StrKeyObj => {
        const result: StrKeyObj = {};
        const temp = queryStr.substring(1);
        const rawParams: string[] = temp.split('&');
        for (let i = 0; i < rawParams.length; i++) {
            const elem: string[] = rawParams[i].split('=');
            const key: string = decodeURIComponent(elem[0]);
            const value: string = decodeURIComponent(elem[1]);
            result[key] = value;
        }
        return result;
    };

    return (
        <div>
        </div>
    )
};

export default withRouter(Callback);