import React, { FC, useState, useEffect } from 'react';
import { withRouter } from 'react-router';

type StrKeyObj = {[key: string]: string};

const Callback: FC = () => {
    const [params, setParams] = useState<StrKeyObj>();

    useEffect(() => {
        const queryStr: string = window.location.search;
        const results: StrKeyObj = getParameters(queryStr);
        setParams(results);
    }, []);

    // クエリ文字列からパラメータを取得
    const getParameters = (queryStr: string): StrKeyObj => {
        const queryObj: StrKeyObj = {};
        queryStr = queryStr.substring(1);
        const rawParams: string[] = queryStr.split('&');
        for (let i = 0; i < rawParams.length; i++) {
            const elem: string[] = rawParams[i].split('=');
            const key: string = decodeURIComponent(elem[0]);
            const value: string = decodeURIComponent(elem[1]);
            queryObj[key] = value;
        }
        return queryObj;
    };

    return (
        <div>
        </div>
    )
};

export default withRouter(Callback);